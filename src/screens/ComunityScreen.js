import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Modal, Alert, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from "../context/UserContext";
import { getUserByEmail, getAmigos, getUsuarios } from "../db/userQueries";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { findProfile } from "../components/FindProfileImg.js";

//Colores y Constantes
const COLORS = {
  primary: '#5A4DF3',
  background: '#F7F9FC',
  card: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  success: '#38A169',
  danger: '#E53E3E',
  inputBg: '#EDF2F7',
  border: '#E2E8F0'
};

const MyPopup = ({ visible, onClose, children }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalOverlay} onTouchEnd={onClose} />
        <View style={styles.modalView}>
          <View style={styles.modalDragIndicator} />
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
    // Cargar usuarios iniciales si busc está vacío o lleno
    const usDataArray = await getUsuarios(busc);
    setUsuarios(usDataArray);
  };

  const acceptRequest = async (requesterId, requesterObj) => {
    if (!usuario || !usuario.id) return Alert.alert('Error', 'Usuario actual no cargado');
    try {
      const currentRef = doc(db, 'Usuarios', usuario.id);
      const requesterRef = doc(db, 'Usuarios', requesterId);
      await updateDoc(currentRef, {
        amigos: arrayUnion(requesterId),
        solicitudes: arrayRemove(requesterId)
      });
      await updateDoc(requesterRef, { amigos: arrayUnion(usuario.id) });

      setSolicitudes(prev => prev.filter(u => u.id !== requesterId));
      setAmigos(prev => (requesterObj ? [...prev, requesterObj] : prev));
      Alert.alert('¡Genial!', 'Ahora son amigos.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo aceptar la solicitud.');
    }
  };

  const rejectRequest = async (requesterId) => {
    if (!usuario || !usuario.id) return Alert.alert('Error', 'Usuario actual no cargado');
    try {
      const currentRef = doc(db, 'Usuarios', usuario.id);
      await updateDoc(currentRef, { solicitudes: arrayRemove(requesterId) });
      setSolicitudes(prev => prev.filter(u => u.id !== requesterId));
    } catch (err) {
      console.error(err);
    }
  };

  const sendFriendRequest = async (targetId) => {
    if (!usuario || !usuario.id) return Alert.alert('Error', 'Usuario actual no cargado');
    try {
      const targetRef = doc(db, 'Usuarios', targetId);
      await updateDoc(targetRef, { solicitudes: arrayUnion(usuario.id) });
      setSentRequests(prev => prev.includes(targetId) ? prev : [...prev, targetId]);
      Alert.alert('Enviada', 'Solicitud de amistad enviada.');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo enviar la solicitud.');
    }
  };

  const closePopup = () => setModalVisible(false);

  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
        const amigosIds = userData?.amigos || [];
        const soliIds = userData?.solicitudes || [];

        if (amigosIds.length > 0) {
          const amDataArray = await getAmigos(amigosIds);
          setAmigos(amDataArray);
        } else {
          setAmigos([]);
        }

        if (soliIds.length > 0) {
          const solDataArray = await getAmigos(soliIds);
          setSolicitudes(solDataArray);
        } else {
          setSolicitudes([]);
        }
      }
    }
    fetchUser();
  }, [email]);

  // Renderizado de cada item
  const renderUserItem = ({ item, isFriendList, isRequest, isSearch }) => {
    const title = item.nombre || 'Usuario';
    const img = findProfile(item.img_path) || require('../assets/profiles/perfil1.webp');
    const alreadySent = sentRequests.includes(item.id) || (usuario?.solicitudes || []).includes(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Image source={img} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.userName}>{title}</Text>
            {isFriendList && <Text style={styles.userSubtitle}>Amigo</Text>}
            {isSearch && alreadySent && <Text style={[styles.userSubtitle, {color: COLORS.success}]}>Solicitud enviada</Text>}
          </View>
        </View>

        {/* Botones de Accion */}
        <View style={styles.actionContainer}>
          {isSearch && (
            <TouchableOpacity
              style={[styles.button, alreadySent ? styles.buttonDisabled : styles.buttonPrimary]}
              onPress={() => !alreadySent && sendFriendRequest(item.id)}
              disabled={alreadySent}
            >
              <Text style={styles.buttonTextSmall}>{alreadySent ? 'Pendiente' : 'Agregar'}</Text>
            </TouchableOpacity>
          )}

          {isRequest && (
            <View style={styles.row}>
              <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={() => acceptRequest(item.id, item)}>
                <Text style={styles.buttonTextSmall}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => rejectRequest(item.id)}>
                <Text style={styles.buttonTextSmall}>X</Text>
              </TouchableOpacity>
            </View>
          )}

          {isFriendList && (
             <TouchableOpacity onPress={() => navigation.navigate("FriendProfileScreen", { profile: item })}>
                <Text style={{color: COLORS.primary, fontWeight: '600'}}>Ver perfil</Text>
             </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.container}>

        {/* Header con Buscador */}
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>Social</Text>
          <View style={styles.searchBarContainer}>
            <TextInput
              style={styles.searchInput}
              value={busc}
              onChangeText={setBusc}
              placeholder="Buscar personas..."
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity style={styles.searchButton} onPress={openPopup}>
              {/* Asumiendo que tienes el icono, si no usa un texto temporal o Icon de librería */}
              <Image source={require('../assets/busqueda.png')} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listContainer}>
          {/* Seccion Solicitudes */}
          {solicitudes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solicitudes de Amistad</Text>
              <FlatList
                data={solicitudes}
                keyExtractor={(item) => item.id}
                renderItem={(props) => renderUserItem({ ...props, isRequest: true })}
                scrollEnabled={false} // Para que scrollee con la lista principal si fuera ScrollView
              />
            </View>
          )}

          {/* Seccion Amigos */}
          <View style={[styles.section, { flex: 1 }]}>
            <Text style={styles.sectionTitle}>Mis Amigos ({amigos.length})</Text>
            {amigos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aún no tienes amigos agregados.</Text>
              </View>
            ) : (
              <FlatList
                data={amigos}
                keyExtractor={(item) => item.id}
                renderItem={(props) => renderUserItem({ ...props, isFriendList: true })}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>

        {/* MODAL DE BUSQUEDA */}
        <MyPopup visible={modalVisible} onClose={closePopup}>
          <Text style={styles.modalTitle}>Buscar Usuarios</Text>

          {/* Replicar input dentro del modal si se desea buscar en tiempo real aqui */}
          <TextInput
              style={[styles.searchInput, { width: '100%', marginBottom: 15 }]}
              value={busc}
              onChangeText={async (text) => {
                setBusc(text);
                const res = await getUsuarios(text);
                setUsuarios(res);
              }}
              placeholder="Escribe un nombre..."
          />

          {!usuarios || usuarios.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
            </View>
          ) : (
            <FlatList
              data={usuarios}
              keyExtractor={(item) => item.id}
              renderItem={(props) => renderUserItem({ ...props, isSearch: true })}
              style={{ width: '100%' }}
            />
          )}

          <TouchableOpacity style={styles.closeButton} onPress={closePopup}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </MyPopup>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  // Header & Search
  headerContainer: {
    marginBottom: 20,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: COLORS.textPrimary,
  },
  searchButton: {
    padding: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary,
  },
  // Listas y Secciones
  listContainer: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginLeft: 4,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  // Tarjetas de Usuario (Cards)
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    // Sombra
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.inputBg,
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  userSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Botones
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSuccess: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    minWidth: 60,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 10,
    minWidth: 40, // Boton X mas pequeño
  },
  buttonDisabled: {
    backgroundColor: COLORS.inputBg,
  },
  buttonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  // Modal Styles
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end', // Modal aparece abajo (tipo bottom sheet) o centro
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)', // Fondo oscuro semitransparente
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%', // Ocupa el 80% de la pantalla
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.textPrimary,
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default HomeScreen;