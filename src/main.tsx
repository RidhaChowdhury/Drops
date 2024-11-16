import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// Hide the splash screen when the app is ready
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await SplashScreen.hide();
  } catch (error) {
    console.warn('Unable to hide splash screen', error);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
