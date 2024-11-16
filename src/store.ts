import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { PersistConfig } from 'redux-persist/es/types';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';
import CapacitorStorage from 'redux-persist-capacitor';
import settingsReducer, { SettingsState } from './settingsSlice';

const persistConfig: PersistConfig<SettingsState> = {
  key: 'root',
  storage: CapacitorStorage,
  stateReconciler: autoMergeLevel1,
  version: 1
};

const persistedReducer = persistReducer<SettingsState>(persistConfig, settingsReducer);

export const store = configureStore({
  reducer: {
    settings: persistedReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
