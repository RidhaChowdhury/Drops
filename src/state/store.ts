// store.ts
import { configureStore } from '@reduxjs/toolkit';
import settingsReducer from './settingsSlice';
import databaseReducer from './databaseSlice';

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    database: databaseReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
