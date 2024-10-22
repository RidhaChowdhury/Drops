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
import { Separator } from '@/components/base-ui/separator';
import { Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/theme-provider';
import { useToast } from '@/hooks/use-toast';
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
   SelectGroup,
} from '@/components/base-ui/select';

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
   const [mode, setMode] = useState<'open' | 'add' | 'edit' | 'new'>();
   const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which quick add is being edited
   const [quickAdds, setQuickAdds] = useState<number[]>(() =>
      JSON.parse(localStorage.getItem('quickAddValues') || '[8, 16]')
   );
   const [longPressTimeout, setLongPressTimeout] =
      useState<NodeJS.Timeout | null>(null);
   const { toast } = useToast();

   // Reset the edit mode when the drawer is closed
   useEffect(() => {
      if (!isOpen) {
         setMode('open'); // Reset edit mode when drawer closes
         setEditingIndex(null); // Reset the index of the quick add being edited
      }
   }, [isOpen]);

   // Save quick add values to localStorage
   const saveQuickAdds = (newValues: number[]) => {
      setQuickAdds(newValues);
      localStorage.setItem('quickAddValues', JSON.stringify(newValues));
   };

   const handleQuickAddClick = (amount: number) => {
      if (mode === 'add' || mode === 'open') {
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
         if (checkForDuplicate()) return;
         const updatedQuickAdds = [...quickAdds];
         updatedQuickAdds[editingIndex] = value; // Save the new value
         saveQuickAdds(updatedQuickAdds);
         setEditingIndex(null); // Reset editing state
         setMode('open');
      }
   };

   const handleDeleteQuickAdd = () => {
      if (editingIndex !== null) {
         const updatedQuickAdds = quickAdds.filter(
            (_, idx) => idx !== editingIndex
         );
         saveQuickAdds(updatedQuickAdds);
         setEditingIndex(null); // Reset editing state
         setMode('open');
      }
   };

   const handleNewQuickAdd = () => {
      if (checkForDuplicate()) return;
      setQuickAdds([...quickAdds, value]);
      setMode('open');
   };

   const checkForDuplicate = () => {
      if (quickAdds.includes(value)) {
         toast({
            title: 'Duplicate Quick Add',
            description: 'You already have a quick add for ' + value + ' oz',
            duration: 5000,
         });
         return true;
      }
   };

   type DrinkType = {
      value: string;
      label: string;
      hydrationFactor: number;
   };

   const drinkTypes = [
      { value: 'juice', label: 'Juice', hydrationFactor: 0.80 },
      { value: 'milk', label: 'Milk', hydrationFactor: 0.9 },
      { value: 'soda', label: 'Soda', hydrationFactor: 0.5 },
      { value: 'alcohol', label: 'Alcohol', hydrationFactor: 0.3 },
      {value: 'water', label: 'Water', hydrationFactor: 1}
   ];

   const getHydrationFactor = (drinkValue: string): number | null => {
      const drink = drinkTypes.find((type) => type.value === drinkValue);
      return drink ? drink.hydrationFactor : null;
   };

   const [drinkType, setDrinkType] = useState('water'); // State for drink type selection
   const [comboBoxOpen, setComboBoxOpen] = useState(false); // State for ComboBox open

   return (
      <Drawer open={isOpen} onClose={onClose} snapPoints={[1]}>
         <DrawerContent
            className={`${
               theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-black'
            } overflow-hidden`}
         >
            <DrawerHeader>
               <DrawerTitle className="text-3xl">
                  {mode === 'open'
                     ? 'Log Water'
                     : mode === 'add'
                       ? 'Add Custom Amount'
                       : mode === 'edit'
                         ? 'Edit Quick Add'
                         : 'New Quick Add'}
               </DrawerTitle>
            </DrawerHeader>
            {mode != 'open' && (
               <div className="p-6 pb-0">
                  <div className="flex flex-row items-center">
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
            )}

            {/* Drawer Footer */}
            <DrawerFooter className="flex flex-col">
               {/* Quick Add Horizontal Scroll Area */}
               {mode === 'open' && (
                  <>
                     <div className="flex flex-row align-center justify-center pt-2 relative">
                        {/* Scroll Area */}
                        <ScrollArea>
                           <div className="flex w-max space-x-4 pb-2 relative overflow-x-auto">
                              {quickAdds.map((amount, index) => (
                                 <Button
                                    key={index}
                                    onClick={() => handleQuickAddClick(amount)}
                                    onMouseDown={() => handleMouseDown(index)}
                                    onMouseUp={handleMouseUp}
                                    className="px-4 py-6 rounded-xl text-2xl shrink-0"
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
                           className="px-3 py-6 ml-2 rounded-full text-2xl shrink-0 relative z-10"
                           onClick={() => {
                              setMode('new');
                           }}
                        >
                           <Plus />
                        </Button>
                     </div>
                  </>
               )}
               {(mode == 'add' || mode == 'open') && (
                  <div className="flex items-center">
                     <Select
                        value={drinkType}
                        onValueChange={(value) => setDrinkType(value)}
                     >
                        <SelectTrigger className="w-full justify-between px-4 py-4 rounded-xl text-xl">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectGroup>
                              {drinkTypes.map((type) => (
                                 <SelectItem
                                    key={type.value}
                                    value={type.value}
                                    className="text-xl"
                                 >
                                    {type.label}
                                 </SelectItem>
                              ))}
                           </SelectGroup>
                        </SelectContent>
                     </Select>
                     <p className="ml-4 text-2xl bold">
                        {(getHydrationFactor(drinkType) ?? 0) * 100}%
                     </p>
                  </div>
               )}
               <Separator orientation="horizontal" />
               <div className="relative h-12">
                  {(mode === 'add' || mode === 'open') && (
                     <Button
                        onClick={() => {
                           if (mode === 'open') setMode('add');
                           else onSaveCustom();
                        }}
                        className={`px-6 py-3 rounded-xl text-xl w-full`}
                     >
                        <span>Add Custom Amount</span>
                     </Button>
                  )}

                  {mode === 'edit' && (
                     <Button
                        onClick={handleSaveQuickAdd}
                        className={`px-6 py-3 rounded-xl text-xl  w-full`}
                     >
                        Save Quick Add
                     </Button>
                  )}

                  {mode === 'new' && (
                     <Button
                        onClick={handleNewQuickAdd}
                        className={`px-6 py-3 rounded-xl text-xl w-full`}
                     >
                        Create Quick Add
                     </Button>
                  )}
               </div>
               {mode === 'edit' && (
                  <>
                     <Button
                        onClick={handleDeleteQuickAdd}
                        className="px-6 py-3 rounded-xl text-xl"
                        variant="destructive"
                     >
                        Delete Quick Add
                     </Button>
                  </>
               )}
               <Button
                  onClick={() => {
                     if (mode !== 'open') setMode('open');
                     else onClose();
                  }}
                  className="px-6 py-3 rounded-xl text-xl"
                  variant="outline"
               >
                  Cancel
               </Button>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
