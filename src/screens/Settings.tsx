import { useState, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/theme-provider';
import {
   Volume2,
   VolumeX,
   Vibrate,
   VibrateOff,
   Bell,
   BellOff,
   Bomb,
   Moon,
   Sun,
   FileDown,
   FileUp,
} from 'lucide-react';

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
import TimePicker from '@/components/extended-ui/time-picker';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function SettingsScreen() {
   const { theme, setTheme } = useTheme();
   const {
      settings,
      updateDailyIntakeGoal,
      updateMeasurementUnit,
      toggleNotifications,
      toggleSound,
      toggleVibration,
      updateNotificationTimes,
      clearAllHistory,
      backupSettingsData,
      loadSettingsFromCSV,
   } = useSettings();

   // Set the default start time and end time to 8:00 AM and 8:00 PM
   const [startTime, setStartTime] = useState<string>('8:00 AM');
   const [endTime, setEndTime] = useState<string>('8:00 PM');
   const [frequency, setFrequency] = useState<number>(60); // Frequency in minutes

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

   // Function to cancel all scheduled notifications
   const cancelAllNotifications = async () => {
      const scheduled = await LocalNotifications.getPending(); // Get pending notifications
      if (scheduled.notifications.length > 0) {
         await LocalNotifications.cancel({
            notifications: scheduled.notifications.map((n) => ({ id: n.id })),
         });
      }
   };

   // Schedule notifications based on settings, and clear previously scheduled notifications first
   const scheduleNotifications = async () => {
      if (!settings.notificationsEnabled) return; // Only schedule if notifications are enabled

      // Clear all previous notifications to prevent duplication
      await cancelAllNotifications();

      if (frequency > 0) {
         let start = new Date();
         let end = new Date();

         // Helper function to convert 12-hour format to 24-hour format
         const convertTo24HourFormat = (time: string) => {
            const [timePart, period] = time.split(' '); // Splitting "HH:MM AM/PM"
            let [hour, minute] = timePart.split(':').map(Number);

            if (period === 'PM' && hour !== 12) {
               hour += 12; // Convert PM to 24-hour format
            } else if (period === 'AM' && hour === 12) {
               hour = 0; // Convert 12 AM to 00 in 24-hour format
            }

            return { hour, minute };
         };

         // Set the start time to 8:00 AM by default, if no input is provided
         if (!startTime) {
            start.setHours(8, 0); // 8:00 AM
         } else {
            const { hour: startHour, minute: startMinute } =
               convertTo24HourFormat(startTime);
            start.setHours(startHour, startMinute);
         }

         // Set the end time to 8:00 PM by default, if no input is provided
         if (!endTime) {
            end.setHours(20, 0); // 8:00 PM
         } else {
            const { hour: endHour, minute: endMinute } =
               convertTo24HourFormat(endTime);
            end.setHours(endHour, endMinute);
         }

         const notifications = [];
         const scheduledTimes = [];
         for (
            let time = start;
            time <= end;
            time.setMinutes(time.getMinutes() + frequency)
         ) {
            notifications.push({
               id: time.getTime(),
               title: 'Hydration Reminder',
               body: 'Stay hydrated!',
               schedule: { at: new Date(time) },
               sound: settings.soundEnabled ? 'default' : undefined,
               vibrate: settings.vibrationEnabled
                  ? [1000, 500, 1000]
                  : undefined,
            });
            scheduledTimes.push(new Date(time).toLocaleTimeString()); // Collect scheduled times
         }

         await LocalNotifications.schedule({ notifications });

         // Update the state with new start time, end time, and frequency
         updateNotificationTimes([
            startTime || '8:00 AM',
            endTime || '8:00 PM',
            frequency.toString(),
         ]);
      }
   };

   // Debouncing logic to only schedule when the user stops typing for 500ms
   useEffect(() => {
      const debounceTimeout = setTimeout(() => {
         if (settings.notificationsEnabled) {
            scheduleNotifications();
         }
      }, 500); // Delay for 500ms after user stops typing

      return () => clearTimeout(debounceTimeout); // Clear the timeout if the user is still typing
   }, [
      startTime,
      endTime,
      frequency,
      settings.notificationsEnabled,
      settings.soundEnabled,
      settings.vibrationEnabled,
   ]);

   // Reschedule notifications when sound or vibration is toggled
   const handleToggleSound = (checked: boolean) => {
      toggleSound(checked); // Update sound setting
      scheduleNotifications(); // Reschedule notifications with updated sound setting
   };

   const handleToggleVibration = (checked: boolean) => {
      toggleVibration(checked); // Update vibration setting
      scheduleNotifications(); // Reschedule notifications with updated vibration setting
   };

   // Request notification permissions on mount
   useEffect(() => {
      LocalNotifications.requestPermissions();
   }, []);

   return (
      <div
         className={`relative flex flex-col items-center justify-center min-h-screen font-sans ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
      >
         <ScrollArea className="w-full max-w-lg mx-auto p-4 h-screen pt-16">
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
                     <SelectTrigger className="w-24 rounded-2xl border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
                        <SelectValue placeholder="Select unit" />
                     </SelectTrigger>
                     <SelectContent className="rounded-lg">
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
                        className="w-28 rounded-2xl border-2 border-transparent bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
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
                        toggleNotifications(checked); // Update notification setting

                        if (!checked) {
                           // If notifications are turned off, cancel all scheduled notifications
                           await cancelAllNotifications();
                        } else {
                           // If notifications are turned on, reschedule notifications
                           await scheduleNotifications();
                        }
                     }}
                     checkedContent={<Bell className="h-3 w-3" />}
                     uncheckedContent={<BellOff className="h-3 w-3" />}
                     className="bg-neutral-200 dark:bg-neutral-800 rounded-2xl"
                  />
               </div>

               {settings.notificationsEnabled && (
                  <>
                     <div className="flex items-center justify-between w-full">
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
                     </div>

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Start Time</Label>
                        <TimePicker
                           onTimeChange={setStartTime}
                           defaultValue="8:00 AM"
                        />
                     </div>

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">End Time</Label>
                        <TimePicker
                           onTimeChange={setEndTime}
                           defaultValue="8:00 PM"
                        />
                     </div>

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Frequency</Label>
                        <div className="flex items-center">
                           <span className="mr-2">Every</span>
                           <Input
                              type="number"
                              value={frequency}
                              onChange={(e) =>
                                 setFrequency(parseInt(e.target.value))
                              }
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
                  <Button
                     variant="destructive"
                     onClick={clearAllHistory}
                     disabled={true}
                     className="rounded-2xl"
                  >
                     <Bomb className="mr-2 h-4 w-4" />
                     Clear Full History
                  </Button>
               </div>
            </div>
         </ScrollArea>
      </div>
   );
}
