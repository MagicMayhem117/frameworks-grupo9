import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
// 1. Importación Modular para evitar advertencias amarillas
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
// 2. Importamos statusCodes para manejar errores de Google correctamente
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getUserByEmail } from "../db/userQueries";
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from "../firebase";
import React, { useState, useEffect } from 'react';

const meses = {
  0: 31, 1: 28, 2: 31, 3: 30, 4: 31, 5: 30,
  6: 31, 7: 31, 8: 30, 9: 31, 10: 30, 11: 31,
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '919090861349-0fd8gtg71kbhvkb44q8asps91u7nchph.apps.googleusercontent.com',
    });
  }, []);
  const recuperaContrasena = (emailRec) => {
    if (!emailRec) {
      Alert.alert("Error", "Por favor ingresa tu correo primero.");
      return;
    }

    auth()
      .sendPasswordResetEmail(emailRec)
      .then(() => {
        Alert.alert("¡Correo enviado!", "Revisa tu bandeja de entrada para restablecer tu contraseña.");
        console.log("Correo enviado!");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);

        if (errorCode === 'auth/user-not-found') {
           Alert.alert("Error", "No existe cuenta con ese correo.");
        } else if (errorCode === 'auth/invalid-email') {
           Alert.alert("Error", "El formato del correo no es válido.");
        } else {
           Alert.alert("Error", errorMessage);
        }
      });
  }

  const fetchFecha = async () => {
    const userData = await getUserByEmail(email);
    console.log(userData.fecha);
    let fecha = "0 0";
    if (userData.fecha !== undefined) {
      fecha = userData.fecha;
      console.log("Fecha:", fecha);
    }

    let date = new Date();
  };
  const checkRacha = async (userEmail) => {
    try {
      const userData = await getUserByEmail(userEmail);
      if (!userData) return;

      let fecha = userData.fecha || "0 0";
      let date = new Date();
      const fechaRacha = fecha.split(" ");
      let perdido = false;

      if (date.getMonth() == parseInt(fechaRacha[1])) {
        if ((date.getDate() - parseInt(fechaRacha[0])) > 1) {
          perdido = true;
        }
      } else {
        if (meses[parseInt(fechaRacha[1])] > parseInt(fechaRacha[0])) {
          perdido = true;
        } else if (date.getDate() > 1) {
          perdido = true;
        }
      }

      if (perdido && userData.id) {
        console.log("Usuario ha perdido su racha.");
        const usuarioRef = doc(db, "Usuarios", userData.id);
        await updateDoc(usuarioRef, { racha: 0 });
      }
    } catch (e) {
      console.log("Error verificando racha:", e);
    }
  };

const handleLogin = async () => {
    setErrorMessage('');
    if (email.length === 0 || password.length === 0) {
      setErrorMessage('Por favor, llena todos los campos.');
      return;
    }
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email.trim(), password);
      const user = userCredential.user;

      await user.reload();

      const updatedUser = auth().currentUser;

      if (!updatedUser.emailVerified) {
          await auth().signOut(); 

          Alert.alert(
              'Correo no verificado',
              'Debes verificar tu correo para poder iniciar sesión. Revisa tu bandeja de entrada (o spam).',
              [
                  { text: 'OK', style: 'cancel' },
                  {
                      text: 'Reenviar correo',
                      onPress: async () => {
                          try {
                              await user.sendEmailVerification();
                              Alert.alert('Enviado', 'Se ha enviado un nuevo correo de verificación.');
                          } catch (e) {
                              console.log(e);
                              Alert.alert('Error', 'Espera unos minutos antes de pedir otro correo.');
                          }
                      }
                  }
              ]
          );
          return; 
      }

      await fetchFecha(); 
      await checkRacha(email.trim()); 

      const today = new Date();
      if (today.getDate() < 6) {
          const userData = await getUserByEmail(email.trim()); 
          const hasSeenMonthlyShare = userData?.monthlyShareDismissed || false;

          if (!hasSeenMonthlyShare) {
              navigation.replace('MonthlyShare');
          } else {
              navigation.replace('BottomTab');
          }
      } else {
          navigation.replace('BottomTab');
      }

    } catch (error) {
      setErrorMessage('Credenciales incorrectas o error de red.');
      console.log(error);
    }
};

  const onGoogleButtonPress = async () => {
      setErrorMessage('');
      try {

        try {
          await GoogleSignin.signOut();
        } catch (e) {

        }

        // Verificar servicios
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        // Obtener tokens (Ahora sí abrirá la ventanita)
        const userInfo = await GoogleSignin.signIn();
        const idToken = userInfo.idToken || userInfo.data?.idToken;

        if (!idToken) {
          throw new Error('No se pudo obtener el token de Google');
        }

        const googleCredential = GoogleAuthProvider.credential(idToken);

        // Iniciar sesión en Firebase
        const userCredential = await auth().signInWithCredential(googleCredential);
        const googleUser = userCredential.user;

      // base de datos
      const userData = await getUserByEmail(googleUser.email);

      if (!userData) {
        await addDoc(collection(db, "Usuarios"), {
          nombre: googleUser.displayName || "Usuario Google",
          correo: googleUser.email,
          racha: 0,
          img_path: 'perfil1',
          fecha: "0 0"
        });
      } else {
        await checkRacha(googleUser.email);
      }

      console.log('Login con Google exitoso');

    } catch (error) {
      console.log("Error Google:", error);


      if (error && error.code === statusCodes.SIGN_IN_CANCELLED) {
        setErrorMessage('Cancelaste el inicio de sesión.');
      } else if (error && error.code === statusCodes.IN_PROGRESS) {
        setErrorMessage('Ya hay un inicio de sesión en curso.');
      } else if (error && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setErrorMessage('Servicios de Google Play no disponibles.');
      } else {
        // Si el error no tiene código o es otro, mostramos mensaje genérico
        setErrorMessage('Error al conectar con Google.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000000" barStyle="light-content" />

      <Image source={require('../assets/Logo_0.png')} style={styles.logo} />

      <Text style={styles.title}>Inicia sesión</Text>

      <View style={styles.inputContainer}>
        <Icon name="at" size={20} color="#888" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Enter your Email"
          placeholderTextColor="#888"
          value={email}
          onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
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
          onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#888" />
        </TouchableOpacity>
      </View>


      {/* Forgot password link */}
      <TouchableOpacity
        style={styles.forgotLinkContainer}
        onPress={() => recuperaContrasena(email)}
      >
        <Text style={styles.forgotLinkText}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Mensaje de error visual */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={20} color="#FF3B30" style={{marginRight: 5}} />
            <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

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
    width: 140,
    height: 140,
    resizeMode: 'contain',
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
  forgotLinkContainer: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotLinkText: {
    color: '#0D6EFD',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;