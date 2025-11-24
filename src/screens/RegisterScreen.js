import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from "../firebase";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

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

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  
  // Nuevo estado para manejar el mensaje de error en pantalla
  const [errorMessage, setErrorMessage] = useState('');

  // validacion

  const validateEmailFormat = (email) => {
    // Expresión regular estandar para emails
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePasswordStrength = (password) => {
    // minimo 8 caracteres, 1 mayuscula, 1 minuscula, 1 numero
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  };

  const handleRegister = async () => {
    setErrorMessage(''); // Limpiar errores previos al intentar registrar

    //validar campos vacios
    if (!nombre || !email || !password || !verifyPassword) {
      setErrorMessage('Por favor, llena todos los campos.');
      return;
    }

    // validar formato de correo
    if (!validateEmailFormat(email)) {
      setErrorMessage('El formato del correo electrónico es inválido.\nEjemplo: usuario@mail.com');
      return;
    }

    // validar seguridad de la password
    if (!validatePasswordStrength(password)) {
      setErrorMessage(
        'La contraseña es insegura.\nDebe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.'
      );
      return;
    }

    //validar coincidencia de passwords
    if (password !== verifyPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      
      await userCredential.user.updateProfile({
        displayName: nombre,
      });
      
      // Mantenemos el Alert de exito ya que es una confirmación final antes de cambiar de flujo
      Alert.alert('¡Éxito!', 'Usuario registrado correctamente.');
      
      await addDoc(collection(db, "Usuarios"), {
        nombre: nombre,
        correo: email,
        racha: 0,
        img_path: 'perfil1'
      });
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Ese correo electrónico ya está en uso.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('El formato del correo electrónico es inválido.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('La contraseña es demasiado débil.');
      } else {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />

      <Image
        source={require('../assets/Logo_0.png')}
        style={styles.logo}
      />

      <Text style={styles.title}>Crear Cuenta</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={(text) => { setNombre(text); setErrorMessage(''); }}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo"
          placeholderTextColor="#888"
          value={email}
          onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
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
          onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
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
          onChangeText={(text) => { setVerifyPassword(text); setErrorMessage(''); }}
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

      {/* Aqui se muestra el mensaje de error si existe */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={20} color="#FF3B30" style={{marginRight: 5}} />
            <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

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
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        marginBottom: 20,
        width: 140, 
        height: 140,
        resizeMode: 'contain',
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
    // Estilos para el mensaje de error
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)', // Fondo rojo muy suave
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30', // Rojo brillante
        fontSize: 14,
        flex: 1, // Para que el texto ocupe el espacio restante si es largo
        fontWeight: '500',
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