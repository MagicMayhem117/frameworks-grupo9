import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import StatsScreen from '../screens/StatsScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CrateHabitScreen from '../screens/CrateHabitScreen';
import ComunityScreen from '../screens/ComunityScreen';

const Tab = createBottomTabNavigator();

export const BottomTab = () =>{
    return(
        <Tab.Navigator>
              <Tab.Screen name="Comunidad" component={ComunityScreen} />
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Agregar" component={CrateHabitScreen} />
              <Tab.Screen name="Stats" component={StatsScreen} />
              <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}