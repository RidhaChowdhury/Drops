import * as React from 'react';
import { Button } from '@/components/base-ui/button';
import { ScrollArea, ScrollBar } from '@/components/base-ui/scroll-area';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { performSQLAction } from '@/state/databaseSlice';
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
import { Label } from './base-ui/label';

type WaterEntryDrawerProps = {
   isOpen: boolean;
   title: string;
   value: number;
   onClose: () => void;
   onSaveCustom: (drinkType: string) => void;
   onIncrease: () => void;
   onDecrease: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onBlur: () => void;
   onQuickAdd: (amount: number, drinkType: string) => void; // Action when quick add button is clicked
   notificationSender: ()=> void;
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
   notificationSender,
}: WaterEntryDrawerProps) {
   const { theme } = useTheme();
   const [mode, setMode] = useState<'open' | 'add' | 'edit' | 'new'>();
   const [editingIndex, setEditingIndex] = useState<number | null>(null); // Track which quick add is being edited
   const [quickAdds, setQuickAdds] = useState<Array<{id: number, amount: number}>>([]);
   const [drinkTypes, setDrinkTypes] = useState<Array<{name: string, hydration_factor: number}>>([]);
   const [drinkType, setDrinkType] = useState('Water');
   const [longPressTimeout, setLongPressTimeout] =
      useState<NodeJS.Timeout | null>(null);
   const { toast } = useToast();
   const dispatch = useDispatch<AppDispatch>();
   const { initialized } = useSelector((state: RootState) => state.database);

   // Load quick add values from database when component mounts
   useEffect(() => {
      if (!initialized) return;
      loadQuickAdds();
      loadDrinkTypes();
   }, [initialized]);

   const loadQuickAdds = async () => {
      try {
         const result = await dispatch(
            performSQLAction({
               action: async (db) => {
                  const result = await db.query(
                     `SELECT id, quick_add_amount FROM quick_add ORDER BY quick_add_amount ASC`
                  );
                  return result?.values?.map(row => ({
                     id: row.id,
                     amount: row.quick_add_amount
                  })) ?? [{id: -1, amount: 8}, {id: -2, amount: 16}];
               },
            })
         ).unwrap();
         setQuickAdds(result);
      } catch (error) {
         console.error("Error loading quick adds:", error);
         setQuickAdds([{id: -1, amount: 8}, {id: -2, amount: 16}]); // Fallback values
      }
   };

   const loadDrinkTypes = async () => {
      try {
         const result = await dispatch(
            performSQLAction({
               action: async (db) => {
                  const result = await db.query(
                     `SELECT name, hydration_factor FROM drink_type ORDER BY name ASC`
                  );
                  return result?.values ?? [];
               },
            })
         ).unwrap();
         setDrinkTypes(result);
      } catch (error) {
         console.error("Error loading drink types:", error);
      }
   };

   // Reset the edit mode when the drawer is closed
   useEffect(() => {
      if (!isOpen) {
         setMode('open'); // Reset edit mode when drawer closes
         setEditingIndex(null); // Reset the index of the quick add being edited
         setDrinkType('Water');
      }
   }, [isOpen]);

   const handleQuickAddClick = (amount: number) => {
      if (mode === 'add' || mode === 'open') {
         onQuickAdd(amount, drinkType);
         onClose();
      }
   };

   const handleQuickAddHold = (id: number) => {
      const quickAdd = quickAdds.find(qa => qa.id === id);
      if (!quickAdd) return;
      
      const index = quickAdds.findIndex(qa => qa.id === id);
      setEditingIndex(index);
      onChange({ target: { value: quickAdd.amount.toString() } } as React.ChangeEvent<HTMLInputElement>);
      setMode('edit');
   };

   const handleMouseDown = (id: number) => {
      const timeout = setTimeout(() => handleQuickAddHold(id), 1000); // Enter edit mode after a long press
      setLongPressTimeout(timeout);
   };

   const handleMouseUp = () => {
      if (longPressTimeout) {
         clearTimeout(longPressTimeout);
         setLongPressTimeout(null);
      }
   };

   const handleTouchStart = (id: number) => {
      const timeout = setTimeout(() => handleQuickAddHold(id), 1000);
      setLongPressTimeout(timeout);
   };

   const handleTouchEnd = () => {
      if (longPressTimeout) {
         clearTimeout(longPressTimeout);
         setLongPressTimeout(null);
      }
   };

   const handleSaveQuickAdd = async () => {
      if (editingIndex !== null) {
         if (await checkForDuplicate(value)) return;
         try {
            const quickAdd = quickAdds[editingIndex];
            if (!quickAdd) return;
            
            await dispatch(
               performSQLAction({
                  action: async (db) => {
                     await db.run(
                        `UPDATE quick_add SET quick_add_amount = ? WHERE id = ?`,
                        [value, quickAdd.id]
                     );
                  },
               })
            ).unwrap();
            await loadQuickAdds(); // Reload the values from DB
            setEditingIndex(null);
            setMode('open');
         } catch (error) {
            console.error("Error updating quick add:", error);
         }
      }
   };

   const handleDeleteQuickAdd = async () => {
      if (editingIndex !== null) {
         try {
            const quickAdd = quickAdds[editingIndex];
            if (!quickAdd) return;

            await dispatch(
               performSQLAction({
                  action: async (db) => {
                     await db.run(
                        `DELETE FROM quick_add WHERE id = ?`,
                        [quickAdd.id]
                     );
                  },
               })
            ).unwrap();
            await loadQuickAdds(); // Reload the values from DB
            setEditingIndex(null);
            setMode('open');
         } catch (error) {
            console.error("Error deleting quick add:", error);
         }
      }
   };

   const handleNewQuickAdd = async () => {
      
      const isDuplicate = await checkForDuplicate(value);
      if (isDuplicate) return;
      // Proceed with adding the new quick add to the database
      try {
        await dispatch(
          performSQLAction({
            action: async (db) => {
              await db.run(
                `INSERT INTO quick_add (quick_add_amount) VALUES (?)`,
                [value]
              );
            },
          })
        ).unwrap();
    
        setQuickAdds([...quickAdds, {id: -1, amount: value}]);
        setMode('open');
      } catch (error) {
        console.error("Error adding new quick add:", error);
      }
    };

   const checkForDuplicate = async (amount: number) => {
      try {
         const queryResult = await dispatch(
            performSQLAction({
               action: async (db) => {
                  const result = await db.query(
                     `SELECT COUNT(*) as count FROM quick_add WHERE quick_add_amount = ?`,
                     [amount]
                  );
                  return result?.values?.[0]?.count ?? 0;
               },
            })
         ).unwrap();

         if (queryResult > 0) {
            toast({
               title: 'Duplicate Quick Add',
               description: `You already have a quick add for ${amount} oz`,
               duration: 5000,
            });
            return true;
         }
         return false;
      } catch (error) {
         console.error("Error checking for duplicate quick add:", error);
         return true; // Assume duplicate in case of error to prevent adding.
      }
   };

   const getHydrationFactor = (drinkName: string): number => {
      const drink = drinkTypes.find((type) => type.name === drinkName);
      return drink?.hydration_factor ?? 1.0; // Default to 1.0 if not found
   };

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
            <div className="p-4 pb-0">
               {mode != 'open' && (
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
                           className="text-8xl font-bold tracking-tighter bg-transparent outline-none text-center w-40"
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
               )}

               {/* Quick Add Horizontal Scroll Area */}
               {mode === 'open' && (
                  <>
                     <Label>Quick Adds</Label>
                     <div className="flex flex-row items-center justify-center pt-2 pr-14 relative">
                        {/* Scroll Area */}
                        <ScrollArea className="w-full">
                           <div className="flex pb-2 pr-4 space-x-4">
                              {quickAdds
                                 .sort((a, b) => a.amount - b.amount)
                                 .map((quickAdd) => (
                                 <Button
                                    key={quickAdd.id}
                                    onClick={async () => {
                                       handleQuickAddClick(quickAdd.amount)
                                       await notificationSender();
                                    }}
                                    onMouseDown={() => handleMouseDown(quickAdd.id)}
                                    onMouseUp={handleMouseUp}
                                    onMouseLeave={handleMouseUp}
                                    onTouchStart={() => handleTouchStart(quickAdd.id)}
                                    onTouchEnd={handleTouchEnd}
                                    className="px-4 py-6 rounded-xl text-2xl shrink-0"
                                    variant="outline"
                                 >
                                    {quickAdd.amount} oz
                                 </Button>
                              ))}
                           </div>
                           <ScrollBar
                              orientation="horizontal"
                              className="hidden"
                           />
                        </ScrollArea>

                        {/* Fade overlay */}
                        <div
                           className={`absolute right-12 top-0 h-full w-16 bg-gradient-to-l ${theme === 'dark' ? 'from-black' : 'from-white'}  to-transparent pointer-events-none`}
                        />

                        {/* Add new quick add button */}
                        <Button
                           className="absolute right-0 top-2 px-3 py-6 rounded-full text-2xl"
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
                  <>
                     <Label>Drink Type</Label>
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
                                       key={type.name}
                                       value={type.name}
                                       className="text-xl"
                                    >
                                       {type.name}
                                    </SelectItem>
                                 ))}
                              </SelectGroup>
                           </SelectContent>
                        </Select>
                        <p className="ml-4 text-2xl bold">
                           {(getHydrationFactor(drinkType) * 100).toFixed(0)}%
                        </p>
                     </div>
                  </>
               )}
            </div>

            {/* Drawer Footer */}
            <DrawerFooter className="flex flex-col gap-3">
               <Separator orientation="horizontal" />
                  {(mode === 'add' || mode === 'open') && (
                     <Button
                        onClick={async () => {
                           if (mode === 'open') setMode('add');
                           else {
                           onSaveCustom(drinkType);
                           await notificationSender();
                        }
                        }}
                        className={`px-6 rounded-xl text-xl w-full`}
                     >
                        {mode === 'open' ? 'Add Custom Amount' : 'Add'}
                     </Button>
                  )}

               {mode === 'edit' && (
                  <Button
                     onClick={handleSaveQuickAdd}
                     className={`px-6 rounded-xl text-xl  w-full`}
                  >
                     Save Quick Add
                  </Button>
               )}

               {mode === 'new' && (
                  <Button
                     onClick={handleNewQuickAdd}
                     className={`px-6 rounded-xl text-xl w-full`}
                  >
                     Create Quick Add
                  </Button>
               )}
               {mode === 'edit' && (
                  <>
                     <Button
                        onClick={handleDeleteQuickAdd}
                        className="px-6 rounded-xl text-xl"
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
                  className="px-6 rounded-xl text-xl"
                  variant="outline"
               >
                  Cancel
               </Button>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
