import React, { useState, useEffect } from 'react';
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
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

const RegisterScreen = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Configuración inicial de Google
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '919090861349-0fd8gtg71kbhvkb44q8asps91u7nchph.apps.googleusercontent.com',
    });
  }, []);

  // validaciones
  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePasswordStrength = (password) => {
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return re.test(password);
  };


const handleGoogleRegister = async () => {
      setErrorMessage('');
      try {
        // --- AGREGA ESTO IGUAL QUE EN EL LOGIN ---
        try {
          await GoogleSignin.signOut();
        } catch (e) {}
        // verificar servicios de Google
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        //  tokens del usuario
        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.idToken || userInfo.data?.idToken;

        if (!idToken) throw new Error('No se pudo obtener el token de Google');

        //
        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Firebase
        const userCredential = await auth().signInWithCredential(googleCredential);

        // ¿Es un usuario nuevo?
        if (!userCredential.additionalUserInfo.isNewUser) {

          await auth().signOut();

          // Le avisamos
          Alert.alert(
            'Cuenta ya registrada',
            'Ya existe una cuenta vinculada a este correo de Google. Por favor, inicia sesión.',
            [
              {
                text: 'Ir al Login',
                onPress: () => navigation.navigate('Login')
              }
            ]
          );
          return;
        }
        const googleUser = userCredential.user;

        await addDoc(collection(db, "Usuarios"), {
          nombre: googleUser.displayName || "Usuario Google",
          correo: googleUser.email,
          racha: 0,
          img_path: 'perfil1',
          fecha: "0 0"
        });

        Alert.alert('¡Bienvenido!', 'Tu cuenta ha sido creada exitosamente.');

      } catch (error) {
        console.log("Error Google Register:", error);

        if (error.code === 'auth/user-cancelled') return;

        if (error && error.code === statusCodes.SIGN_IN_CANCELLED) {
          setErrorMessage('Registro cancelado.');
        } else if (error && error.code === statusCodes.IN_PROGRESS) {
          setErrorMessage('Ya se está procesando un registro.');
        } else {
          setErrorMessage('Hubo un problema al registrarse con Google.');
        }
      }
    };

  const handleRegister = async () => {
    setErrorMessage('');

    if (!nombre || !email || !password || !verifyPassword) {
      setErrorMessage('Por favor, llena todos los campos.');
      return;
    }
    if (!validateEmailFormat(email)) {
      setErrorMessage('El formato del correo electrónico es inválido.\nEjemplo: usuario@mail.com');
      return;
    }
    if (!validatePasswordStrength(password)) {
      setErrorMessage('La contraseña es insegura.\nDebe tener al menos 8 caracteres, mayúscula, minúscula y número.');
      return;
    }
    if (password !== verifyPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
          const userCredential = await auth().createUserWithEmailAndPassword(email, password);

          await userCredential.user.updateProfile({
            displayName: nombre,
          });

          // Envía la verificación
          await userCredential.user.sendEmailVerification();

          // Crea el documento en Firestore
          await addDoc(collection(db, "Usuarios"), {
            nombre: nombre,
            correo: email,
            racha: 0,
            img_path: 'perfil1',
            fecha: "0 0"
          });

          await auth().signOut();

          Alert.alert(
            '¡Verifica tu correo!',
            'Cuenta creada. Se ha enviado un correo de verificación. Por favor confirma tu cuenta antes de iniciar sesión.',
            [
                {
                    text: "Ir al Login",
                    onPress: () => navigation.navigate('Login')
                }
            ]
          );

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
      <StatusBar backgroundColor="#000000" barStyle="light-content" />

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

      {/* Botón de Google  */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleRegister}>
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        width: '100%',
        borderWidth: 1,
        borderColor: '#FF3B30',
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 14,
        flex: 1,
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