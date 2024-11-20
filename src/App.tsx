import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { useSwipeable } from 'react-swipeable';

import { RootState, AppDispatch, store } from '@/state/store';
import { ThemeProvider } from '@/hooks/theme-provider';
import { useDispatch, useSelector } from 'react-redux';
import { initializeDB } from '@/state/databaseSlice';

import Log from '@/screens/Log';
import SettingsScreen from '@/screens/Settings';
import TabNavigation from '@/components/TabNavigation';

import { Toaster } from '@/components/base-ui/toaster';
import MetricsScreen from './screens/Metrics';

export default function App() {
   const dispatch = useDispatch<AppDispatch>();
   const { initialized, isInitializing, error } = useSelector((state: RootState) => state.database);

   useEffect(() => {
      dispatch(initializeDB());
   }, [dispatch]);

   const [selectedTab, setSelectedTab] = useState('water');

   const tabs = [
      { label: 'Water', value: 'water' },
      { label: 'Metrics', value: 'metrics' },
      { label: 'Settings', value: 'settings' },
   ];

   const getTabIndex = () => tabs.findIndex((tab) => tab.value === selectedTab);

   const handlers = useSwipeable({
      onSwipedLeft: () => handleSwipeLeft(),
      onSwipedRight: () => handleSwipeRight(),
      preventScrollOnSwipe: true,
      trackMouse: true,
   });

   const handleSwipeLeft = () => {
      const currentIndex = getTabIndex();
      const nextIndex = (currentIndex + 1) % tabs.length;
      setSelectedTab(tabs[nextIndex].value);
   };

   const handleSwipeRight = () => {
      const currentIndex = getTabIndex();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      setSelectedTab(tabs[prevIndex].value);
   };

   if (isInitializing) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <img 
               src="/src/assets/splash.png" 
               alt="Hydrated Splash Screen"
               className="max-w-full max-h-full object-contain"
            />
         </div>
      );
   }

   if (!initialized) {
      return (
         <div className="flex items-center justify-center min-h-screen">
            <div className="text-center text-red-600 dark:text-red-400 p-4">
               <div>Failed to initialize database</div>
               {error && <div className="mt-2 text-sm">{error}</div>}
            </div>
         </div>
      );
   }

   return (
      <Provider store={store}>
         <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div
               className="relative min-h-screen w-full flex flex-col items-center justify-center"
               {...handlers}
            >
               <div className="relative w-full min-h-screen overflow-hidden">
                  <div
                     className="absolute inset-0 w-full transition-transform duration-500"
                     style={{
                        transform: `translateX(-${getTabIndex() * 100}%)`,
                     }}
                  >
                     <div className="w-full min-h-screen absolute top-0 left-0">
                        <Log isActive={selectedTab === 'water'} />
                     </div>
                     <div className="w-full min-h-screen absolute top-0 left-full">
                        <MetricsScreen />
                     </div>
                     <div className="w-full min-h-screen absolute top-0 left-[200%]">
                        <SettingsScreen />
                     </div>
                  </div>
               </div>
               <TabNavigation
                  selectedTab={selectedTab}
                  onTabChange={setSelectedTab}
               />
            </div>
            <Toaster />
         </ThemeProvider>
      </Provider>
   );
}
