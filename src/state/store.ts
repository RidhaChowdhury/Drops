import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistCombineReducers, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import { PersistConfig } from 'redux-persist/es/types';
import autoMergeLevel1 from 'redux-persist/lib/stateReconciler/autoMergeLevel1';
import CapacitorStorage from 'redux-persist-capacitor';
import settingsReducer from './settingsSlice';
import databaseReducer from './databaseSlice';

const persistConfig: PersistConfig<any> = {
  key: 'root',
  storage: CapacitorStorage,
  stateReconciler: autoMergeLevel1,
  whitelist: ['settings']
};

const rootReducer = {
  settings: settingsReducer,
  database: databaseReducer,
};

const persistedReducer = persistCombineReducers(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
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
