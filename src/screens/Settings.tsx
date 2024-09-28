import { useState } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/theme-provider';
import {
   Volume2,
   VolumeX,
   Vibrate,
   VibrateOff,
   Plus,
   Trash2,
} from 'lucide-react';

import { convertFromOunces, convertToOunces } from '@/utils/conversionUtils';

import { Button } from '@/components/base-ui/button';
import { Input } from '@/components/base-ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/base-ui/select';
import { Label } from '@/components/base-ui/label';
import { ScrollArea } from '@/components/base-ui/scroll-area';
import { Separator } from '@/components/base-ui/separator';
import { ContentSwitch } from '@/components/extended-ui/content-switch';
import TimePicker from '@/components/extended-ui/time-picker';

import { Sun, Moon, Bell, BellOff, FileDown, FileUp, Bomb } from 'lucide-react';

export default function SettingsScreen() {
   const { theme, setTheme } = useTheme();
   const {
      settings,
      updateDailyIntakeGoal,
      updateMeasurementUnit,
      toggleNotifications,
      toggleSound,
      toggleVibration,
      clearAllHistory,
      backupSettingsData,
      loadSettingsFromCSV,
   } = useSettings();

   const [notificationTimes, setNotificationTimes] = useState<string[]>(['']);

   const units: Array<'oz' | 'mL' | 'L' | 'cups'> = ['oz', 'mL', 'L', 'cups'];

   const displayedDailyGoal = convertFromOunces(
      settings.dailyIntakeGoal,
      settings.measurementUnit
   );

   const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newGoalInUnit = parseFloat(e.target.value);
      const newGoalInOunces = convertToOunces(
         newGoalInUnit,
         settings.measurementUnit
      );
      updateDailyIntakeGoal(newGoalInOunces);
   };

   const handleTimeChange = (index: number) => (time: string) => {
      const newTimes = [...notificationTimes];
      newTimes[index] = time;
      setNotificationTimes(newTimes);
   };

   const addTimePicker = () => {
      setNotificationTimes([...notificationTimes, '']);
   };

   const removeTimePicker = (index: number) => {
      const newTimes = notificationTimes.filter((_, i) => i !== index);
      setNotificationTimes(newTimes);
   };

   return (
      <div
         className={`relative flex flex-col items-center justify-center min-h-screen font-sans ${
            theme === 'dark'
               ? 'bg-gray-900 text-white'
               : 'bg-gray-100 text-black'
         }`}
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
                     className="bg-neutral-200 dark:bg-neutral-800"
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
                     <SelectTrigger className="w-24 rounded-full border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
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
                        className="w-28 rounded-full border-2 border-transparent bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
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
                     onCheckedChange={(checked: boolean) =>
                        toggleNotifications(checked)
                     }
                     checkedContent={<Bell className="h-3 w-3" />}
                     uncheckedContent={<BellOff className="h-3 w-3" />}
                     className="bg-neutral-200 dark:bg-neutral-800"
                  />
               </div>

               {settings.notificationsEnabled && (
                  <>
                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Sound</Label>
                        <ContentSwitch
                           checked={settings.soundEnabled}
                           onCheckedChange={(checked: boolean) =>
                              toggleSound(checked)
                           }
                           checkedContent={<Volume2 className="h-3 w-3" />}
                           uncheckedContent={<VolumeX className="h-3 w-3" />}
                           className="bg-neutral-200 dark:bg-neutral-800"
                        />
                     </div>

                     <div className="flex items-center justify-between w-full">
                        <Label className="text-lg">Vibration</Label>
                        <ContentSwitch
                           checked={settings.vibrationEnabled}
                           onCheckedChange={(checked: boolean) =>
                              toggleVibration(checked)
                           }
                           checkedContent={<Vibrate className="h-3 w-3" />}
                           uncheckedContent={<VibrateOff className="h-3 w-3" />}
                           className="bg-neutral-200 dark:bg-neutral-800"
                        />
                     </div>

                     <div className="relative flex flex-col w-full space-y-4">
                        <h3 className="text-xl font-bold">Reminders</h3>

                        {notificationTimes.map((time, index) => (
                           <div
                              key={index}
                              className="flex items-center justify-end space-x-2"
                           >
                              <TimePicker
                                 onTimeChange={handleTimeChange(index)}
                              />
                              <Button
                                 onClick={() => removeTimePicker(index)}
                                 variant="ghost"
                                 size="icon"
                                 className="ml-2"
                              >
                                 <Trash2 className="h-4 w-4" />
                              </Button>
                           </div>
                        ))}

                        {/* Wrapper to control the height and avoid overlapping */}
                        <div
                           className="relative w-full pb-6"
                        >
                           <Button
                              onClick={addTimePicker}
                              variant="outline"
                              size="icon"
                              className="absolute bottom-0 right-1 w-8 h-8 rounded-full border-2 border-transparent bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
                           >
                              <Plus className="h-4 w-4" />
                           </Button>
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
                  >
                     <FileDown className="mr-2 h-4 w-4" />
                     Export Data (CSV)
                  </Button>
                  <Button
                     variant="secondary"
                     onClick={loadSettingsFromCSV}
                     disabled={true}
                  >
                     <FileUp className="mr-2 h-4 w-4" />
                     Load Data (CSV)
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={clearAllHistory}
                     disabled={true}
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
