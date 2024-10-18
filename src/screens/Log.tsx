import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTheme } from '@/hooks/theme-provider';

import WaterEntryDrawer from '@/components/WaterEntryDrawer';
import FAB from '@/components/extended-ui/fab';
import FABRow from '@/components/extended-ui/fab-row';

import { convertFromOunces, convertToOunces } from '@/utils/conversionUtils';
import { getWaterHistory, saveWaterHistory } from '@/utils/storageUtils';

import { Droplet, RotateCcw, GlassWater } from 'lucide-react';
import Wave from 'react-wavify';

export default function Log({ isActive }: { isActive: boolean }) {
   const { theme } = useTheme();
   const dailyGoal = useSelector(
      (state: RootState) => state.settings.dailyIntakeGoal
   );
   const measurementUnit = useSelector(
      (state: RootState) => state.settings.measurementUnit
   );
   const currentDate = new Date().toISOString().split('T')[0];
   const waterHistory = getWaterHistory();

   const todayEntry = waterHistory.find((entry) => entry.date === currentDate);
   const [waterIntake, setWaterIntake] = useState(
      todayEntry ? todayEntry.intake : 0
   );
   const [drinkLog, setDrinkLog] = useState(
      todayEntry && todayEntry.drinkLog ? todayEntry.drinkLog : []
   );

   const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
   const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);
   const [showFABs, setShowFABs] = useState(false);

   useEffect(() => {
      if (isActive) {
         const timeout = setTimeout(() => setShowFABs(true), 100);
         return () => clearTimeout(timeout);
      } else {
         setShowFABs(false);
      }
   }, [isActive]);

   useEffect(() => {
      const updatedHistory = waterHistory.filter(
         (entry) => entry.date !== currentDate
      );
      updatedHistory.push({ date: currentDate, intake: waterIntake, drinkLog });
      saveWaterHistory(updatedHistory);
   }, [waterIntake, drinkLog, currentDate]);

   const handleUndo = () => {
      if (drinkLog.length > 0) {
         const lastDrink = drinkLog[drinkLog.length - 1];
         setWaterIntake((prev) => Math.max(0, prev - lastDrink));
         setDrinkLog((prev) => prev.slice(0, -1));
      }
   };

   const handleAddWater = (amount: number) => {
      const amountInOz = convertToOunces(amount, measurementUnit);
      setWaterIntake((prev) => prev + amountInOz);
      setDrinkLog((prev) => [...prev, amountInOz]);
   };

   const handleOpenCustomDrawer = () => {
      setNewQuickAddValue(16);
      setIsCustomDrawerOpen(true);
   };

   const handleSaveCustomAmount = () => {
      handleAddWater(newQuickAddValue);
      setIsCustomDrawerOpen(false);
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? 16 : parseInt(e.target.value);
      setNewQuickAddValue(value);
   };

   const handleInputBlur = () => {
      setNewQuickAddValue(Math.max(1, newQuickAddValue));
   };

   const handleQuickAddWater = (amount: number) => {
      // Directly add the selected quick add value
      handleAddWater(amount);
   };

   const displayedIntake = convertFromOunces(waterIntake, measurementUnit);
   const displayedGoal = convertFromOunces(dailyGoal, measurementUnit);

   return (
      <div
         className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
      >
         <div className="absolute top-6 left-6 z-10">
            <Droplet className="h-6 w-6" />
         </div>

         {/* Stacked Waves */}
         <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
            <div className="relative w-full" style={{ height: '105%' }}>
               <Wave
                  fill={theme === 'dark' ? '#153366' : '#1E40AF'}
                  paused={false}
                  options={{
                     height: 10,
                     amplitude: 14,
                     speed: 0.15,
                     points: 2,
                  }}
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     width: '100%',
                     height: `${(displayedIntake / displayedGoal) * 100 + 12}%`,
                     transition: 'height 0.5s ease',
                     zIndex: 0,
                  }}
               />

               <Wave
                  fill={theme === 'dark' ? '#17377A' : '#2563EB'}
                  paused={false}
                  options={{
                     height: 10,
                     amplitude: 12,
                     speed: 0.2,
                     points: 3,
                  }}
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     width: '100%',
                     height: `${(waterIntake / dailyGoal) * 100 + 10}%`,
                     transition: 'height 0.5s ease',
                     zIndex: 1,
                  }}
               />

               <Wave
                  fill={theme === 'dark' ? '#1E3A8A' : '#3B82F6'}
                  paused={false}
                  options={{
                     height: 10,
                     amplitude: 10,
                     speed: 0.3,
                     points: 5,
                  }}
                  style={{
                     position: 'absolute',
                     bottom: 0,
                     width: '100%',
                     height: `${(waterIntake / dailyGoal) * 100 + 8}%`,
                     transition: 'height 0.5s ease',
                     zIndex: 2,
                  }}
               />
            </div>
         </div>

         <div className="relative z-10 flex flex-col items-center">
            <div className="mb-10 text-center">
               <p className="text-8xl font-bold mt-4 flex items-baseline justify-center">
                  <span>{displayedIntake.toFixed(1)}</span>
                  <span className="text-4xl ml-2">{measurementUnit}</span>
               </p>
            </div>
         </div>

         {/* Floating Action Buttons (FABs) */}
         <FABRow isActive={isActive} showFABs={showFABs}>
            <FAB
               onClick={handleUndo}
               icon={RotateCcw}
               bgClass="bg-gray-700"
               variant="secondary"
            />
            <FAB
               onClick={handleOpenCustomDrawer}
               icon={GlassWater}
               variant="default"
            />
         </FABRow>

         {/* Custom Amount Drawer */}
         <WaterEntryDrawer
            isOpen={isCustomDrawerOpen}
            title="Add Custom Amount"
            value={newQuickAddValue}
            onClose={() => setIsCustomDrawerOpen(false)}
            onSaveCustom={handleSaveCustomAmount}
            onIncrease={() => setNewQuickAddValue((prev) => prev + 1)}
            onDecrease={() =>
               setNewQuickAddValue((prev) => Math.max(1, prev - 1))
            }
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onQuickAdd={handleQuickAddWater} // New prop to handle quick add
         />
      </div>
   );
}
