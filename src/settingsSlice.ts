import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  dailyIntakeGoal: number;
  measurementUnit: 'oz' | 'mL' | 'L' | 'cups'; // Added all unit types
  notificationsEnabled: boolean;  // New notification state
}

const initialState: SettingsState = {
  dailyIntakeGoal: 150,
  measurementUnit: 'oz',
  notificationsEnabled: false,  // Notifications default to disabled
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setDailyIntakeGoal: (state, action: PayloadAction<number>) => {
      state.dailyIntakeGoal = action.payload;
    },
    setMeasurementUnit: (state, action: PayloadAction<'oz' | 'mL' | 'L' | 'cups'>) => {
      state.measurementUnit = action.payload;
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notificationsEnabled = action.payload;  // New reducer for notifications
    },
    clearHistory: (state) => {
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
  setNotificationsEnabled,  // New notification action
  clearHistory, 
  backupData, 
  loadFromCSV 
} = settingsSlice.actions;

export default settingsSlice.reducer;
