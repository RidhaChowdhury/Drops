import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Input } from '@/components/base-ui/input';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/base-ui/select';

interface TimePickerProps {
   onTimeChange: (time: string) => void;
}

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange }) => {
   const [hours, setHours] = useState('');
   const [minutes, setMinutes] = useState('');
   const [period, setPeriod] = useState<'AM' | 'PM'>('AM');
   const minutesInputRef = useRef<HTMLInputElement>(null);

   const handleHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
         setHours(value);
         if (value.length === 2) {
            minutesInputRef.current?.focus();
         }
      }
   };

   const handleMinutesChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
         setMinutes(value);
      }
   };

   const handlePeriodChange = (value: 'AM' | 'PM') => {
      setPeriod(value);
   };

   useEffect(() => {
      if (hours && minutes) {
         const formattedHours =
            period === 'PM' && hours !== '12'
               ? (parseInt(hours) + 12).toString().padStart(2, '0')
               : period === 'AM' && hours === '12'
                 ? '00'
                 : hours.padStart(2, '0');
         const formattedTime = `${formattedHours}:${minutes.padStart(2, '0')}`;
         onTimeChange(formattedTime);
      }
   }, [hours, minutes, period]);

   const commonInputClasses =
      'w-16 text-center rounded-full border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white';

   return (
      <div className="flex items-center space-x-2">
         <Input
            type="text"
            value={hours}
            onChange={handleHoursChange}
            placeholder="HH"
            className={commonInputClasses}
            maxLength={2}
         />
         <span>:</span>
         <Input
            type="text"
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="MM"
            className={commonInputClasses}
            maxLength={2}
            ref={minutesInputRef}
         />
         <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[70px] rounded-full border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
               <SelectValue>{period}</SelectValue>
            </SelectTrigger>
            <SelectContent className="rounded-lg">
               <SelectItem value="AM">AM</SelectItem>
               <SelectItem value="PM">PM</SelectItem>
            </SelectContent>
         </Select>
      </div>
   );
};

export default TimePicker;