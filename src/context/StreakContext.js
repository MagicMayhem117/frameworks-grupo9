
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STREAK_KEY = 'streak';
const LAST_PRESSED_DATE_KEY = 'lastPressedDate';

const StreakContext = createContext();

export const StreakProvider = ({ children }) => {
  const [streak, setStreak] = useState(0);
  const [canIncrement, setCanIncrement] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const storedStreak = await AsyncStorage.getItem(STREAK_KEY);
      const storedDate = await AsyncStorage.getItem(LAST_PRESSED_DATE_KEY);

      const currentStreak = storedStreak ? parseInt(storedStreak, 10) : 0;
      setStreak(currentStreak);

      if (storedDate) {
        const lastDate = new Date(storedDate);
        const today = new Date();

        const isToday = lastDate.getFullYear() === today.getFullYear() &&
                      lastDate.getMonth() === today.getMonth() &&
                      lastDate.getDate() === today.getDate();

        setCanIncrement(!isToday);

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const isYesterday = lastDate.getFullYear() === yesterday.getFullYear() &&
                            lastDate.getMonth() === yesterday.getMonth() &&
                            lastDate.getDate() === yesterday.getDate();

        if (!isToday && !isYesterday) {
          setStreak(0);
          await AsyncStorage.setItem(STREAK_KEY, '0');
        }
      }
    } catch (error) {
      console.error("Error loading streak data", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Re-check every hour in case the day has changed
    const interval = setInterval(loadData, 3600000); 
    return () => clearInterval(interval);
  }, [loadData]);

  const incrementStreak = async () => {
    if (!canIncrement) {
      console.log("Streak already incremented today.");
      return;
    }

    try {
      const newStreak = streak + 1;
      const today = new Date();

      setStreak(newStreak);
      setCanIncrement(false);

      await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
      await AsyncStorage.setItem(LAST_PRESSED_DATE_KEY, today.toISOString());

    } catch (error) {
      console.error("Error incrementing streak", error);
    }
  };
  
  // Reload data when app comes to foreground
  useEffect(() => {
    const { AppState } = require('react-native');
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadData();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadData]);


  return (
    <StreakContext.Provider value={{ streak, canIncrement, incrementStreak, refreshStreak: loadData }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (context === undefined) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};
