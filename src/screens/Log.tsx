import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useTheme } from '@/hooks/theme-provider';

import { Button } from '@/components/base-ui/button';
import WaterEntryDrawer from '@/components/WaterEntryDrawer';
import FAB from '@/components/extended-ui/fab';
import FABRow from '@/components/extended-ui/fab-row';

import { convertFromOunces, convertToOunces } from '@/utils/conversionUtils';
import { getWaterHistory, saveWaterHistory } from '@/utils/storageUtils';

import { toast } from 'sonner';
import Wave from 'react-wavify';
import { Plus, Droplet, RotateCcw, GlassWater } from 'lucide-react';

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

   const [quickAddValues, setQuickAddValues] = useState(() =>
      JSON.parse(localStorage.getItem('quickAddValues') || '[8, 16]')
   );
   const [isQuickAddDrawerOpen, setIsQuickAddDrawerOpen] = useState(false);
   const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
   const [currentButton, setCurrentButton] = useState<number | null>(null);
   const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);
   const [isAddingNew, setIsAddingNew] = useState(false);
   const [showFABs, setShowFABs] = useState(false);

   const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);

   // long press handler
   const handleLongPress = (callback: () => void, delay = 500) => {
      const timeout = setTimeout(() => {
         callback();
      }, delay);
   
      return timeout;
   };

   const handleQuickAddMouseDown = (index: number) => {
      const timeout = handleLongPress(() => handleLongPressQuickAdd(index));
      setLongPressTimeout(timeout);
   };

   const handleUndoMouseDown = () => {
      const timeout = handleLongPress(handleLongPressUndo);
      setLongPressTimeout(timeout);
   };

   const handleMouseUp = () => {
      if (longPressTimeout) {
         clearTimeout(longPressTimeout);
      }
   };

   const handleMouseLeave = () => {
      if (longPressTimeout) {
         clearTimeout(longPressTimeout);
      }
   };

   const handleLongPressQuickAdd = (index: number) => {
      setCurrentButton(index);
      setNewQuickAddValue(convertFromOunces(quickAddValues[index], measurementUnit));
      setIsAddingNew(false);
      setIsQuickAddDrawerOpen(true);
   };

   const handleLongPressUndo = () => {
      setWaterIntake(0);
      setDrinkLog([]);
   }

   useEffect(() => {
      return () => {
         if (longPressTimeout) {
            clearTimeout(longPressTimeout);
         }
      };
   }, [longPressTimeout]);

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

   const handleAddNewQuickAdd = () => {
      setNewQuickAddValue(16);
      setIsAddingNew(true);
      setIsQuickAddDrawerOpen(true);
   };

   const handleSaveQuickAdd = () => {
      const newQuickAddValueInOz = convertToOunces(
         newQuickAddValue,
         measurementUnit
      );

      if (quickAddValues.includes(newQuickAddValueInOz)) {
         toast('This quick add value already exists', {
            description: `Quick add value of ${newQuickAddValueInOz} oz is already available.`,
            action: {
               label: 'Dismiss',
               onClick: () => console.log('Dismiss'),
            },
         });
         return;
      }

      if (isAddingNew) {
         const updatedQuickAddValues = [
            ...quickAddValues,
            Math.max(1, newQuickAddValueInOz),
         ];
         setQuickAddValues(updatedQuickAddValues);
      } else if (currentButton !== null) {
         const newValues = [...quickAddValues];
         newValues[currentButton] = Math.max(1, newQuickAddValueInOz);
         setQuickAddValues(newValues);
      }

      setIsQuickAddDrawerOpen(false);
   };

   const handleDeleteQuickAdd = () => {
      const newValues = quickAddValues.filter(
         (_: any, index: number) => index !== currentButton
      );
      setQuickAddValues(newValues);
      setIsQuickAddDrawerOpen(false);
   };

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

            <div className="flex flex-wrap justify-center gap-6 mb-8">
               {quickAddValues
                  .sort((a: number, b: number) => a - b)
                  .map((value: number, index: number) => (
                     <Button
                        key={index}
                        onClick={() =>
                           handleAddWater(
                              convertFromOunces(value, measurementUnit)
                           )
                        }
                        onMouseDown={() => handleQuickAddMouseDown(index)}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={() => handleQuickAddMouseDown(index)} // Add touchstart
                        onTouchEnd={handleMouseUp} // Add touchend            
                        className="px-6 py-4 rounded-2xl text-2xl h-16 min-w-20 flex items-baseline justify-center"
                     >
                        <span className="text-2xl">
                           {convertFromOunces(value, measurementUnit).toFixed(
                              1
                           )}
                        </span>{' '}
                        <span className="text-base ml-1">
                           {measurementUnit}
                        </span>
                     </Button>
                  ))}
               <Button
                  onClick={handleAddNewQuickAdd}
                  variant="secondary"
                  className="rounded-2xl text-2xl h-16 w-16 flex items-center justify-center"
               >
                  <Plus />
               </Button>
            </div>
         </div>

         {/* Floating Action Buttons (FABs) */}
         <FABRow isActive={isActive} showFABs={showFABs}>
            <FAB
               onClick={handleUndo}
               onMouseDown={() => handleUndoMouseDown()}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseLeave}
               onTouchStart={() => handleUndoMouseDown()} // Add touchstart
               onTouchEnd={handleMouseUp} // Add touchend      
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

         {/* Quick Add Drawer */}
         <WaterEntryDrawer
            isOpen={isQuickAddDrawerOpen}
            title={isAddingNew ? 'New Quick Add' : 'Edit Quick Add Value'}
            value={newQuickAddValue}
            onClose={() => setIsQuickAddDrawerOpen(false)}
            onSave={handleSaveQuickAdd}
            onIncrease={() => setNewQuickAddValue((prev) => prev + 1)}
            onDecrease={() =>
               setNewQuickAddValue((prev) => Math.max(1, prev - 1))
            }
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            isAddingNew={isAddingNew}
            onDelete={currentButton !== null ? handleDeleteQuickAdd : undefined}
         />

         {/* Custom Amount Drawer */}
         <WaterEntryDrawer
            isOpen={isCustomDrawerOpen}
            title="Add Custom Amount"
            value={newQuickAddValue}
            onClose={() => setIsCustomDrawerOpen(false)}
            onSave={handleSaveCustomAmount}
            onIncrease={() => setNewQuickAddValue((prev) => prev + 1)}
            onDecrease={() =>
               setNewQuickAddValue((prev) => Math.max(1, prev - 1))
            }
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            isAddingNew={true} // Custom add should show "Add"
         />
      </div>
   );
}
