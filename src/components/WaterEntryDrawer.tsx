import * as React from 'react';
import { Button } from '@/components/base-ui/button';
import { ScrollArea, ScrollBar } from '@/components/base-ui/scroll-area';
import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
   DrawerFooter,
} from '@/components/base-ui/drawer';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/theme-provider';

type WaterEntryDrawerProps = {
   isOpen: boolean;
   title: string;
   value: number;
   onClose: () => void;
   onSaveCustom: () => void;
   onIncrease: () => void;
   onDecrease: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onBlur: () => void;
   onQuickAdd: (amount: number) => void; // Action when quick add button is clicked
};

export default function WaterEntryDrawer({
   isOpen,
   title,
   value,
   onClose,
   onSaveCustom,
   onIncrease,
   onDecrease,
   onChange,
   onBlur,
   onQuickAdd, // Add this new prop
}: WaterEntryDrawerProps) {
   const { theme } = useTheme();
   const [isEditing, setIsEditing] = useState(false);
   const [quickAdds, setQuickAdds] = useState<number[]>(() =>
      JSON.parse(localStorage.getItem('quickAddValues') || '[8, 16]')
   );

   // Save quick add values to localStorage
   const saveQuickAdds = (newValues: number[]) => {
      setQuickAdds(newValues);
      localStorage.setItem('quickAddValues', JSON.stringify(newValues));
   };

   const handleQuickAddClick = (amount: number) => {
      // Call the onQuickAdd prop passed from the parent with the correct value
      onQuickAdd(amount);
      onClose(); // Close drawer after selection
   };

   const handleQuickAddHold = (index: number) => {
      setIsEditing(true);
   };

   return (
      <Drawer open={isOpen} onClose={onClose}>
         <DrawerContent
            className={`${
               theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-black'
            } transition-all duration-300 ease-in-out ${
               isEditing ? 'max-h-[600px]' : 'max-h-[450px]'
            } overflow-hidden`}
         >
            <DrawerHeader>
               <DrawerTitle className="text-3xl">{title}</DrawerTitle>
            </DrawerHeader>
            <div className="p-6 pb-0">
               <div className="flex items-center justify-center space-x-4">
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-12 w-12 shrink-0 rounded-full"
                     onClick={onDecrease}
                     disabled={value <= 1}
                  >
                     <Minus />
                  </Button>
                  <div className="flex-1 text-center">
                     <input
                        type="number"
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className="text-8xl font-bold tracking-tighter bg-transparent border-none text-center w-40"
                        inputMode="numeric"
                     />
                     <div className="text-xl uppercase mt-2">Ounces</div>
                  </div>
                  <Button
                     variant="outline"
                     size="icon"
                     className="h-12 w-12 shrink-0 rounded-full"
                     onClick={onIncrease}
                  >
                     <Plus />
                  </Button>
               </div>
            </div>

            {/* Quick Add Horizontal Scroll Area */}
            <div className="flex flex-row align-center justify-center px-6 pt-2">
               <ScrollArea>
                  <div className="flex w-max space-x-4 pb-2">
                     {quickAdds.map((amount, index) => (
                        <Button
                           key={index}
                           onClick={() => handleQuickAddClick(amount)} // Use correct value
                           onMouseDown={() => handleQuickAddHold(index)} // On hold, edit mode
                           className="px-4 rounded-xl text-lg shrink-0"
                           variant={'outline'}
                        >
                           {amount} oz
                        </Button>
                     ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
               </ScrollArea>

               {/* Add new quick add button */}
               <Button
                  className="px-2 py-2 rounded-full text-lg shrink-0"
                  onClick={() => {
                     const newValue = 16;
                     saveQuickAdds([...quickAdds, newValue]);
                  }}
               >
                  <Plus />
               </Button>
            </div>

            {/* Drawer Footer */}
            <DrawerFooter className="flex flex-col space-y-2 p-6">
               {!isEditing && (
                  <Button
                     onClick={onSaveCustom}
                     className="px-6 py-3 rounded-xl text-xl"
                  >
                     Add Custom Amount
                  </Button>
               )}

               {isEditing && (
                  <Button
                     onClick={() => {
                        setIsEditing(false);
                     }}
                     className="px-6 py-3 rounded-xl text-xl"
                  >
                     Save Quick Add
                  </Button>
               )}
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
