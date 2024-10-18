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
import {Plus, Minus} from "lucide-react";
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/theme-provider';

type WaterEntryDrawerProps = {
   isOpen: boolean;
   title: string;
   value: number;
   quickAdds: number[]; // Array of quick add values
   onClose: () => void;
   onSaveCustom: () => void;
   onSaveQuickAdd: () => void;
   onQuickAdd: (amount: number) => void; // Action when quick add button is clicked
   onIncrease: () => void;
   onDecrease: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onBlur: () => void;
};

export default function WaterEntryDrawer({
   isOpen,
   title,
   value,
   quickAdds = [
      16, 32, 64, 16, 32, 64, 16, 32, 64, 16, 32, 64, 16, 32, 64, 16, 32, 64,
   ],
   onClose,
   onSaveCustom,
   onSaveQuickAdd,
   onQuickAdd,
   onIncrease,
   onDecrease,
   onChange,
   onBlur,
}: WaterEntryDrawerProps) {
   const { theme } = useTheme();
   const [isEditing, setIsEditing] = useState(false);

   // Reset the edit mode when the drawer closes
   useEffect(() => {
      if (!isOpen) {
         setIsEditing(false); // Reset to not be in edit mode when closed
      }
   }, [isOpen]);

   const handleQuickAddClick = (amount: number) => {
      onQuickAdd(amount); // Add quick add amount
      onClose(); // Close drawer after selection
   };

   const handleQuickAddHold = () => {
      setIsEditing(true); // Turn on edit mode when held
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
                           onClick={() => handleQuickAddClick(amount)}
                           onMouseDown={handleQuickAddHold} // On hold, edit mode
                           className="px-4 rounded-xl text-lg shrink-0"
                           variant={'outline'}
                        >
                           {amount} oz
                        </Button>
                     ))}
                  </div>
                  <ScrollBar orientation="horizontal"/>
               </ScrollArea>
               {/* Add new quick add button, off to the right */}
               <Button
                  className="px-2 py-2 rounded-full text-lg shrink-0"
                  onClick={() => console.log('Add new quick add')}
               >
                  <Plus />
               </Button>
            </div>

            {/* Drawer Footer */}
            <DrawerFooter className="flex flex-col space-y-2 p-6">
               {/* Conditionally Render Add or Save Buttons */}
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
                     onClick={onSaveQuickAdd}
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
