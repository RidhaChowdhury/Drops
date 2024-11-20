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
   defaultValue?: string; // Optional default value in "HH:MM AM/PM" format
}

const TimePicker: React.FC<TimePickerProps> = ({
   onTimeChange,
   defaultValue,
}) => {
   const parseDefaultValue = (value: string) => {
      const [time, period] = value.split(' ');
      const [defaultHours, defaultMinutes] = time.split(':');
      return { defaultHours, defaultMinutes, period };
   };

   // Initialize state with default values if provided
   const {
      defaultHours,
      defaultMinutes,
      period: defaultPeriod,
   } = defaultValue
      ? parseDefaultValue(defaultValue)
      : { defaultHours: '', defaultMinutes: '', period: 'AM' };

   const [hours, setHours] = useState(defaultHours || '');
   const [minutes, setMinutes] = useState(defaultMinutes || '');
   const [period, setPeriod] = useState<'AM' | 'PM'>(
      defaultPeriod as 'AM' | 'PM'
   );

   const minutesInputRef = useRef<HTMLInputElement>(null);

   const handleHoursChange = (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 12)) {
         setHours(value);
         if (
            value.length === 2 ||
            (parseInt(value) < 10 && parseInt(value) !== 1)
         ) {
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

   return (
      <div className="flex items-center space-x-2">
         <Input
            type="text"
            value={hours}
            onChange={handleHoursChange}
            placeholder="HH"
            className="rounded-l-2xl w-12 text-center border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
            maxLength={2}
         />
         <span className="text-xl">:</span>
         <Input
            type="text"
            value={minutes}
            onChange={handleMinutesChange}
            placeholder="MM"
            className="w-12 rounded-lg text-center border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
            maxLength={2}
            ref={minutesInputRef}
         />
         <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[70px] rounded-r-2xl border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white">
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
