import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AutentiqueService {
  private readonly logger = new Logger(AutentiqueService.name);
  private readonly apiUrl = 'https://api.autentique.com.br/v2/graphql';
  private readonly token = process.env.AUTENTIQUE_TOKEN;

  async criarContrato(
    nomeContrato: string,
    signatarios: { email: string; name?: string; action?: string }[],
    arquivoBuffer: Buffer,
    nomeArquivo: string,
  ) {
    // Usa apenas "name" (sem email) para que o short_link seja retornado na resposta.
    // Se enviar "email", a Autentique envia o link por email e o short_link volta null.
    const signersPayload = signatarios.map((s) => ({
      name: s.name ?? s.email,
      action: s.action ?? 'SIGN',
    }));

    this.logger.log(`Signers payload (sem email): ${JSON.stringify(signersPayload)}`);

    const operations = JSON.stringify({
      query: `
        mutation CreateDocumentMutation(
          $document: DocumentInput!,
          $signers: [SignerInput!]!,
          $file: Upload!
        ) {
          createDocument(
            sandbox: true,
            document: $document,
            signers: $signers,
            file: $file
          ) {
            id
            name
            signatures {
              public_id
              name
              email
              action { name }
              link { short_link }
            }
          }
        }
      `,
      variables: {
        document: { name: nomeContrato },
        signers: signersPayload,
        file: null,
      },
    });

    const map = JSON.stringify({
      '0': ['variables.file'],
    });

    // Usa boundary manual em vez de FormData + Blob (mais confiavel no Node.js)
    const boundary = `----AutentiqueBoundary${Date.now()}`;
    const CRLF = '\r\n';

    const parts: Buffer[] = [];

    // operations
    parts.push(Buffer.from([
      `--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="operations"${CRLF}`,
      `Content-Type: application/json${CRLF}${CRLF}`,
      operations,
      CRLF,
    ].join('')));

    // map
    parts.push(Buffer.from([
      `--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="map"${CRLF}`,
      `Content-Type: application/json${CRLF}${CRLF}`,
      map,
      CRLF,
    ].join('')));

    // file (part 0)
    parts.push(Buffer.from([
      `--${boundary}${CRLF}`,
      `Content-Disposition: form-data; name="0"; filename="${nomeArquivo}"${CRLF}`,
      `Content-Type: application/pdf${CRLF}${CRLF}`,
    ].join('')));
    parts.push(arquivoBuffer);
    parts.push(Buffer.from(`${CRLF}--${boundary}--${CRLF}`));

    const body = Buffer.concat(parts);

    this.logger.log(`Enviando multipart (${body.length} bytes) para Autentique...`);
    this.logger.log(`Token presente: ${this.token ? 'SIM (comeca com ' + this.token.substring(0, 8) + '...)' : 'NAO - AUTENTIQUE_TOKEN nao definido!'}`);

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const data = await response.json();
    this.logger.log(`Resposta Autentique status: ${response.status}`);

    if (data.errors) {
      this.logger.error('Erro na API do Autentique:', JSON.stringify(data.errors));
      throw new Error('Falha ao criar o documento no Autentique.');
    }

    const doc = data.data?.createDocument;
    if (!doc) {
      this.logger.error('createDocument veio null/undefined. Resposta completa:', JSON.stringify(data));
      throw new Error('Resposta inesperada da API do Autentique.');
    }

    this.logger.log(`Documento criado: id=${doc.id}`);
    this.logger.log(`Signatures brutas: ${JSON.stringify(doc.signatures)}`);

    // Filtra a assinatura do dono do token (name=null) e mapeia emails por nome.
    // A API da Autentique adiciona uma assinatura extra (indice 0) para o owner do token.
    const emailByName = new Map(signatarios.map((s) => [s.name ?? s.email, s.email]));

    const signaturesWithLinks: any[] = (doc.signatures ?? [])
      .filter((sig: any) => emailByName.has(sig.name))
      .map((sig: any) => {
        const shortLink = sig.link?.short_link ?? null;
        const email = emailByName.get(sig.name) ?? null;
        this.logger.log(`Signature mapeada: name=${sig.name}, email=${email}, short_link=${shortLink}`);
        return {
          ...sig,
          email,
          sign_url: shortLink,
        };
      });

    return {
      ...doc,
      signatures: signaturesWithLinks,
    };
  }
}
