import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Image, // Importamos Image
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useUser } from "../context/UserContext";

// Función para Google Sign-In
async function onGoogleButtonPress() {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.log(error);
  }
}

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { setStateEmail } = useUser();

  const handleLogin = async () => {
    if (email.length === 0 || password.length === 0) {
      Alert.alert('Error', 'Por favor, llena todos los campos.');
      return;
    }
    try {
      await auth().signInWithEmailAndPassword(email, password);
      setStateEmail(email);
    } catch (error) {
      Alert.alert('Error', 'Credenciales incorrectas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      <Image
        source={require('../assets/Logo_0.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Inicia sesión</Text>

      {/* Campo de correo */}
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

      {/* Campo de contraseña con icono de ojo */}
      <View style={styles.inputContainer}>
        <Icon name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your Password"
          placeholderTextColor="#888"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#888"
          />
        </TouchableOpacity>
      </View>

      {/* Botón de inicio de sesión */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.orText}>O con</Text>

      {/* Botón de Google */}
      <TouchableOpacity style={styles.googleButton} onPress={onGoogleButtonPress}>
        <Icon name="google" size={20} color="#FFF" />
        <Text style={styles.googleButtonText}>Google</Text>
      </TouchableOpacity>

      {/* Enlace de registro */}
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
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    marginBottom: 30,
    width: 140,  // Definimos el ancho explícitamente
    height: 140, // Definimos la altura explícitamente
    resizeMode: 'contain', // Mantiene la proporción de la imagen
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