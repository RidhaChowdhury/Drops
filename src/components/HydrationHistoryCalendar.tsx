import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/base-ui/button';
import { Card, CardHeader, CardContent } from '@/components/base-ui/card';
import { ChevronLeft, ChevronRight, ChevronUp, Flame } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { performSQLAction } from '@/state/databaseSlice';
import { RootState, AppDispatch } from '@/state/store';
// import { useTheme } from '@/hooks/theme-provider';

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

// Function to get hydration data from database
const getHydrationStreaks = async (month: number, year: number, dispatch: any, dailyGoal: number) => {
   const daysInMonth = new Date(year, month + 1, 0).getDate();
   
   try {
      const result = await dispatch(
         performSQLAction({
            action: async (db) => {
               const query = `
                  SELECT 
                     strftime('%d', datetime(timestamp, 'localtime')) as day,
                     SUM(hydration_amount) as total_hydration
                  FROM water_intake
                  WHERE strftime('%Y-%m', datetime(timestamp, 'localtime')) = ?
                  GROUP BY date(datetime(timestamp, 'localtime'))
               `;
               return await db.query(query, [`${year}-${String(month + 1).padStart(2, '0')}`]);
            },
         })
      ).unwrap();

      // Create a map of day to hydration level
      const hydrationMap = new Map();
      result?.values?.forEach((row: any) => {
         const day = parseInt(row.day);
         const hydrationLevel = dailyGoal > 0 ? row.total_hydration / dailyGoal : 0;
         hydrationMap.set(day, hydrationLevel);
      });

      // Create array for all days in month
      return Array.from({ length: daysInMonth }, (_, i) => ({
         day: i + 1,
         hydrationLevel: hydrationMap.get(i + 1) || 0,
      }));
   } catch (error) {
      console.error("Error fetching hydration data:", error);
      return Array.from({ length: daysInMonth }, (_, i) => ({
         day: i + 1,
         hydrationLevel: 0,
      }));
   }
};

// Function to calculate the last 7 days based on the current date
const getLast7Days = async (dispatch: any, dailyGoal: number) => {
   const currentDate = new Date();
   const currentDay = currentDate.getDate();
   const currentMonth = currentDate.getMonth();
   const currentYear = currentDate.getFullYear();
   const last7Days: any[] = [];

   // Get streaks for current month
   const currentMonthStreaks = await getHydrationStreaks(currentMonth, currentYear, dispatch, dailyGoal);

   // If the last 7 days span across two months
   for (let i = currentDay; i > currentDay - 7; i--) {
      if (i > 0) {
         last7Days.unshift(currentMonthStreaks[i - 1]);
      } else {
         // Handle the previous month
         const prevMonth = currentMonth - 1 < 0 ? 11 : currentMonth - 1;
         const prevYear = currentMonth - 1 < 0 ? currentYear - 1 : currentYear;
         const streaksPrevMonth = await getHydrationStreaks(prevMonth, prevYear, dispatch, dailyGoal);
         const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
         last7Days.unshift(streaksPrevMonth[daysInPrevMonth + i - 1]);
      }
   }
   return last7Days;
};

const HydrationHistoryCalendar = ({ isActive }: { isActive: boolean }) => {
   const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
   const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
   const [streaks, setStreaks] = useState<any[]>([]);
   const [last7Days, setLast7Days] = useState<any[]>([]);
   const dispatch = useDispatch<AppDispatch>();
   const { initialized } = useSelector((state: RootState) => state.database);
   const dailyGoal = useSelector((state: RootState) => state.settings.dailyIntakeGoal);

   const loadData = async () => {
      if (!initialized) return;
      
      const monthStreaks = await getHydrationStreaks(selectedMonth, selectedYear, dispatch, dailyGoal);
      setStreaks(monthStreaks);

      const last7DaysData = await getLast7Days(dispatch, dailyGoal);
      setLast7Days(last7DaysData);
   };

   // Load data when component becomes active
   useEffect(() => {
      if (isActive) {
         loadData();
      }
   }, [isActive, initialized, selectedMonth, selectedYear, dailyGoal]);

   const [isExpanded, setIsExpanded] = useState(false); // State to track the view
   const containerRef = useRef<HTMLDivElement>(null);
   const [containerHeight, setContainerHeight] = useState('0px');

   const handleNextMonth = () => {
      setSelectedMonth((prev) => (prev === 11 ? 0 : prev + 1));
      setSelectedYear((prev) => (prev === new Date().getFullYear() && selectedMonth === 11 ? prev + 1 : prev));
   };

   const handlePrevMonth = () => {
      setSelectedMonth((prev) => (prev === 0 ? 11 : prev - 1));
      setSelectedYear((prev) => (prev === new Date().getFullYear() && selectedMonth === 0 ? prev - 1 : prev));
   };

   const toggleView = () => {
      setIsExpanded((prev) => {
         // Reset to current month and year when expanding
         if (!prev) {
            setSelectedMonth(new Date().getMonth());
            setSelectedYear(new Date().getFullYear());
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
                     {new Date(selectedYear, selectedMonth).toLocaleString(
                        'default',
                        { month: 'long' }
                     )}{' '}
                     {selectedYear}
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
