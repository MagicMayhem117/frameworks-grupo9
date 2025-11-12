import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";
import firebaseConfig from "../keys.js";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { findProfile } from "../components/FindProfileImg.js"

const SettingsScreen = () => {
  const navigation = useNavigation();
  const [dailyNotifications, setDailyNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
      <Text style={styles.header}>Ajustes</Text>

      <Text style={styles.sectionTitle}>Ajustes y Perfil</Text>

      {/* Perfil */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
            <Image source={usuario ? findProfile(usuario.img_path) : require('../assets/profiles/perfil1.webp')} style={styles.backgroundImage}></Image>
        </View>
        <View>
          <Text style={styles.profileName}>{usuario ? usuario.nombre : 'Cargando usuario...'}</Text>
          <Text style={styles.profileUser}>{usuario ? usuario.correo : 'Cargando correo...'}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfileScreen')}
      >
        <Text style={styles.editButtonText}>Editar Perfil</Text>
      </TouchableOpacity>

      {/* Preferencias */}
      <Text style={styles.sectionTitle}>Preferencias</Text>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceText}>Notificaciones Diarias</Text>
        <Switch
          value={dailyNotifications}
          onValueChange={setDailyNotifications}
        />
      </View>

      <View style={styles.preferenceRow}>
        <Text style={styles.preferenceText}>Modo Oscuro</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      {/* Soporte */}
      <Text style={styles.sectionTitle}>Soporte</Text>

      <TouchableOpacity style={styles.supportRow}>
        <Text style={styles.preferenceText}>Ayuda y FAQ</Text>
      </TouchableOpacity>

      {/* Cerrar sesión */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => auth().signOut()}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default SettingsScreen;
