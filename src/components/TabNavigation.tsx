import { GlassWater, BarChart, Settings } from 'lucide-react';
import { useTheme } from '@/hooks/theme-provider';

const tabs = [
   { label: 'Water', icon: GlassWater, value: 'water' },
   { label: 'Metrics', icon: BarChart, value: 'metrics' },
   { label: 'Settings', icon: Settings, value: 'settings' },
];

type TabNavigationProps = {
   selectedTab: string;
   onTabChange: (value: string) => void;
};

export default function TabNavigation({
   selectedTab,
   onTabChange,
}: TabNavigationProps) {
   const { theme } = useTheme();
   const iconColor = theme === 'dark' ? '#FFFFFF' : '#000000'; // Set icon color based on theme

   return (
      <div
         className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
      >
         <div className="fixed bottom-0 left-0 w-full flex">
            {tabs.map((tab) => {
               const IconComponent = tab.icon;
               return (
                  <button
                     key={tab.value}
                     onClick={() => onTabChange(tab.value)}
                     className="flex-1 flex flex-col items-center py-2"
                  >
                     <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${selectedTab === tab.value ? 'bg-white/10' : ''}`}
                     >
                        <IconComponent color={iconColor} />{' '}
                        {/* Dynamically set color */}
                     </div>
                  </button>
               );
            })}
         </div>
      </div>
   );
}
