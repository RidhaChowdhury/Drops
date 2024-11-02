import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
   appId: 'com.ridhachowdhury.hydrated',
   appName: 'hydrated',
   webDir: 'dist',
   plugins: {
      SplashScreen: {
         launchShowDuration: 3000, // Duration in milliseconds
         launchAutoHide: true, // Automatically hide splash screen after duration
         backgroundColor: '#0A0A0F', // Splash screen background color (HEX format)
         showSpinner: true, // Show spinner on splash screen
         androidSpinnerStyle: 'large', // Spinner style for Android
         iosSpinnerStyle: 'small', // Spinner style for iOS
         spinnerColor: '#FFFFFF', // Spinner color
      },
   },
};

export default config;
