import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
   appId: 'com.ridhachowdhury.Drops',
   appName: 'Drops',
   webDir: 'dist',
   plugins: {
      SplashScreen: {
         launchShowDuration: 3000,
         launchAutoHide: true,
         backgroundColor: '#0A0A0F',
         androidSplashResourceName: 'splash',
         splashFullScreen: true,
         splashImmersive: true,
         layoutName: 'launch_screen',
      },
   },
};

export default config;
