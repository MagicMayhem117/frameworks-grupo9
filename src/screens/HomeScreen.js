import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from "../context/UserContext";
import { getUserByEmail, getActividades } from "../db/userQueries";

const HomeScreen = () => {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const [act, setAct] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
        {/* Consigue el usuario, crea un array con las actividades con otra consulta */}
        const actividadIds = userData?.actividades || [];
        if (actividadIds.length > 0) {
          console.log(actividadIds);
          const actDataArray = await getActividades(actividadIds);
          console.log('Activities loaded', actDataArray);
          setAct(actDataArray);
        } else {
          setAct([]);
        }
      }
    }
    fetchUser();
  }, [email]);

  return (
    <View style={styles.container}>

      {act.length === 0 ? (
        <Text style={{ marginTop: 12 }}>Cargando actividad...</Text>
      ) : (
        <FlatList
          data={act}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
          renderItem={({ item }) => {
            const bg = item.color || '#4a90e2';
            const title = item.nombre || item.name || 'Actividad';
            return (
              <View style={[styles.activityBox, { backgroundColor: bg }]}>
                <View style={styles.activityHeader}>
                  <Text style={styles.icono}>{item.icon}</Text>
                  <Text style={styles.activityTitle}>{title}</Text>
                </View>
                {/* Lugar para poner una gráfica */}
                <View style={styles.graphPlaceholder} />
              </View>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'left', padding: 20 },
  title: { fontSize: 22, marginBottom: 20 },
  activityBox: {
    width: '90%',
    height: 175,
    borderRadius: 12,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    // efecto de sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // efecto de elevación para Android
    elevation: 3,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  activityHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  graphPlaceholder: {
    width: '100%',
    height: 70,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 8,
  },
  icono: {
    fontSize: 24,
    marginRight: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
  },
});

export default HomeScreen;