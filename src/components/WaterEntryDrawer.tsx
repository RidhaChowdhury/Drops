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
import { useToast } from '@/hooks/use-toast';

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
   const [mode, setMode] = useState<'add'| 'edit' | 'new'>();
   const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which quick add is being edited
   const [quickAdds, setQuickAdds] = useState<number[]>(() =>
      JSON.parse(localStorage.getItem('quickAddValues') || '[8, 16]')
   );
   const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);
   const { toast } = useToast();

   // Reset the edit mode when the drawer is closed
   useEffect(() => {
      if (!isOpen) {
         setMode('add'); // Reset edit mode when drawer closes
         setEditingIndex(null); // Reset the index of the quick add being edited
      }
   }, [isOpen]);

   // Save quick add values to localStorage
   const saveQuickAdds = (newValues: number[]) => {
      setQuickAdds(newValues);
      localStorage.setItem('quickAddValues', JSON.stringify(newValues));
   };

   const handleQuickAddClick = (amount: number) => {
      if (mode === 'add') {
         onQuickAdd(amount);
         onClose();
      }
   };

   const handleQuickAddHold = (index: number) => {
      setEditingIndex(index); // Set the index of the quick add being edited
      setMode('edit');
   };

   const handleMouseDown = (index: number) => {
      const timeout = setTimeout(() => handleQuickAddHold(index), 500); // Enter edit mode after a long press
      setLongPressTimeout(timeout);
   };

   const handleMouseUp = () => {
      if (longPressTimeout) {
         clearTimeout(longPressTimeout);
      }
   };

   const handleSaveQuickAdd = () => {
      if (editingIndex !== null) {
         if(checkForDuplicate())
            return;
         const updatedQuickAdds = [...quickAdds];
         updatedQuickAdds[editingIndex] = value; // Save the new value
         saveQuickAdds(updatedQuickAdds);
         setEditingIndex(null); // Reset editing state
         setMode('add');
      }
   };

   const handleDeleteQuickAdd = () => {
      if (editingIndex !== null) {
         const updatedQuickAdds = quickAdds.filter(
            (_, idx) => idx !== editingIndex
         );
         saveQuickAdds(updatedQuickAdds);
         setEditingIndex(null); // Reset editing state
         setMode('add');
      }
   };

   const handleNewQuickAdd = () => {
      if (checkForDuplicate())
         return;
      setQuickAdds([...quickAdds, value]);
      setMode('add');
   };

   const checkForDuplicate = () => {
      if (quickAdds.includes(value)) {
         toast({
            title: 'Duplicate Quick Add',
            description:
               'You already have a quick add for ' + value + ' oz',
            duration: 5000,
         });
         return true;
      }
   }

   return (
      <Drawer open={isOpen} onClose={onClose}>
         <DrawerContent
            className={`${
               theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-black'
            } transition-all duration-300 ease-in-out ${
               mode != 'add' ? 'max-h-[600px]' : 'max-h-[400px]'
            } overflow-hidden`}
         >
            <DrawerHeader>
               <DrawerTitle className='text-3xl'>{mode === 'add' ? 'Add Custom Amount' : (mode === 'edit' ? 'Edit Quick Add' : 'New Quick Add')}</DrawerTitle>
            </DrawerHeader>
            <div className='p-6 pb-0'>
               <div className='flex flex-row items-center'>
                  <Button
                     variant='outline'
                     size='icon'
                     className='h-12 w-12 shrink-0 rounded-full'
                     onClick={onDecrease}
                     disabled={value <= 1}
                  >
                     <Minus />
                  </Button>
                  <div className='flex-1 text-center'>
                     <input
                        type='number'
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        className='text-8xl font-bold tracking-tighter bg-transparent border-none text-center w-40'
                        inputMode='numeric'
                     />
                     <div className='text-xl uppercase mt-2'>Ounces</div>
                  </div>
                  <Button
                     variant='outline'
                     size='icon'
                     className='h-12 w-12 shrink-0 rounded-full'
                     onClick={onIncrease}
                  >
                     <Plus />
                  </Button>
               </div>
            </div>


            {/* Drawer Footer */}
            <DrawerFooter className='flex flex-col'>
            {/* Quick Add Horizontal Scroll Area */}
            <div className='flex flex-row align-center justify-center px-6 pt-2'>
               <ScrollArea>
                  <div className='flex w-max space-x-4 pb-2'>
                     {quickAdds.map((amount, index) => (
                        <Button
                           key={index}
                           onClick={() => handleQuickAddClick(amount)} // Only trigger click if not in editing mode
                           onMouseDown={() => handleMouseDown(index)} // Start long press
                           onMouseUp={handleMouseUp} // Cancel long press
                           className='px-4 rounded-xl text-lg shrink-0'
                           variant={'outline'}
                        >
                           {amount} oz
                        </Button>
                     ))}
                  </div>
                  <ScrollBar orientation='horizontal' />
               </ScrollArea>

               {/* Add new quick add button */}
               <Button
                  className='px-2 py-2 ml-2 rounded-full text-lg shrink-0'
                  onClick={() => {
                     setMode('new');
                  }}
               >
                  <Plus />
               </Button>
            </div>
               <div className='relative h-12'>
                  <Button
                     onClick={onSaveCustom}
                     className={`px-6 py-3 rounded-xl text-xl absolute inset-0 transition-all duration-300 ease-in-out transform ${mode === 'add' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                  >
                     <span>Add Custom Amount</span>
                  </Button>

                  <Button
                     onClick={handleSaveQuickAdd}
                     className={`px-6 py-3 rounded-xl text-xl absolute inset-0 transition-all duration-300 ease-in-out transform ${mode === 'edit' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                  >
                     Save Quick Add
                  </Button>

                  <Button
                     onClick={handleNewQuickAdd}
                     className={`px-6 py-3 rounded-xl text-xl absolute inset-0 transition-all duration-300 ease-in-out transform ${mode === 'new' ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
                  >
                     Create Quick Add
                  </Button>
               </div>
               {mode === 'edit' ? (
                  <Button
                     onClick={handleDeleteQuickAdd}
                     className='px-6 py-3 rounded-xl text-xl'
                     variant='destructive'
                  >
                     Delete Quick Add
                  </Button>
               ) : (
                  <Button
                     onClick={() => {
                        setMode('add');
                     }}
                     className='px-6 py-3 rounded-xl text-xl'
                     variant='outline'
                  >
                     Cancel
                  </Button>
               )}
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
