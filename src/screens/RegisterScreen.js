import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import MiLogoSVG from '../assets/LogoProvisional.svg'; // Asegúrate de que la ruta sea correcta
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from "../firebase";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

// La misma función de Google funciona para registrarse o iniciar sesión
async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // La primera vez, esto crea un usuario. Las siguientes, inicia sesión.
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.log(error);
  }
}


const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);


  // Using shared db from src/firebase

  const handleRegister = async () => {
    if (!nombre || !email || !password || !verifyPassword) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }
    if (password !== verifyPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      // Actualiza el perfil del usuario con su nombre
      await userCredential.user.updateProfile({
        displayName: nombre,
      });
      Alert.alert('¡Éxito!', 'Usuario registrado correctamente.');
      await addDoc(collection(db, "Usuarios"), {
        nombre: nombre,
        correo: email,
        racha: 0,
        img_path: 'perfil1'
      });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Ese correo electrónico ya está en uso.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Error', 'El formato del correo electrónico es inválido.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <MiLogoSVG width={80} height={80} fill="#FFF" style={styles.logo} />
      <Text style={styles.title}>Crear Cuenta</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={setNombre}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Contraseña"
    placeholderTextColor="#888"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
    <Icon
      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
      size={22}
      color="#888"
    />
  </TouchableOpacity>
</View>

<View style={styles.inputContainer}>
  <TextInput
    style={styles.input}
    placeholder="Verificar Contraseña"
    placeholderTextColor="#888"
    value={verifyPassword}
    onChangeText={setVerifyPassword}
    secureTextEntry={!showVerifyPassword}
  />
  <TouchableOpacity onPress={() => setShowVerifyPassword(!showVerifyPassword)} style={styles.eyeButton}>
    <Icon
      name={showVerifyPassword ? 'eye-off-outline' : 'eye-outline'}
      size={22}
      color="#888"
    />
  </TouchableOpacity>
</View>



      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Crear Cuenta</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>O con</Text>

      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Icon name="google" size={20} color="#FFF" />
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footerText}>
          ¿Ya tienes una cuenta? <Text style={styles.linkText}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        color: '#FFF',
        fontWeight: 'bold',
        marginBottom: 30,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        width: '100%',
        marginBottom: 15,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: 50,
        color: '#FFF',
    },
    eyeButton: {
        paddingHorizontal: 5,
        paddingVertical: 10,
    },
    button: {
        backgroundColor: '#0D6EFD',
        borderRadius: 10,
        width: '100%',
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    orText: {
      color: '#888',
      marginVertical: 20,
    },
    googleButton: {
      flexDirection: 'row',
      backgroundColor: '#282828',
      borderRadius: 10,
      width: '100%',
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    googleButtonText: {
      color: '#FFF',
      marginLeft: 10,
      fontSize: 16,
      fontWeight: 'bold',
    },
    footerText: {
        color: '#888',
        marginTop: 30,
    },
    linkText: {
        color: '#0D6EFD',
        fontWeight: 'bold',
    },
});

export default RegisterScreen;