// components/TabNavigation.tsx

import { Tabs, TabsList, TabsTrigger } from '@/components/base-ui/tabs';
import { GlassWater, BarChart, Settings } from 'lucide-react';

const tabs = [
   { label: 'Water', icon: <GlassWater />, value: 'water' },
   { label: 'Metrics', icon: <BarChart />, value: 'metrics' },
   { label: 'Settings', icon: <Settings />, value: 'settings' },
];

type TabNavigationProps = {
    selectedTab: string;             // string type for selectedTab
    onTabChange: (value: string) => void;  // function type for onTabChange
 };

export default function TabNavigation({ selectedTab, onTabChange }: TabNavigationProps) {
   return (
      <Tabs value={selectedTab} onValueChange={onTabChange}>
         <div className="fixed top-4 left-1/2 transform -translate-x-1/2">
            <TabsList className="flex justify-center space-x-4 bg-gray-800 text-white p-3 rounded-full shadow-lg">
               {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="flex items-center justify-center p-4 rounded-full">
                     {tab.icon}
                  </TabsTrigger>
               ))}
            </TabsList>
         </div>
      </Tabs>
   );
}
