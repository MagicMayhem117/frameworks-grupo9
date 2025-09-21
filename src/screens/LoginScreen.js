import React, { useState, useEffect } from 'react';
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

// Función para el inicio de sesión con Google
async function onGoogleButtonPress() {
  try {
    // Revisa si tienes los servicios de Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Obtén el ID Token del usuario
    const { idToken } = await GoogleSignin.signIn();
    // Crea una credencial de Google con el token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // Inicia sesión con la credencial
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.log(error);
  }
}

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <MiLogoSVG width={80} height={80} fill="#FFF" style={styles.logo} />
      <Text style={styles.title}>Inicias sesión</Text>

      <View style={styles.inputContainer}>
        <Icon name="at" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>O con</Text>

      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Icon name="google" size={20} color="#FFF" />
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.footerText}>
          ¿No tienes cuenta? <Text style={styles.linkText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    marginBottom: 30,
    transform: [{ rotate: '0deg' }],
  },
  title: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: 'bold',
    marginBottom: 40,
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFF',
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

export default LoginScreen;