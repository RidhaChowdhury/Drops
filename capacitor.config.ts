import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ridhachowdhury.Drops',
  appName: 'Drops',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0, // We'll control this programmatically
      launchAutoHide: false, // We'll hide it manually
      backgroundColor: '#0a0b15',
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      showSpinner: false, // Don't show the spinner since we're controlling the animation
      androidScaleType: 'CENTER_CROP',
      spinnerColor: '#999999',
    },
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,  // Set to 'true' if you want encrypted storage
      iosKeychainPrefix: 'hydrated-sqlite',
      androidIsEncryption: false, // Set to 'true' for encryption
      electronIsEncryption: false, // Set to 'true' if you use Electron
      androidBiometric: {
        biometricAuth: false, // Set to 'true' if you plan to use biometric login
        biometricTitle: "Biometric login for Hydrated",
        biometricSubTitle: "Log in to track water intake"
      },
      iosBiometric: {
        biometricAuth: false, // Optional: Enable iOS biometric login
        biometricTitle: "Biometric login for Hydrated"
      },
      electronWindowsLocation: "C:\\ProgramData\\HydratedDatabases", // Optional for Electron
      electronMacLocation: "/Volumes/Development/HydratedDatabases",
      electronLinuxLocation: "Databases"
    }
  }
};

export default config;
