import { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/theme-provider';

import WaterEntryDrawer from '@/components/WaterEntryDrawer';
import FAB from '@/components/extended-ui/fab';
import FABRow from '@/components/extended-ui/fab-row';

import { convertFromOunces, convertToOunces } from '@/utils/conversionUtils';
import { getWaterHistory } from '@/utils/storageUtils';

import { Droplet, RotateCcw, GlassWater } from 'lucide-react';
import Wave from 'react-wavify';

// import { SQLiteDBConnection } from "@capacitor-community/sqlite";
// import useSQLiteDB from "../db/useSQLiteDB";
import { useDispatch, useSelector } from 'react-redux';
import { performSQLAction } from '@/state/databaseSlice';
import { RootState, AppDispatch } from '@/state/store';

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


   const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
   const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);
   const [showFABs, setShowFABs] = useState(false);

   const dispatch = useDispatch<AppDispatch>();
   const { initialized } = useSelector((state: RootState) => state.database);

   useEffect(() => {
      if (isActive) {
         const timeout = setTimeout(() => setShowFABs(true), 100);
         return () => clearTimeout(timeout);
      } else {
         setShowFABs(false);
      }
   }, [isActive]);

   
   const handleUndo = async () => {
    try {
      // Step 1: Retrieve the most recent entry (highest id)
      const lastDrinkResult = await dispatch(
        performSQLAction({
          action: async (db) => {
            const result = await db.query(
              `SELECT id, amount, hydration_amount FROM water_intake ORDER BY id DESC LIMIT 1`
            );
            return result;
          },
        })
      ).unwrap();

      // Check if there is a last drink entry
      const lastDrink = lastDrinkResult?.values?.[0];
      
      if (lastDrink) {
        const lastDrinkAmount = lastDrink.hydration_amount;

        // Step 2: Delete the last drink entry by its id
        await dispatch(
          performSQLAction({
            action: async (db) => {
              await db.run(`DELETE FROM water_intake WHERE id = ?`, [lastDrink.id]);
            },
          })
        ).unwrap();

        // Step 3: Update the water intake state
        setWaterIntake((prev) => Math.max(0, prev - lastDrinkAmount));
      }
    } catch (error) {
      console.error("Error in handleUndo:", error);
    }
  };

   const handleClearAll = async () => {
    try {
      await dispatch(
        performSQLAction({
          action: async (db) => {
            const today = new Date().toISOString().split('T')[0];
            await db.run(
              `DELETE FROM water_intake WHERE date(timestamp) = date(?)`,
              [today]
            );
          },
        })
      ).unwrap();

      // Reset water intake to 0
      setWaterIntake(0);
    } catch (error) {
      console.error("Error clearing water intake:", error);
    }
  };

   const loadData = async () => {
    if (!initialized) return;

    try {
      const result = await dispatch(
        performSQLAction({
          action: async (db) => {
            const today = new Date().toISOString().split('T')[0];
            const query = `
              SELECT SUM(hydration_amount) as total_intake 
              FROM water_intake 
              WHERE date(timestamp) = date(?);
            `;
            return await db.query(query, [today]);
          },
        })
      ).unwrap();

      if (result?.values?.[0]?.total_intake) {
        setWaterIntake(result.values[0].total_intake);
      }
    } catch (error) {
      console.error("Error loading water intake:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialized]);

  const handleAddWater = async (amount: number, drinkType: string) => {
    const amountInOz = convertToOunces(amount, measurementUnit);
    const timestamp = new Date().toISOString();

    try {
      // Step 1: Get the hydration factor for the drink type
      const hydrationFactor = await dispatch(
        performSQLAction({
          action: async (db) => {
            const result = await db.query(
              `SELECT hydration_factor FROM drink_type WHERE name = ?`,
              [drinkType]
            );
            return result?.values?.[0]?.hydration_factor ?? 1.0;
          },
        })
      ).unwrap();

      // Calculate the hydration amount
      const hydrationAmount = amountInOz * hydrationFactor;

      // Step 2: Insert the new water intake record with hydration amount
      await dispatch(
        performSQLAction({
          action: async (db) => {
            await db.run(
              `INSERT INTO water_intake (amount, hydration_amount, drink_type, timestamp) 
               VALUES (?, ?, ?, ?)`,
              [amountInOz, hydrationAmount, drinkType, timestamp]
            );
          },
        })
      ).unwrap();

      // Step 3: Fetch the total hydration intake for today
      const totalIntake = await dispatch(
        performSQLAction({
          action: async (db) => {
            const result = await db.query(
              `SELECT SUM(hydration_amount) as totalIntake 
               FROM water_intake 
               WHERE DATE(timestamp) = DATE('now')`
            );
            return result?.values?.[0]?.totalIntake ?? 0;
          },
        })
      ).unwrap();

      // Update state with the fetched total intake
      setWaterIntake(totalIntake);
    } catch (error) {
      console.error("Error adding water intake:", error);
    }
  };
    
   const handleOpenCustomDrawer = () => {
      setNewQuickAddValue(16);
      setIsCustomDrawerOpen(true);
   };

   const handleSaveCustomAmount = (drinkType: string) => {
      handleAddWater(newQuickAddValue, drinkType);
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
         </div>

         {/* Floating Action Buttons (FABs) */}
         <FABRow isActive={isActive} showFABs={showFABs}>
            <FAB
               onClick={handleUndo}
               onLongPress={handleClearAll}
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
            onQuickAdd={handleAddWater} // New prop to handle quick add
         />
      </div>
   );
}
