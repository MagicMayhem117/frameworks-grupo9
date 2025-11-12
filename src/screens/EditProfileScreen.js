import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  Button
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { useUser } from "../context/UserContext";
import { getUserByEmail } from "../db/userQueries";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { findProfile } from "../components/FindProfileImg.js"
import { PROFILE_IMAGES } from "../components/ProfileImages.js"
import { FlatList } from 'react-native';


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

const EditProfileScreen = () => {
  const [photo, setPhoto] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [bio, setBio] = useState(null);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const openPopup = () => {
    setModalVisible(true);
  };

  const closePopup = () => {
    setModalVisible(false);
  };

  const { email } = useUser();
  const [usuario, setUsuario] = useState(null);
    
  useEffect(() => {
    async function fetchUser() {
      if (email) {
        const userData = await getUserByEmail(email);
        setUsuario(userData);
        setFullName(userData.nombre);
        setBio(userData.bio);
      }
    }
    fetchUser();
  }, [email]);

  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    if (usuario && usuario.img_path) setSelectedProfile(usuario.img_path);
  }, [usuario]);

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const usuarioRef = doc(db, "Usuarios", usuario.id);
      await updateDoc(usuarioRef, {
        nombre: fullName,
        bio: bio,
      });
      Alert.alert('✅ Cambios guardados', 'Tu perfil ha sido actualizado.');
    } catch (error) {
      Alert.alert('Error', 'Hubo un error al guardar.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfileImage = async () => {
    if (!usuario || !usuario.id) {
      Alert.alert('Error', 'Usuario no cargado. Intenta de nuevo.');
      return;
    }
    if (!selectedProfile) {
      Alert.alert('Error', 'Selecciona una imagen primero.');
      return;
    }
    try {
      const usuarioRef = doc(db, "Usuarios", usuario.id);
      await updateDoc(usuarioRef, { img_path: selectedProfile });
      // update local state so UI reflects change immediately
      setUsuario(prev => ({ ...prev, img_path: selectedProfile }));
      Alert.alert('✅ Foto guardada', 'Tu foto de perfil ha sido actualizada.');
      closePopup();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'No se pudo guardar la foto.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Editar Perfil</Text>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Image source={usuario ? findProfile(usuario.img_path) : require('../assets/profiles/perfil1.webp')} style={styles.backgroundImage}></Image>
        </View>
        <TouchableOpacity onPress={openPopup}>
          <Text style={styles.changePhotoText}>Cambiar Foto</Text>
        </TouchableOpacity>
        <MyPopup visible={modalVisible} onClose={closePopup}>
          <Text style={styles.modalTitle}>Selecciona una foto de perfil</Text>
          <FlatList
            data={Object.keys(PROFILE_IMAGES)}
            numColumns={3}
            keyExtractor={(k) => k}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
            renderItem={({ item: key }) => {
              const img = PROFILE_IMAGES[key].uri;
              const isSelected = selectedProfile === key;
              return (
                <TouchableOpacity
                  style={[styles.profileOption, isSelected && styles.profileOptionSelected]}
                  onPress={() => setSelectedProfile(key)}
                >
                  <Image source={img} style={styles.profileThumb} />
                </TouchableOpacity>
              );
            }}
          />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <TouchableOpacity style={styles.picButtons} onPress={closePopup}>
              <Text style={styles.saveButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.picButtons} onPress={handleSaveProfileImage}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </MyPopup>
      </View>

      {/* Nombre completo */}
      <Text style={styles.label}>Nombre Completo</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Tu nombre completo"
      />

      {/* Nombre de usuario */}
      <Text style={styles.label}>Correo</Text>
      <Text
        style={styles.correo}
      >{usuario ? usuario.correo : 'Cargando correo...'}</Text>

      {/* Biografía */}
      <Text style={styles.label}>Biografía (Opcional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholder="Escribe algo sobre ti..."
      />

      {/* Botón guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
        <Text style={styles.saveButtonText}>{loading ? 'Cargando...' : 'Guardar Cambios'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    marginTop: 25,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
  },
  avatar: {
  width: 90,
  height: 90,
  borderRadius: 50,
  overflow: 'hidden',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 15,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  backgroundImage: {
    flex: 1,
    width: 90,
    height: 90,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: '#5A4DF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: '90%'
  },
  profileOption: {
    width: 90,
    height: 90,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileOptionSelected: {
    borderColor: '#4f46e5'
  },
  profileThumb: {
    width: 86,
    height: 86,
    borderRadius: 10,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 50,
    marginBottom: 8,
  },
  changePhotoText: {
    color: '#5A4DF3',
    fontWeight: '600',
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#f8f9fd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  correo: {
    backgroundColor: '#fafbffff',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#5A4DF3',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
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
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
