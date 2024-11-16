import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SettingsState {
   dailyIntakeGoal: number;
   measurementUnit: 'oz' | 'mL' | 'L' | 'cups';
   notificationsEnabled: boolean;
}

const initialState: SettingsState = {
   dailyIntakeGoal: 150,
   measurementUnit: 'oz',
   notificationsEnabled: false,
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
   clearHistory,
   backupData,
   loadFromCSV,
} = settingsSlice.actions;

export default settingsSlice.reducer;
