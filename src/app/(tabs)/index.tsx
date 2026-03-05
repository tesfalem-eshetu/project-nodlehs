import { View, Text, StyleSheet } from 'react-native';

export default function EquipmentListScreen() {
  return (
    <View style={styles.container}>
      <Text>Equipment List</Text>
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
