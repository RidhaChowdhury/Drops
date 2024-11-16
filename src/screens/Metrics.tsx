import { useTheme } from '@/hooks/theme-provider';

export default function MetricsScreen() {
   const { theme } = useTheme();
   return (
      <div
         className={`relative flex flex-col items-center justify-center h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
      >
         <div className="flex justify-center items-center h-full w-full min-h-screen">
            <p className="text-2xl">Metrics Coming Soon!</p>
         </div>
      </div>
   );
}
