import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import MainScreen from '../screens/MainScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CrateHabitScreen from '../screens/CrateHabitScreen';

const Tab = createBottomTabNavigator();

export const BottomTab = () =>{
    return(
        <Tab.Navigator>
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
              <Tab.Screen name="Main" component={MainScreen} />
              <Tab.Screen name="Agregar" component={CrateHabitScreen} />
        </Tab.Navigator>
    );
}