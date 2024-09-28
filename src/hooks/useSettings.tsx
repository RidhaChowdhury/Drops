import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import {
   setDailyIntakeGoal,
   setMeasurementUnit,
   setNotificationsEnabled,
   setSoundEnabled, // New action for sound
   setVibrationEnabled, // New action for vibration
   clearHistory,
   backupData,
   loadFromCSV,
} from '@/settingsSlice';

export function useSettings() {
   const dispatch = useDispatch();

   // Selector logic
   const settings = useSelector((state: RootState) => state.settings);

   // Action creators wrapped in dispatch
   const updateDailyIntakeGoal = (goal: number) =>
      dispatch(setDailyIntakeGoal(goal));
   const updateMeasurementUnit = (unit: 'oz' | 'mL' | 'L' | 'cups') =>
      dispatch(setMeasurementUnit(unit));
   const toggleNotifications = (enabled: boolean) =>
      dispatch(setNotificationsEnabled(enabled));
   const toggleSound = (enabled: boolean) => dispatch(setSoundEnabled(enabled)); // New toggle for sound
   const toggleVibration = (enabled: boolean) =>
      dispatch(setVibrationEnabled(enabled)); // New toggle for vibration
   const clearAllHistory = () => dispatch(clearHistory());
   const backupSettingsData = () => dispatch(backupData());
   const loadSettingsFromCSV = () => dispatch(loadFromCSV());

   return {
      settings,
      updateDailyIntakeGoal,
      updateMeasurementUnit,
      toggleNotifications,
      toggleSound, // Exported sound toggle
      toggleVibration, // Exported vibration toggle
      clearAllHistory,
      backupSettingsData,
      loadSettingsFromCSV,
   };
}
