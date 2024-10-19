import { useState } from 'react';
import { Provider } from 'react-redux';
import { useSwipeable } from 'react-swipeable';

import { store } from '@/store';
import { ThemeProvider } from '@/hooks/theme-provider';

import Log from '@/screens/Log';
import SettingsScreen from '@/screens/Settings';
import TabNavigation from '@/components/TabNavigation';

import { Toaster } from '@/components/base-ui/sonner';

import useSQLiteDB from './db/useSQLiteDB';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';

import { useEffect } from 'react';


type SQLItem = {
  id: number;
  name: string;
};

export default function App() {
   const [selectedTab, setSelectedTab] = useState('water');
   const {performSQLAction, initialized} = useSQLiteDB();
   const [items, setItems] = useState<Array<SQLItem>>();

   useEffect(()=>{
      loadData();
      // CREATE TABLE IF NOT EXISTS test (
      // id INTEGER PRIMARY KEY NOT NULL,
      // name TEXT NOT NULL
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`INSERT into test (name) values ('MEESTERJORGE');`);
        setItems(respSelect?.values);
      });
      performSQLAction(
        async (db: SQLiteDBConnection | undefined) => {
          // update ui
          const respSelect = await db?.query(`SELECT * FROM test;`);
          setItems(respSelect?.values);
        });
      console.log("items are" + items);
   }, [initialized]);

   const loadData = async () => {
    try {
      // query db
      performSQLAction(async (db: SQLiteDBConnection | undefined) => {
        const respSelect = await db?.query(`SELECT * FROM test`);
        setItems(respSelect?.values);
      });
    } catch (error) {
      alert((error as Error).message);
      setItems([]);
    }
  };

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
                                   <h1>Stuff</h1>
                                   {items?.map((item, index) => (
                                       <div key={index}>
                                          <p>{item.name}</p>
                                       </div>
                                    ))}
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
