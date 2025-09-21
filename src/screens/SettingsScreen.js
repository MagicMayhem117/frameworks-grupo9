import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a DailyTrack! Desde Settings</Text>
      <Text>Aquí verás tus hábitos.</Text>
      <Button title="Cerrar Sesión" onPress={() => auth().signOut()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, marginBottom: 20 },
});

export default HomeScreen;