import { StyleSheet, Text } from 'react-native';

import colors from '@/theme/colors';

export function CancellationPolicyText() {
  return (
    <Text style={styles.text}>
      Cancelamentos realizados em até 5 minutos após a confirmação do pedido são
      processados imediatamente e sem custos.
      {'\n'}
      Passado esse prazo, se o serviço já constar com o status{' '}
      <Text style={styles.bold}>Em Andamento</Text> (indicando que o prestador já
      iniciou o trabalho ou deslocamento), será aplicada uma taxa irrenunciável de{' '}
      <Text style={styles.bold}>10%</Text> sobre o valor total para cobrir custos
      operacionais e a reserva da agenda.
      {'\n'}
      Para garantir a segurança e justiça para ambas as partes, cancelamentos nesta
      etapa não são automáticos. A solicitação passará por uma análise individual
      da nossa equipe de suporte em até <Text style={styles.bold}>24 horas</Text>.
      O valor final do estorno será calculado de forma proporcional à quantidade
      de trabalho já executada pelo prestador até o momento do cancelamento.
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'OpenSans_400Regular',
    color: colors.textDark,
    marginBottom: 24,
  },
  bold: {
    fontFamily: 'OpenSans_700Bold',
  },
});
