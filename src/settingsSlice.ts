import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  theme: 'light' | 'dark';
  dailyIntakeGoal: number;
  measurementUnit: 'oz' | 'ml';
}

const initialState: SettingsState = {
  theme: 'dark',
  dailyIntakeGoal: 150,
  measurementUnit: 'oz',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    setDailyIntakeGoal: (state, action: PayloadAction<number>) => {
      state.dailyIntakeGoal = action.payload;
    },
    setMeasurementUnit: (state, action: PayloadAction<'oz' | 'ml'>) => {
      state.measurementUnit = action.payload;
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

export const { setTheme, setDailyIntakeGoal, setMeasurementUnit, clearHistory, backupData, loadFromCSV } = 
  settingsSlice.actions;

export default settingsSlice.reducer;
