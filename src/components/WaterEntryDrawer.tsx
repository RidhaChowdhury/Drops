import {
   Drawer,
   DrawerContent,
   DrawerHeader,
   DrawerTitle,
   DrawerFooter,
} from '@/components/base-ui/drawer';
import { Button } from '@/components/base-ui/button';
import { Minus, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/hooks/theme-provider';

type WaterEntryDrawerProps = {
   isOpen: boolean;
   title: string;
   value: number;
   onClose: () => void;
   onSaveCustom: () => void;
   onSaveQuickAdd: () => void;
   onIncrease: () => void;
   onDecrease: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onBlur: () => void;
};

export default function WaterEntryDrawer({
   isOpen,
   title,
   value,
   onClose,
   onSaveCustom,
   onSaveQuickAdd,
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

   const handleEdit = () => setIsEditing(true);

   return (
      <Drawer open={isOpen} onClose={onClose}>
         <DrawerContent
            className={`${
               theme === 'dark'
                  ? 'bg-gray-800 text-white'
                  : 'bg-white text-black'
            } transition-all duration-300 ease-in-out ${
               isEditing ? 'max-h-[600px]' : 'max-h-[400px]'
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
                     <Minus size={24} />
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
                     <Plus size={24} />
                  </Button>
               </div>
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

               {/* Edit Quick Add Button with more bottom spacing */}
               <Button
                  onClick={handleEdit}
                  variant="default"
                  className="px-6 py-3 rounded-xl text-xl mb-8" // Increased bottom margin
               >
                  Edit Quick Add
               </Button>

               {/* Remove button in edit mode */}
               {/* {( */}
                  <Button
                     variant="destructive"
                     onClick={() => console.log('Remove Quick Add')}
                     className="px-6 py-3 rounded-xl text-xl"
                  >
                     Remove Quick Add
                  </Button>
               {/* )} */}
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
