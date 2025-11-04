import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();

  const [photo, setPhoto] = useState(null);
  const [fullName, setFullName] = useState('Juan Pérez');
  const [username, setUsername] = useState('juanperez25');
  const [bio, setBio] = useState(
    'Mi meta es leer un libro al mes y hacer ejercicio 3 veces a la semana.'
  );

  const handleChoosePhoto = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.8 },
      (response) => {
        if (response.didCancel) return;
        if (response.assets && response.assets.length > 0) {
          setPhoto(response.assets[0].uri);
        }
      }
    );
  };

  const handleSaveChanges = () => {
    // Aquí podrías guardar los cambios en Firebase 
    Alert.alert('✅ Cambios guardados', 'Tu perfil ha sido actualizado.');
  };

  return (
    <View style={styles.container}>
      {/* Encabezado con flecha */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>Editar Perfil</Text>
      </View>

      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>JP</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleChoosePhoto}>
          <Text style={styles.changePhotoText}>Cambiar Foto</Text>
        </TouchableOpacity>
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
      <Text style={styles.label}>Nombre de Usuario (@)</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="@usuario"
      />

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
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 25,
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
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
