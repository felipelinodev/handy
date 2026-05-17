import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as path from 'path';
import * as fs from 'fs';

export interface ContractPdfData {
  titulo: string;
  clienteNome: string;
  prestadorNome: string;
  servicoNome: string;
  preco: string;
  modo?: string;
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
}

// Paleta de cores Handy
const C = {
  primary: '#4A1D96',
  primaryLight: '#7C3AED',
  dark: '#1a1a2e',
  text: '#2d2d3f',
  muted: '#6b7280',
  border: '#e5e7eb',
  bgLight: '#F8F6FF',
  white: '#FFFFFF',
  black: '#000000',
};

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  private resolveLogoPath(): string | null {
    const candidates = [
      path.join(process.cwd(), 'src', 'contratations', 'integrations', 'pdf', 'logo_handy.png'),
      path.join(process.cwd(), 'dist', 'contratations', 'integrations', 'pdf', 'logo_handy.png'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) return p;
    }
    return null;
  }

  async gerarContratoPdf(dados: ContractPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 0, bottom: 0, left: 0, right: 0 },
          info: {
            Title: dados.titulo,
            Author: 'Handy - Plataforma de Servicos',
            Creator: 'Handy',
          },
        });

        const chunks: Uint8Array[] = [];
        doc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const w = doc.page.width;  // 595.28
        const m = 45;              // margem

        // ═══════════════════════════════════════════════
        // CABECALHO LIMPO
        // ═══════════════════════════════════════════════
        const logoPath = this.resolveLogoPath();
        if (logoPath) {
          doc.image(logoPath, m, 26, { width: 105 });
          this.logger.log('Logo carregada no PDF.');
        } else {
          this.logger.warn('Logo nao encontrada.');
          doc.font('Helvetica-Bold').fontSize(22).fillColor(C.primary).text('HANDY', m, 30);
        }

        // Data no canto direito
        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
          .text(new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            m, 26, { width: w - m * 2, align: 'right' });

        // Linha roxa fina separadora
        doc.moveTo(m, 72).lineTo(w - m, 72)
          .strokeColor(C.primaryLight).lineWidth(1.5).stroke();

        doc.moveDown(1);

        // ═══════════════════════════════════════════════
        // TITULO
        // ═══════════════════════════════════════════════
        doc.font('Helvetica-Bold').fontSize(18).fillColor(C.dark)
          .text('CONTRATO DE PRESTACAO DE SERVICOS', m, 98, { width: w - m * 2, align: 'center' });

        // Subtitulo
        doc.font('Helvetica').fontSize(10).fillColor(C.muted)
          .text(dados.titulo, m, doc.y + 4, { width: w - m * 2, align: 'center' });

        // ═══════════════════════════════════════════════
        // QUADRO DAS PARTES
        // ═══════════════════════════════════════════════
        let cy = doc.y + 22;
        const boxW = w - m * 2;
        const boxH = 48;

        doc.roundedRect(m, cy, boxW, boxH, 6).fill(C.bgLight).stroke(C.primaryLight);

        const colW = boxW / 2;
        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
          .text('CONTRATANTE', m + 14, cy + 8, { width: colW - 20 });
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.dark)
          .text(dados.clienteNome, m + 14, cy + 22, { width: colW - 20 });

        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
          .text('CONTRATADO', m + colW + 6, cy + 8, { width: colW - 20 });
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.dark)
          .text(dados.prestadorNome, m + colW + 6, cy + 22, { width: colW - 20 });

        // Divisor vertical
        doc.moveTo(m + colW, cy + 12).lineTo(m + colW, cy + boxH - 12)
          .strokeColor(C.border).lineWidth(1).stroke();

        cy += boxH + 24;

        // ═══════════════════════════════════════════════
        // DADOS DO SERVICO
        // ═══════════════════════════════════════════════
        const servicoY = cy;
        doc.roundedRect(m, cy, boxW, 88, 6).fill(C.white).stroke(C.border);

        let iy = cy + 10;
        this.infoLinha(doc, m + 14, iy, colW - 20, 'Servico', dados.servicoNome);
        this.infoLinha(doc, m + colW + 6, iy, colW - 20, 'Valor', dados.preco);
        iy += 28;

        const modalidade = dados.modo === 'digital' ? 'Digital (remota)' : 'Presencial';
        this.infoLinha(doc, m + 14, iy, colW - 20, 'Modalidade', modalidade);

        let localStr = '—';
        if (dados.modo === 'presencial' && dados.endereco) {
          localStr = dados.endereco;
        } else if (dados.modo === 'digital') {
          localStr = 'Nao se aplica';
        }
        this.infoLinha(doc, m + colW + 6, iy, colW - 20, 'Local', localStr);
        iy += 28;

        const agendaStr = dados.data && dados.hora
          ? `${dados.data} as ${dados.hora}`
          : 'A combinar';
        this.infoLinha(doc, m + 14, iy, colW - 20, 'Agendamento', agendaStr);
        this.infoLinha(doc, m + colW + 6, iy, colW - 20, 'Status', 'Pendente de assinatura');

        cy += 110;

        // ═══════════════════════════════════════════════
        // CLAUSULAS
        // ═══════════════════════════════════════════════
        cy = doc.y + 8;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 1 – OBJETO');
        cy = doc.y + 6;
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(3)
          .text(`O presente contrato tem como objeto a prestacao do servico "${dados.servicoNome}", conforme as necessidades do CONTRATANTE, que aceita os termos e condicoes aqui estabelecidos.`,
            m, cy, { width: w - m * 2, align: 'justify' });

        cy = doc.y + 12;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 2 – MODALIDADE E AGENDAMENTO');
        cy = doc.y + 6;
        let txtModalidade = `O servico sera prestado na modalidade ${modalidade}`;
        if (dados.data && dados.hora) {
          txtModalidade += `, agendado para ${dados.data} as ${dados.hora}.`;
        } else {
          txtModalidade += '.';
        }
        if (dados.modo === 'presencial' && dados.endereco) {
          txtModalidade += ` O atendimento ocorrera no endereco: ${dados.endereco}.`;
        }
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(3)
          .text(txtModalidade, m, cy, { width: w - m * 2, align: 'justify' });

        cy = doc.y + 12;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 3 – VALOR E FORMA DE PAGAMENTO');
        cy = doc.y + 6;
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(3)
          .text(`O CONTRATANTE pagara ao CONTRATADO o valor de ${dados.preco}, conforme acordo estabelecido entre as partes na plataforma Handy.`,
            m, cy, { width: w - m * 2, align: 'justify' });

        cy = doc.y + 12;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 4 – OBRIGACOES DO CONTRATADO');
        cy = doc.y + 6;
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(2.5);
        doc.text('O CONTRATADO se compromete a:', m, cy, { width: w - m * 2 });
        doc.text('I.  Executar os servicos com qualidade, eficiencia e dentro dos prazos estabelecidos;', m + 14, doc.y + 3, { width: w - m * 2 - 14 });
        doc.text('II.  Cumprir o agendamento acordado e comunicar o CONTRATANTE em caso de qualquer alteracao;', m + 14, doc.y + 2, { width: w - m * 2 - 14 });
        doc.text('III. Respeitar as observacoes e instrucoes fornecidas pelo CONTRATANTE.', m + 14, doc.y + 2, { width: w - m * 2 - 14 });

        cy = doc.y + 14;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 5 – OBSERVACOES DO CONTRATANTE');
        cy = doc.y + 6;
        const obs = dados.observacoes && dados.observacoes.trim().length > 0
          ? dados.observacoes
          : 'Sem observacoes adicionais.';
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(3)
          .text(obs, m, cy, { width: w - m * 2, align: 'justify' });

        cy = doc.y + 14;
        this.clausulaHeader(doc, m, cy, w - m * 2, 'CLAUSULA 6 – DISPOSICOES GERAIS');
        cy = doc.y + 6;
        doc.font('Helvetica').fontSize(10.5).fillColor(C.text).lineGap(3)
          .text('Ao assinar este contrato digitalmente pela plataforma Autentique, ambas as partes declaram estar de acordo com todos os termos aqui descritos, mediados pela plataforma Handy, reconhecendo a validade juridica da assinatura eletronica nos termos da legislacao vigente.',
            m, cy, { width: w - m * 2, align: 'justify' });

        // ═══════════════════════════════════════════════
        // ASSINATURAS
        // ═══════════════════════════════════════════════
        const sigSectionY = doc.y + 28;

        // Verifica se precisa de nova pagina
        if (sigSectionY + 100 > doc.page.height - 50) {
          doc.addPage();
        }

        const sigTop = Math.max(doc.y + 28, doc.page.height - 320);

        // Titulo da secao
        doc.font('Helvetica-Bold').fontSize(12).fillColor(C.primary)
          .text('ASSINATURAS', m, sigTop, { width: w - m * 2, align: 'center' });

        doc.font('Helvetica').fontSize(9).fillColor(C.muted)
          .text('Assinatura digital via plataforma Autentique', m, doc.y + 4, { width: w - m * 2, align: 'center' });

        // Linhas de assinatura
        const signY = doc.y + 30;
        const signGap = 60;
        const leftSignX = m + 20;
        const rightSignX = w / 2 + 20;
        const signWidth = w / 2 - 60;

        // Contratante (esquerda)
        doc.moveTo(leftSignX, signY).lineTo(leftSignX + signWidth, signY)
          .strokeColor(C.primaryLight).lineWidth(1.2).stroke();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.dark)
          .text(dados.clienteNome, leftSignX, signY + 8, { width: signWidth, align: 'center' });
        doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
          .text('CONTRATANTE', leftSignX, signY + 24, { width: signWidth, align: 'center' });

        // Contratado (direita)
        doc.moveTo(rightSignX, signY).lineTo(rightSignX + signWidth, signY)
          .strokeColor(C.primaryLight).lineWidth(1.2).stroke();
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C.dark)
          .text(dados.prestadorNome, rightSignX, signY + 8, { width: signWidth, align: 'center' });
        doc.font('Helvetica').fontSize(8.5).fillColor(C.muted)
          .text('CONTRATADO', rightSignX, signY + 24, { width: signWidth, align: 'center' });

        // ═══════════════════════════════════════════════
        // RODAPE
        // ═══════════════════════════════════════════════
        const footerY = doc.page.height - 45;
        doc.rect(0, footerY, w, 45).fill(C.bgLight);

        doc.font('Helvetica').fontSize(7.5).fillColor(C.muted)
          .text(`Documento gerado pela plataforma Handy em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })} as ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Assinatura digital via Autentique.`,
            m, footerY + 14, { width: w - m * 2, align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // ── helpers ──

  private clausulaHeader(doc: PDFKit.PDFDocument, x: number, y: number, width: number, titulo: string) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(C.primary).text(titulo, x, y, { width });
  }

  private infoLinha(doc: PDFKit.PDFDocument, x: number, y: number, w: number, label: string, value: string) {
    doc.font('Helvetica').fontSize(8.5).fillColor(C.muted).text(label, x, y, { width: w });
    doc.font('Helvetica-Bold').fontSize(10.5).fillColor(C.dark)
      .text(this.truncate(value, 35), x, y + 12, { width: w });
  }

  private truncate(s: string, max: number): string {
    if (!s) return '—';
    return s.length > max ? s.substring(0, max - 2) + '...' : s;
  }
}
