import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Switch,
  Image,
} from "react-native";
import {
  getFirestore,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getActividades, getActividadesPublicas } from "../db/userQueries";
import { findProfile } from "../components/FindProfileImg"

export default function FriendProfileScreen({ route, navigation }) {
  const { profile } = route.params;
  const [act, setAct] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      const actividadIds = profile?.actividades || [];
      if (actividadIds.length > 0) {
        console.log(actividadIds);
        try {
          const actDataArray = await getActividadesPublicas(actividadIds);
          console.log('Activities loaded', actDataArray);
          setAct(actDataArray);
        } catch (err) {
          console.error('Failed to load friend activities', err);
          setAct([]);
        }
      } else {
        setAct([]);
      }
    }
    fetchUser();
  }, [profile]);

  return (
    <View style={styles.container}>
      <View style={styles.container}>
            <Text style={styles.header}>Ajustes</Text>
      
            <Text style={styles.sectionTitle}>Ajustes y Perfil</Text>
      
            {/* Perfil */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                  <Image source={profile ? findProfile(profile.img_path) : require('../assets/profiles/perfil1.webp')} style={styles.backgroundImage}></Image>
              </View>
              <View>
                <Text style={styles.profileName}>{profile ? profile.nombre : 'Cargando usuario...'}</Text>
                <Text style={styles.profileUser}>{profile ? profile.correo : 'Cargando correo...'}</Text>
              </View>
            </View>
      </View>
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
              <View style={[styles.activityBox, { backgroundColor: bg }]} >
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
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 20 },
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
  activityTitle: {
    color: '#fff',
    fontSize: 24,
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 16,
  },container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  backgroundImage: {
    flex: 1,
    width: 55,
    height: 55,
    borderRadius: 30,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileUser: {
    fontSize: 14,
    color: '#777',
  },
  editButton: {
    backgroundColor: '#ecebff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#5A4DF3',
    fontWeight: '600',
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 16,
  },
  supportRow: {
    backgroundColor: '#f8f9fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});