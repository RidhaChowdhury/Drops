import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ridhachowdhury.hydrated',
  appName: 'hydrated',
  webDir: 'dist',
  plugins: {
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
