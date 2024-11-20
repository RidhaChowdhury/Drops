import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/theme-provider';
import {
   Bell,
   BellOff,
   Bomb,
   Moon,
   Sun,
   FileDown,
   FileUp,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/state/store';
import { performSQLAction } from '@/state/databaseSlice';

import { convertFromOunces, convertToOunces } from '@/utils/conversionUtils';
import { Button } from '@/components/base-ui/button';
import { Input } from '@/components/base-ui/input';
import { Label } from '@/components/base-ui/label';
import { ScrollArea } from '@/components/base-ui/scroll-area';
import { Separator } from '@/components/base-ui/separator';
import { ContentSwitch } from '@/components/extended-ui/content-switch';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/base-ui/select';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function SettingsScreen() {
   const { theme, setTheme } = useTheme();
   const dispatch = useDispatch<AppDispatch>();
   const {
      settings,
      updateDailyIntakeGoal,
      updateMeasurementUnit,
      toggleNotifications,
      updateNotificationDelay,
      backupSettingsData,
      loadSettingsFromCSV,
   } = useSettings();

   const [notificationDelay, setNotificationDelay] = useState<number>(60);

   const displayedDailyGoal = convertFromOunces(
      settings.dailyIntakeGoal,
      settings.measurementUnit
   );
   const units: Array<'oz' | 'mL' | 'L' | 'cups'> = ['oz', 'mL', 'L', 'cups'];

   const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newGoalInUnit = parseFloat(e.target.value);
      const newGoalInOunces = convertToOunces(
         newGoalInUnit,
         settings.measurementUnit
      );
      updateDailyIntakeGoal(newGoalInOunces);
   };

   const cancelAllNotifications = async () => {
      const scheduled = await LocalNotifications.getPending();
      if (scheduled.notifications.length > 0) {
         await LocalNotifications.cancel({
            notifications: scheduled.notifications.map((n) => ({ id: n.id })),
         });
      }
   };

   const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const delay = parseInt(e.target.value);
      setNotificationDelay(delay);
      updateNotificationDelay(delay);
   };

   useEffect(() => {
      LocalNotifications.requestPermissions();
   }, []);

   const handleClearHistory = async () => {
      const confirmed = window.confirm(
         "Are you sure you want to clear the full history? This action cannot be undone."
      );
      if (confirmed) {
         try {
            await dispatch(
               performSQLAction({
                  action: async (db) => {
                     // Drop the table
                     await db.run(`DROP TABLE IF EXISTS water_intake`);
                     console.log("Table dropped successfully");

                     // Recreate the table
                     await db.run(`
                        CREATE TABLE IF NOT EXISTS water_intake (
                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                           amount INTEGER NOT NULL,
                           drink_type TEXT NOT NULL,
                           timestamp TEXT NOT NULL
                        );
                     `);
                     console.log("Table recreated successfully");
                  },
               })
            ).unwrap();
         } catch (error) {
            console.error("Error resetting water_intake table:", error);
         }
      }
   };

   return (
      <div
         className={`relative flex flex-col items-center justify-center min-h-screen font-sans ${
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'
         }`}
      >
         <ScrollArea className="w-full max-w-lg mx-auto px-4 pt-4 h-full">
            {/* General Settings */}
            <div className="relative z-10 flex flex-col items-center w-full space-y-8">
               <div className="text-left w-full mb-4">
                  <h1 className="text-4xl font-bold">General Settings</h1>
               </div>

               <div className="flex items-center justify-between w-full">
                  <Label className="text-lg">Theme</Label>
                  <ContentSwitch
                     checked={theme === 'dark'}
                     onCheckedChange={(checked: boolean) =>
                        setTheme(checked ? 'dark' : 'light')
                     }
                     checkedContent={<Moon className="h-3 w-3" />}
                     uncheckedContent={<Sun className="h-3 w-3" />}
                     className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                  />
               </div>

               <div className="flex items-center justify-between w-full">
                  <Label className="text-lg">Unit</Label>
                  <Select
                     value={settings.measurementUnit}
                     onValueChange={(value: 'oz' | 'mL' | 'L' | 'cups') =>
                        updateMeasurementUnit(value)
                     }
                  >
                     <SelectTrigger className="w-24 rounded-xl border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
                        <SelectValue placeholder="Select unit" />
                     </SelectTrigger>
                     <SelectContent className="rounded-xl">
                        {units.map((unit) => (
                           <SelectItem key={unit} value={unit}>
                              {unit}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
               </div>

               <div className="flex items-center justify-between w-full">
                  <Label className="text-lg">Daily Goal</Label>
                  <div className="flex items-center">
                     <Input
                        type="number"
                        value={displayedDailyGoal.toFixed(1)}
                        onChange={handleGoalChange}
                        className="w-28 rounded-xl bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
                     />
                     <span className="ml-2">{settings.measurementUnit}</span>
                  </div>
               </div>

               <Separator className="my-4" />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full space-y-8">
               <div className="text-left w-full mb-4">
                  <h2 className="text-3xl font-bold">Notification Settings</h2>
               </div>

               <div className="flex items-center justify-between w-full">
                  <Label className="text-lg">Enable Notifications</Label>
                  <ContentSwitch
                     checked={settings.notificationsEnabled}
                     onCheckedChange={async (checked: boolean) => {
                        toggleNotifications(checked);

                        if (!checked) {
                           await cancelAllNotifications();
                        }
                     }}
                     checkedContent={<Bell className="h-3 w-3" />}
                     uncheckedContent={<BellOff className="h-3 w-3" />}
                     className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                  />
               </div>

               {settings.notificationsEnabled && (
                  <>
                     {/* <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Sound</Label>
                        <ContentSwitch
                           checked={settings.soundEnabled}
                           onCheckedChange={handleToggleSound}
                           checkedContent={<Volume2 className="h-3 w-3" />}
                           uncheckedContent={<VolumeX className="h-3 w-3" />}
                           className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                        />
                     </div>

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Vibration</Label>
                        <ContentSwitch
                           checked={settings.vibrationEnabled}
                           onCheckedChange={handleToggleVibration}
                           checkedContent={<Vibrate className="h-3 w-3" />}
                           uncheckedContent={<VibrateOff className="h-3 w-3" />}
                           className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                        />
                     </div> */}

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Notify my after </Label>
                        <div className="flex items-center">
                           <Input
                              type="number"
                              value={notificationDelay}
                              onChange={handleDelayChange}
                              className="w-14 rounded-2xl border-2 border-transparent text-center bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
                           />
                           <span className="ml-2">Minutes</span>
                        </div>
                     </div>
                  </>
               )}

               <Separator className="my-4" />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full space-y-4">
               <div className="text-left w-full mb-4">
                  <h2 className="text-3xl font-bold">Data Management</h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                  <Button
                     variant="secondary"
                     onClick={backupSettingsData}
                     disabled={true}
                     className="rounded-2xl"
                  >
                     <FileDown className="mr-2 h-4 w-4" />
                     Export Data (CSV)
                  </Button>
                  <Button
                     variant="secondary"
                     onClick={loadSettingsFromCSV}
                     disabled={true}
                     className="rounded-2xl"
                  >
                     <FileUp className="mr-2 h-4 w-4" />
                     Load Data (CSV)
                  </Button>
                  <Button variant="destructive" onClick={handleClearHistory}>
                     <Bomb className="mr-2 h-4 w-4" />
                     Clear Full History
                  </Button>
               </div>
            </div>
         </ScrollArea>
      </div>
   );
}
