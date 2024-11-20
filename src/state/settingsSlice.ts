import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
   dailyIntakeGoal: number;
   measurementUnit: 'oz' | 'mL' | 'L' | 'cups';
   notificationsEnabled: boolean;
   soundEnabled: boolean;
   vibrationEnabled: boolean;
   notificationTimes: string[]; // Adjust notification times array to support start and end time
   notificationDelay: number;
}

const initialState: SettingsState = {
   dailyIntakeGoal: 150,
   measurementUnit: 'oz',
   notificationsEnabled: false,
   soundEnabled: true,
   vibrationEnabled: true,
   notificationTimes: ['08:00', '20:00'], // Default start and end time for notifications
   notificationDelay: 60
};

const settingsSlice = createSlice({
   name: 'settings',
   initialState,
   reducers: {
      setDailyIntakeGoal: (state, action: PayloadAction<number>) => {
         state.dailyIntakeGoal = action.payload;
      },
      setMeasurementUnit: (
         state,
         action: PayloadAction<'oz' | 'mL' | 'L' | 'cups'>
      ) => {
         state.measurementUnit = action.payload;
      },
      setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
         state.notificationsEnabled = action.payload;
      },
      setSoundEnabled: (state, action: PayloadAction<boolean>) => {
         state.soundEnabled = action.payload;
      },
      setVibrationEnabled: (state, action: PayloadAction<boolean>) => {
         state.vibrationEnabled = action.payload;
      },
      setNotificationDelay: (state, action: PayloadAction<number>) => {
         state.notificationDelay = action.payload; // Adjust to handle start and end time
      },
      clearHistory: () => {
         // Placeholder for clearing history logic
      },
      backupData: () => {
         // Placeholder for backing up data logic
      },
      loadFromCSV: () => {
         // Placeholder for loading from CSV logic
      },
   },
});

export const {
   setDailyIntakeGoal,
   setMeasurementUnit,
   setNotificationsEnabled,
   setSoundEnabled,
   setVibrationEnabled,
   setNotificationDelay, // Adjusted to handle start and end time
   clearHistory,
   backupData,
   loadFromCSV,
} = settingsSlice.actions;

export default settingsSlice.reducer;
