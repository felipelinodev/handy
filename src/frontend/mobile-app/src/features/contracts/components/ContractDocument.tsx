import { StyleSheet, Text } from 'react-native';

import colors from '@/theme/colors';

type Props = {
  prestadorNome?: string;
  servicoNome?: string;
  precoLabel: string;
  modo?: 'presencial' | 'digital';
  data?: string;
  hora?: string;
  endereco?: string;
  observacoes?: string;
};

export function ContractDocument({
  prestadorNome,
  servicoNome,
  precoLabel,
  modo,
  data,
  hora,
  endereco,
  observacoes,
}: Props) {
  return (
    <Text style={styles.text}>
      <Text style={styles.bold}>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</Text>
      {'\n'}
      <Text style={styles.bold}>CONTRATANTE:</Text> Cliente Handy
      {'\n'}
      <Text style={styles.bold}>CONTRATADO:</Text> {prestadorNome ?? 'Prestador'}
      {'\n'}
      <Text style={styles.bold}>CLÁUSULA 1 – OBJETO</Text>
      {'\n'}
      O presente contrato tem como objeto a prestação do serviço{' '}
      <Text style={styles.bold}>"{servicoNome ?? '—'}"</Text>, conforme as
      necessidades do CONTRATANTE.
      {'\n\n'}
      <Text style={styles.bold}>CLÁUSULA 2 – MODALIDADE E AGENDAMENTO</Text>
      {'\n'}
      O serviço será prestado na modalidade{' '}
      <Text style={styles.bold}>
        {modo === 'digital' ? 'Digital (remota)' : 'Presencial'}
      </Text>
      {data && hora ? `, agendado para ${data} às ${hora}.` : '.'}
      {modo === 'presencial' && endereco
        ? ` O atendimento ocorrerá no endereço: ${endereco}.`
        : ''}
      {'\n\n'}
      <Text style={styles.bold}>CLÁUSULA 3 – VALOR E FORMA DE PAGAMENTO</Text>
      {'\n'}
      O CONTRATANTE pagará ao CONTRATADO o valor de{' '}
      <Text style={styles.bold}>{precoLabel}</Text>, conforme acordo entre as
      partes.
      {'\n\n'}
      <Text style={styles.bold}>CLÁUSULA 4 – OBRIGAÇÕES DO CONTRATADO</Text>
      {'\n'}
      O CONTRATADO se compromete a:
      {'\n'}I – Executar os serviços com qualidade, eficiência e dentro dos
      prazos estabelecidos;
      {'\n'}II – Cumprir o agendamento acordado e comunicar o CONTRATANTE em
      caso de qualquer alteração;
      {'\n'}III – Respeitar as observações e instruções fornecidas pelo
      CONTRATANTE.
      {'\n\n'}
      <Text style={styles.bold}>CLÁUSULA 5 – OBSERVAÇÕES DO CONTRATANTE</Text>
      {'\n'}
      {observacoes && observacoes.trim().length > 0
        ? observacoes
        : 'Sem observações adicionais.'}
      {'\n\n'}
      <Text style={styles.bold}>CLÁUSULA 6 – DISPOSIÇÕES GERAIS</Text>
      {'\n'}
      Ao assinar este contrato, ambas as partes declaram estar de acordo com
      todos os termos aqui descritos, mediados pela plataforma Handy.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    lineHeight: 20,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    textAlign: 'justify',
  },
  bold: {
    fontFamily: 'OpenSans_700Bold',
  },
});
