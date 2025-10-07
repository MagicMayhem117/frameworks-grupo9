
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RachaScreen from './src/screens/RachaScreen';

import { StreakProvider } from './src/context/StreakContext';
import StreakHeader from './src/components/StreakHeader'; // <-- Importamos el nuevo componente

import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '919090861349-0fd8gtg71kbhvkb44q8asps91u7nchph.apps.googleusercontent.com',
});

const Stack = createNativeStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  function onAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null;

  return (
    <StreakProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              {/* Modificamos la pantalla Home para usar el header personalizado */}
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{
                  title: 'Mis Hábitos',
                  headerRight: () => <StreakHeader />,
                }}
              />
              <Stack.Screen name="Racha" component={RachaScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </StreakProvider>
  );
};

export default App;
