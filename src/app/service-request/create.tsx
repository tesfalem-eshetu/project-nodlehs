import { View, Text, StyleSheet } from 'react-native';

export default function CreateServiceRequestScreen() {
  return (
    <View style={styles.container}>
      <Text>Create Service Request</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
