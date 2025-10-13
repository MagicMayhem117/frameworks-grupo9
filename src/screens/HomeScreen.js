import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";

const HomeScreen = () => {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
      }
    }
    fetchUser();
  }, [email]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a DailyTrack!</Text>
      <Text>{usuario ? usuario.nombre : 'Cargando usuario...'}</Text>
      <Button title="Cerrar Sesión" onPress={() => auth().signOut()} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, marginBottom: 20 },
});

export default HomeScreen;