import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CreateHabitScreen from '../screens/CrateHabitScreen';
import ComunityScreen from '../screens/ComunityScreen';
import StreakHeader from '../components/StreakHeader';


const Tab = createBottomTabNavigator();

export const BottomTab = () => {
    return(
        <Tab.Navigator

            screenOptions={{
                tabBarActiveTintColor: '#4F46E5',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tab.Screen
                name="Comunidad"
                component={ComunityScreen}
                options={{
                    headerShown: false,

                }}
            />


            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: 'Mis Hábitos',
                    headerRight: () => <StreakHeader />,

                }}
            />

            <Tab.Screen
                name="Agregar"
                component={CreateHabitScreen}
                options={{
                    title: 'Nuevo Hábito',

                }}
            />

            <Tab.Screen
                name="Stats"
                component={StatsScreen}
                options={{
                    title: 'Estadísticas',

                }}
            />

            <Tab.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    title: 'Ajustes',

                }}
            />

        </Tab.Navigator>
    );
};