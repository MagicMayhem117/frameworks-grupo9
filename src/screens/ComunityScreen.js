import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from "../context/UserContext";
import { getUserByEmail, getAmigos, getUsuarios } from "../db/userQueries";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { findProfile } from "../components/FindProfileImg.js";

const MyPopup = ({ visible, onClose, children }) => {
  return (
    <Modal
      animationType="slide" // or "fade", "none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Handles hardware back button on Android
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {children}
        </View>
      </View>
    </Modal>
  );
};

const HomeScreen = ({ navigation }) => {
  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
  const [usuarios, setUsuarios] = useState(null);
  const [busc, setBusc] = useState(null);
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  
  const openPopup = async () => {
    setModalVisible(true);
    const usDataArray = await getUsuarios(busc);
    console.log('Usuarios loaded', usDataArray);
    setUsuarios(usDataArray);
  };

  const acceptRequest = async (requesterId, requesterObj) => {
    if (!usuario || !usuario.id) {
      Alert.alert('Error', 'Usuario actual no cargado');
      return;
    }
    try {
      const currentRef = doc(db, 'Usuarios', usuario.id);
      const requesterRef = doc(db, 'Usuarios', requesterId);
      await updateDoc(currentRef, {
        amigos: arrayUnion(requesterId),
        solicitudes: arrayRemove(requesterId)
      });
      await updateDoc(requesterRef, {
        amigos: arrayUnion(usuario.id)
      });
      setSolicitudes(prev => prev.filter(u => u.id !== requesterId));
      setAmigos(prev => (requesterObj ? [...prev, requesterObj] : prev));
      Alert.alert('Solicitud aceptada', 'Ahora son amigos.');
    } catch (err) {
      console.error('acceptRequest failed', err);
      Alert.alert('Error', 'No se pudo aceptar la solicitud.');
    }
  };

  const rejectRequest = async (requesterId) => {
    if (!usuario || !usuario.id) {
      Alert.alert('Error', 'Usuario actual no cargado');
      return;
    }
    try {
      const currentRef = doc(db, 'Usuarios', usuario.id);
      await updateDoc(currentRef, {
        solicitudes: arrayRemove(requesterId)
      });
      setSolicitudes(prev => prev.filter(u => u.id !== requesterId));
      Alert.alert('Solicitud rechazada', 'La solicitud ha sido eliminada.');
    } catch (err) {
      console.error('rejectRequest failed', err);
      Alert.alert('Error', 'No se pudo rechazar la solicitud.');
    }
  };

  const sendFriendRequest = async (targetId) => {
    if (!usuario || !usuario.id) {
      Alert.alert('Error', 'Usuario actual no cargado');
      return;
    }
    try {
      // add current user's id to target user's 'solicitudes' array
      const targetRef = doc(db, 'Usuarios', targetId);
      await updateDoc(targetRef, {
        solicitudes: arrayUnion(usuario.id)
      });
      setSentRequests(prev => prev.includes(targetId) ? prev : [...prev, targetId]);
      Alert.alert('Solicitud enviada', 'Se ha enviado una solicitud de amistad.');
    } catch (err) {
      console.error('sendFriendRequest failed', err);
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  const closePopup = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
        const amigosIds = userData?.amigos || [];
        const soliIds = userData?.solicitudes || [];
        if (amigosIds.length > 0) {
          console.log(amigosIds);
          const amDataArray = await getAmigos(amigosIds);
          console.log('Friends loaded', amDataArray);
          setAmigos(amDataArray);
        } else {
          setAmigos([]);
        }
        if (soliIds.length > 0) {
          console.log(soliIds);
          const solDataArray = await getAmigos(soliIds);
          console.log('Solicitudes loaded', solDataArray);
          setSolicitudes(solDataArray);
        } else {
          setSolicitudes([]);
        }
      }
    }
    fetchUser();
  }, [email]);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>¡Bienvenido a DailyTrack!</Text>
      <View style={styles.busquedaHeader}>
        <View style={styles.busqueda}>
          <TouchableOpacity onPress={openPopup}>
            <Image source={require('../assets/busqueda.png')} style={styles.busquedaImage}></Image>
          </TouchableOpacity>
        </View>
          <TextInput
            style={styles.input}
            value={busc}
            onChangeText={setBusc}
            placeholder="Buscar..."
          />
          <MyPopup visible={modalVisible} onClose={closePopup}>
            <Text style={styles.modalTitle}>Usuarios</Text>
            {!usuarios || usuarios.length === 0 ? (
              <Text style={{ fontSize: 16, marginBottom: 20 }}>Cargando usuarios...</Text>
            ) : (
              <FlatList
                data={usuarios}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
                renderItem={({ item }) => {
                  const bg = '#d4dee9ff';
                  const title = item.nombre || 'Usuario';
                  const img = findProfile(item.img_path) || require('../assets/profiles/perfil1.webp');
                  const alreadySent = sentRequests.includes(item.id) || (usuario?.solicitudes || []).includes(item.id);
                  return (
                    <View style={[styles.activityBox, { backgroundColor: bg }]}>
                      <View style={styles.activityHeader}>
                        <View style={styles.avatar}>
                          <Image source={img} style={styles.backgroundImage}></Image>
                        </View>
                        <Text style={styles.activityTitle}>{title}</Text>
                        <TouchableOpacity
                          style={[styles.soliButtons, alreadySent && styles.soliButtonsDisabled]}
                          onPress={() => !alreadySent && sendFriendRequest(item.id)}
                        >
                          <Text style={styles.saveButtonText}>{alreadySent ? 'Enviada' : 'Enviar Solicitud'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
              <TouchableOpacity style={styles.picButtons} onPress={closePopup}>
                <Text style={styles.saveButtonText}>Cancelar</Text>
              </TouchableOpacity>
              {/*<TouchableOpacity style={styles.picButtons} onPress={handleSaveProfileImage}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>*/}
            </View>
          </MyPopup>
      </View>
      <Text style={styles.subtitle}>Solicitudes</Text>
      {solicitudes.length === 0 ? (
        <Text style={{ fontSize: 16, marginBottom: 20 }}>No hay solicitudes.</Text>
      ) : (
        <FlatList
          data={solicitudes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
          renderItem={({ item }) => {
            const bg = '#d4dee9ff';
            const title = item.nombre || 'Amigo';
            const img = findProfile(item.img_path) || require('../assets/profiles/perfil1.webp');
            return (
              <View style={[styles.activityBox, { backgroundColor: bg }]}>
                <View style={styles.activityHeader}>
                  <View style={styles.avatar}>
                    <Image source={img} style={styles.backgroundImage}></Image>
                  </View>
                  <Text style={styles.activityTitle}>{title}</Text>
                  <View style={{ marginLeft: 'auto', flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.soliButtons, styles.acceptButton]} onPress={() => acceptRequest(item.id, item)}>
                      <Text style={styles.saveButtonText}>Aceptar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.soliButtons, styles.rejectButton]} onPress={() => rejectRequest(item.id)}>
                      <Text style={styles.saveButtonText}>Rechazar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
      <Text style={styles.subtitle}>Amigos</Text>
      {amigos.length === 0 ? (
        <Text style={{ fontSize: 16, marginBottom: 20 }}>Cargando amigos...</Text>
      ) : (
        <FlatList
          data={amigos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 16, width: '100%', alignItems: 'left' }}
          renderItem={({ item }) => {
            const bg = '#d4dee9ff';
            const title = item.nombre || 'Amigo';
            const img = findProfile(item.img_path) || require('../assets/profiles/perfil1.webp');
            return (
              <TouchableOpacity
                style={[styles.activityBox, { backgroundColor: bg }]}
                onPress={() =>
                  navigation.navigate("FriendProfileScreen", { profile: item })
                }
              >
                <View style={styles.activityHeader}>
                  <View style={styles.avatar}>
                    <Image source={img} style={styles.backgroundImage}></Image>
                  </View>
                  <Text style={styles.activityTitle}>{title}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'left', padding: 16 },
  title: { fontSize: 22, marginBottom: 20 },
  subtitle: { fontSize: 18, marginBottom: 20 },
  activityBox: {
    width: '100%',
    height: 100,
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
  busquedaHeader: {
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
  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  busqueda: {
    width: 30,
    height: 30,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 20,
  },
  backgroundImage: {
    flex: 1,
    width: 55,
    height: 55,
    borderRadius: 30,
  },
  busquedaImage: {
    flex: 1,
    width: 30,
    height: 30,
    borderRadius: 20,
  },
  input: {
    backgroundColor: '#f8f9fd',
    borderRadius: 10,
    width: '80%',
    padding: 12,
    fontSize: 16,
    marginRight: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  picButtons: {
    backgroundColor: '#5A4DF3',
    paddingVertical: 14,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    flexDirection: 'row', 
    justifyContent: 'space-between',
  },
  soliButtons: {
    backgroundColor: '#4df358ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 8,
    marginLeft: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soliButtonsDisabled: {
    backgroundColor: '#9ee7c7',
  },
  acceptButton: {
    backgroundColor: '#10b981',
    marginRight: 8,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    height: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default HomeScreen;