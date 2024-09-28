import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
   dailyIntakeGoal: number;
   measurementUnit: 'oz' | 'mL' | 'L' | 'cups';
   notificationsEnabled: boolean;
   soundEnabled: boolean; // New sound setting
   vibrationEnabled: boolean; // New vibration setting
}

const initialState: SettingsState = {
   dailyIntakeGoal: 150,
   measurementUnit: 'oz',
   notificationsEnabled: false,
   soundEnabled: true, // Default to sound enabled
   vibrationEnabled: true, // Default to vibration enabled
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
         state.soundEnabled = action.payload; // New reducer for sound setting
      },
      setVibrationEnabled: (state, action: PayloadAction<boolean>) => {
         state.vibrationEnabled = action.payload; // New reducer for vibration setting
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
   setSoundEnabled, // Exporting sound toggle action
   setVibrationEnabled, // Exporting vibration toggle action
   clearHistory,
   backupData,
   loadFromCSV,
} = settingsSlice.actions;

export default settingsSlice.reducer;
