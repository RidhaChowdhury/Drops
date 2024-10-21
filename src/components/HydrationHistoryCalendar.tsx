import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/base-ui/button';
import { Card, CardHeader, CardContent } from '@/components/base-ui/card';
import { ChevronLeft, ChevronRight, ChevronUp, Flame } from 'lucide-react';

// Custom Circular Progress component
const CircularProgress = ({
   value,
   max,
   size,
   day,
}: {
   value: number;
   max: number;
   size: number;
   day: number;
}) => {
   const radius = size / 2;
   const strokeWidth = 4;
   const circumference = 2 * Math.PI * radius;
   const isFull = value >= max;
   const progress = !isFull ? (value / max) * circumference : 100;

   return (
      <svg width={size} height={size} className="relative">
         <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
         />
         <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            stroke="#14b881"
            strokeWidth={strokeWidth}
            fill={isFull ? '#1f7a5c' : 'none'}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
         />
         <text
            x="50%"
            y="50%"
            dy=".3em"
            textAnchor="middle"
            fontSize="12"
            fill={'#fff'}
            className="font-semibold"
         >
            {day}
         </text>
      </svg>
   );
};

// Dummy data for past hydration streaks
const getHydrationStreaks = (month: number, year: number) => {
   const daysInMonth = new Date(year, month + 1, 0).getDate();
   return Array.from({ length: daysInMonth }, (_, i) => ({
      day: i + 1,
      hydrationLevel: parseFloat((Math.random() + 0.3).toFixed(2)), // Between 0 and 1
   }));
};

// Function to calculate the last 7 days based on the current date
const getLast7Days = (streaks: any[], currentDate: Date) => {
   const currentDay = currentDate.getDate();
   const currentMonth = currentDate.getMonth();
   const currentYear = currentDate.getFullYear();

   const daysInCurrentMonth = new Date(
      currentYear,
      currentMonth + 1,
      0
   ).getDate();
   const last7Days: any[] = [];

   // If the last 7 days span across two months
   for (let i = currentDay; i > currentDay - 7; i--) {
      if (i > 0) {
         last7Days.unshift(streaks[i - 1]);
      } else {
         // Handle the previous month
         const prevMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
         const prevYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
         const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
         const streaksPrevMonth = getHydrationStreaks(prevMonth, prevYear);
         last7Days.unshift(streaksPrevMonth[daysInPrevMonth + i]);
      }
   }
   return last7Days;
};

const HydrationHistoryCalendar = () => {
   const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
   const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
   const [isExpanded, setIsExpanded] = useState(false); // State to track the view
   const containerRef = useRef<HTMLDivElement>(null);
   const [containerHeight, setContainerHeight] = useState('0px');

   const streaks = getHydrationStreaks(currentMonth, currentYear);
   const currentDate = new Date(); // Current date
   const last7Days = getLast7Days(streaks, currentDate); // Get the last 7 days

   const handleNextMonth = () => {
      setCurrentMonth((prev) => (prev + 1) % 12);
      if (currentMonth === 11) {
         setCurrentYear((prev) => prev + 1);
      }
   };

   const handlePrevMonth = () => {
      setCurrentMonth((prev) => (prev - 1 + 12) % 12);
      if (currentMonth === 0) {
         setCurrentYear((prev) => prev - 1);
      }
   };

   const toggleView = () => {
      setIsExpanded((prev) => {
         // Reset to current month and year when expanding
         if (!prev) {
            setCurrentMonth(new Date().getMonth());
            setCurrentYear(new Date().getFullYear());
         }
         return !prev;
      });
   };

   useEffect(() => {
      if (containerRef.current) {
         setContainerHeight(isExpanded ? `18rem` : '3rem');
      }
   }, [isExpanded, streaks]);

   return (
      <Card className="max-w-md mx-auto mt-6">
         <CardHeader>
            <div className='flex flex-row justify-between'>
               <h2 className="text-lg font-semibold">Hydration History</h2>
               <div className='flex flex-row'>
                  <h2 className="text-lg font-semibold">3</h2>
                  <Flame className='text-orange-500'/>
               </div>
            </div>
         </CardHeader>
         <CardContent>
            <div
               ref={containerRef}
               className="relative overflow-hidden transition-all duration-1000"
               style={{ height: containerHeight }}
               onClick={() => !isExpanded && toggleView()} // Expands when week clicked
            >
               <div className="grid grid-cols-7 gap-4 auto-rows-auto">
                  {streaks.map((day, i) => (
                     <div
                        key={i}
                        className={`flex flex-col items-center px-2 cursor-pointer transition-opacity duration-1000 ${
                           isExpanded ? 'opacity-100' : 'opacity-0'
                        }`}
                     >
                        <CircularProgress
                           value={day.hydrationLevel}
                           max={1}
                           size={36}
                           day={day.day}
                        />
                     </div>
                  ))}
               </div>
               <div
                  className="grid grid-cols-7 gap-4 auto-rows-auto absolute top-0 left-0 w-full transition-opacity duration-1000"
                  style={{ opacity: isExpanded ? 0 : 1 }}
               >
                  {last7Days.map((day, i) => (
                     <div
                        key={i}
                        className="flex flex-col items-center px-2 cursor-pointer"
                     >
                        <CircularProgress
                           value={day.hydrationLevel}
                           max={1}
                           size={36}
                           day={day.day}
                        />
                     </div>
                  ))}
               </div>
               {/* Chevron Up for Collapsing */}
               {isExpanded && (
                  <div
                     className="absolute bottom-12 right-2 cursor-pointer"
                     onClick={toggleView}
                  >
                     <ChevronUp className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />
                  </div>
               )}
               <div className="flex justify-between items-center mt-2">
                  <Button variant="ghost" onClick={handlePrevMonth}>
                     <ChevronLeft /> Previous
                  </Button>
                  <p>
                     {new Date(currentYear, currentMonth).toLocaleString(
                        'default',
                        { month: 'long' }
                     )}{' '}
                     {currentYear}
                  </p>
                  <Button variant="ghost" onClick={handleNextMonth}>
                     Next <ChevronRight />
                  </Button>
               </div>
            </div>
         </CardContent>
      </Card>
   );
};

export default HydrationHistoryCalendar;
