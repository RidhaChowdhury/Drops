import { useState } from 'react';
import { Provider } from 'react-redux';
import { useSwipeable } from 'react-swipeable';

import { store } from '@/store';
import { ThemeProvider } from '@/hooks/theme-provider';

import Log from '@/screens/Log';
import SettingsScreen from '@/screens/Settings';
import TabNavigation from '@/components/TabNavigation';

import { Toaster } from '@/components/base-ui/toaster';

export default function App() {
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
                        <div className="flex justify-center items-center h-full w-full min-h-screen">
                           <h1>Metrics screen placeholder</h1>
                        </div>
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
