import React, { useState, useCallback } from 'react'; 
import { View, Text, StyleSheet, FlatList, Image, TextInput, TouchableOpacity, Modal, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; 
import { useUser } from "../context/UserContext";
import { getUserByEmail, getAmigos, getUsuarios } from "../db/userQueries";
import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs } from 'firebase/firestore';
import { findProfile } from "../components/FindProfileImg.js";

// COLORES
const COLORS = {
  primary: '#5A4DF3',
  background: '#F7F9FC',
  card: '#FFFFFF',
  textPrimary: '#1A202C',
  textSecondary: '#718096',
  success: '#38A169',
  danger: '#E53E3E',
  warning: '#D69E2E',
  inputBg: '#EDF2F7',
  border: '#E2E8F0',
  white: '#FFFFFF'
};

//TOAST 
const ToastNotification = ({ visible, message, type }) => {
  if (!visible) return null;
  const bg = type === 'success' ? COLORS.success : type === 'error' ? COLORS.danger : COLORS.primary;
  return (
    <View style={[styles.toastContainer, { backgroundColor: bg }]}>
      <Text style={styles.toastText}>{message}</Text>
    </View>
  );
};

//popup personalizado
const MyPopup = ({ visible, onClose, children }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
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
  
  // Listas
  const [usuariosBusqueda, setUsuariosBusqueda] = useState(null);
  const [amigos, setAmigos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]); 
  const [enviadasList, setEnviadasList] = useState([]); 
  const [sentRequestsIds, setSentRequestsIds] = useState([]);

  const [busc, setBusc] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = (msg, type = 'success') => {
    setToast({ visible: true, message: msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };

  //Cargar los datos
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Para evitar actualizaciones si el componente se desmonta

      async function fetchUserData() {
        if (email) {
          const userData = await getUserByEmail(email);
          
          if (isActive && userData) {
            setUsuario(userData);

            //cargar Amigos
            const amigosIds = userData.amigos || [];
            if (amigosIds.length > 0) {
              const amData = await getAmigos(amigosIds);
              if (isActive) setAmigos(amData);
            } else {
              if (isActive) setAmigos([]);
            }

            //cargar solicitudes recibidas
            const soliIds = userData.solicitudes || [];
            if (soliIds.length > 0) {
              const solData = await getAmigos(soliIds);
              if (isActive) setSolicitudes(solData);
            } else {
              if (isActive) setSolicitudes([]);
            }

            //cargar Solicitudes Enviadas
            try {
              const q = query(collection(db, "Usuarios"), where("solicitudes", "array-contains", userData.id));
              const querySnapshot = await getDocs(q);
              const enviadasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              if (isActive) {
                setEnviadasList(enviadasData);
                setSentRequestsIds(enviadasData.map(u => u.id));
              }
            } catch (error) {
              console.error("Error cargando enviadas:", error);
            }
          }
        }
      }

      fetchUserData();

      return () => {
        isActive = false; //limpieza al salir del foco
      };
    }, [email]) //se ejecuta cuando cambia el email o cuando la pantalla gana foco
  );

  // acciones

  const openPopup = async () => {
    setModalVisible(true);
    const usDataArray = await getUsuarios(busc);
    setUsuariosBusqueda(usDataArray);
  };

  const acceptRequest = async (requesterId, requesterObj) => {
    if (!usuario?.id) return;
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
      showToast(`¡Ahora eres amigo de ${requesterObj.nombre}!`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al aceptar solicitud', 'error');
    }
  };

  const rejectRequest = async (requesterId) => {
    if (!usuario?.id) return;
    try {
      const currentRef = doc(db, 'Usuarios', usuario.id);
      await updateDoc(currentRef, { solicitudes: arrayRemove(requesterId) });
      setSolicitudes(prev => prev.filter(u => u.id !== requesterId));
      showToast('Solicitud rechazada', 'success');
    } catch (err) {
      showToast('Error al rechazar', 'error');
    }
  };

  const sendFriendRequest = async (targetId, targetUserObj) => {
    if (!usuario?.id) return;
    try {
      const targetRef = doc(db, 'Usuarios', targetId);
      await updateDoc(targetRef, { solicitudes: arrayUnion(usuario.id) });
      
      setSentRequestsIds(prev => [...prev, targetId]);
      setEnviadasList(prev => [...prev, targetUserObj]);

      showToast('Solicitud enviada correctamente', 'success');
    } catch (err) {
      console.error(err);
      showToast('No se pudo enviar la solicitud', 'error');
    }
  };

  const cancelSentRequest = async (targetId) => {
    if (!usuario?.id) return;
    try {
      const targetRef = doc(db, 'Usuarios', targetId);
      await updateDoc(targetRef, { solicitudes: arrayRemove(usuario.id) });

      setEnviadasList(prev => prev.filter(u => u.id !== targetId));
      setSentRequestsIds(prev => prev.filter(id => id !== targetId));
      showToast('Solicitud cancelada', 'success');
    } catch (err) {
      console.error(err);
      showToast('Error al cancelar', 'error');
    }
  };

  //Render
  const renderUserItem = ({ item, type }) => {
    const title = item.nombre || 'Usuario';
    const img = findProfile(item.img_path) || require('../assets/profiles/perfil1.webp');
    const isSent = sentRequestsIds.includes(item.id);
    const isAlreadyFriend = (usuario?.amigos || []).includes(item.id);

    const goToProfile = () => {
      if (type === 'friend') {
        navigation.navigate("FriendProfileScreen", { profile: item });
      }
    };

    return (
      <View style={styles.card}>
        <TouchableOpacity 
            style={styles.cardContent} 
            onPress={goToProfile}
            disabled={type !== 'friend'} 
            activeOpacity={0.7}
        >
          <Image source={img} style={styles.avatar} />
          <View style={styles.textContainer}>
            <Text style={styles.userName}>{title}</Text>
            {type === 'friend' && <Text style={styles.userSubtitle}>Amigo</Text>}
            {type === 'sent_request' && <Text style={styles.userSubtitle}>Pendiente de aceptar</Text>}
            {type === 'search' && isSent && <Text style={[styles.userSubtitle, {color: COLORS.success}]}>Solicitud enviada</Text>}
            {type === 'search' && isAlreadyFriend && <Text style={[styles.userSubtitle, {color: COLORS.primary}]}>Ya son amigos</Text>}
          </View>
        </TouchableOpacity>

        <View style={styles.actionContainer}>
          {type === 'search' && !isAlreadyFriend && (
            <TouchableOpacity
              style={[styles.button, isSent ? styles.buttonDisabled : styles.buttonPrimary]}
              onPress={() => !isSent && sendFriendRequest(item.id, item)}
              disabled={isSent}
            >
              <Text style={styles.buttonTextSmall}>{isSent ? 'Pendiente' : 'Agregar'}</Text>
            </TouchableOpacity>
          )}

          {type === 'received_request' && (
            <View style={styles.row}>
              <TouchableOpacity style={[styles.button, styles.buttonSuccess]} onPress={() => acceptRequest(item.id, item)}>
                <Text style={styles.buttonTextSmall}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonDanger]} onPress={() => rejectRequest(item.id)}>
                <Text style={styles.buttonTextSmall}>X</Text>
              </TouchableOpacity>
            </View>
          )}

          {type === 'sent_request' && (
            <TouchableOpacity style={[styles.button, styles.buttonWarning]} onPress={() => cancelSentRequest(item.id)}>
              <Text style={styles.buttonTextSmall}>Cancelar</Text>
            </TouchableOpacity>
          )}

          {type === 'friend' && (
             <TouchableOpacity onPress={goToProfile}>
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
      <ToastNotification visible={toast.visible} message={toast.message} type={toast.type} />

      <View style={styles.container}>
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
              <Image source={require('../assets/busqueda.png')} style={styles.searchIcon} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {solicitudes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Solicitudes Recibidas</Text>
              <FlatList
                data={solicitudes}
                keyExtractor={(item) => item.id}
                renderItem={(props) => renderUserItem({ ...props, type: 'received_request' })}
                scrollEnabled={false}
              />
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mis Amigos ({amigos.length})</Text>
            {amigos.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Aún no tienes amigos agregados.</Text>
              </View>
            ) : (
              <FlatList
                data={amigos}
                keyExtractor={(item) => item.id}
                renderItem={(props) => renderUserItem({ ...props, type: 'friend' })}
                scrollEnabled={false}
              />
            )}
          </View>

          {enviadasList.length > 0 && (
            <View style={styles.section}>
              <View style={{height: 1, backgroundColor: COLORS.border, marginBottom: 15}}/>
              <Text style={styles.sectionTitle}>Solicitudes Enviadas ({enviadasList.length})</Text>
              <FlatList
                data={enviadasList}
                keyExtractor={(item) => item.id}
                renderItem={(props) => renderUserItem({ ...props, type: 'sent_request' })}
                scrollEnabled={false}
              />
            </View>
          )}
        </ScrollView>

        <MyPopup visible={modalVisible} onClose={() => setModalVisible(false)}>
          <Text style={styles.modalTitle}>Buscar Usuarios</Text>
          <TextInput
              style={[styles.searchInput, { width: '100%', marginBottom: 15, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8 }]}
              value={busc}
              onChangeText={async (text) => {
                setBusc(text);
                const res = await getUsuarios(text);
                setUsuariosBusqueda(res);
              }}
              placeholder="Escribe un nombre..."
          />
          {!usuariosBusqueda || usuariosBusqueda.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No se encontraron usuarios.</Text>
            </View>
          ) : (
            <FlatList
              data={usuariosBusqueda}
              keyExtractor={(item) => item.id}
              renderItem={(props) => renderUserItem({ ...props, type: 'search' })}
              style={{ width: '100%' }}
            />
          )}
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </MyPopup>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: COLORS.inputBg
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8,
    minWidth: 70,
    alignItems: 'center'
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
    paddingHorizontal: 10,
    minWidth: 40
  },
  buttonDisabled: {
    backgroundColor: COLORS.inputBg
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary
  },
  buttonSuccess: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 10,
    minWidth: 60
  },
  buttonTextSmall: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700'
  },
  buttonWarning: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 10
  },
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  closeButton: {
    marginTop: 10,
    padding: 15,
    alignItems: 'center'
  },
  closeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 16
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15
  },
  headerContainer: {
    marginBottom: 15
  },
  modalDragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 15
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: COLORS.textPrimary
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  row: {
    flexDirection: 'row'
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 15
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border
  },
  searchButton: {
    padding: 8,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8
  },
  searchIcon: {
    width: 20,
    height: 20,
    tintColor: COLORS.primary
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 5,
    color: COLORS.textPrimary
  },
  section: {
    marginBottom: 25
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
    marginLeft: 4
  },
  textContainer: {
    justifyContent: 'center',
    flex: 1
  },
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    zIndex: 9999,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  toastText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary
  },
  userSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2
  }
});

export default HomeScreen;