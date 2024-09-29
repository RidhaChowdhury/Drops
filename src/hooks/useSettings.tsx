import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
   setDailyIntakeGoal,
   setMeasurementUnit,
   setNotificationsEnabled,
   setSoundEnabled,
   setVibrationEnabled,
   setNotificationTimes, // Import for handling start and end times
   clearHistory,
   backupData,
   loadFromCSV,
} from '@/settingsSlice';

export function useSettings() {
   const dispatch = useDispatch();

   const settings = useSelector((state: RootState) => state.settings);

   const updateDailyIntakeGoal = (goal: number) =>
      dispatch(setDailyIntakeGoal(goal));
   const updateMeasurementUnit = (unit: 'oz' | 'mL' | 'L' | 'cups') =>
      dispatch(setMeasurementUnit(unit));
   const toggleNotifications = (enabled: boolean) =>
      dispatch(setNotificationsEnabled(enabled));
   const toggleSound = (enabled: boolean) => dispatch(setSoundEnabled(enabled));
   const toggleVibration = (enabled: boolean) =>
      dispatch(setVibrationEnabled(enabled));

   // New function to update notification times (start and end time)
   const updateNotificationTimes = (times: string[]) =>
      dispatch(setNotificationTimes(times));

   const clearAllHistory = () => dispatch(clearHistory());
   const backupSettingsData = () => dispatch(backupData());
   const loadSettingsFromCSV = () => dispatch(loadFromCSV());

   return {
      settings,
      updateDailyIntakeGoal,
      updateMeasurementUnit,
      toggleNotifications,
      toggleSound,
      toggleVibration,
      updateNotificationTimes, // Expose function to update notification times
      clearAllHistory,
      backupSettingsData,
      loadSettingsFromCSV,
   };
}
