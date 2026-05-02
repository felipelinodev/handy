import { View, Text, StyleSheet } from 'react-native';
import colors from '../../utils/colors';

export default function CancelContractScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cancelar Contrato</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muttedSurface,
  },
  text: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
    color: colors.textDark,
  },
});
