// components/WaterEntryDrawer.tsx

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "./base-ui/drawer";
import { Button } from "./base-ui/button";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "@/hooks/theme-provider";

type WaterEntryDrawerProps = {
   isOpen: boolean;
   title: string;
   value: number;
   onClose: () => void;
   onSave: () => void;
   onIncrease: () => void;
   onDecrease: () => void;
   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
   onBlur: () => void;
   isAddingNew?: boolean;
   onDelete?: () => void;
};

export default function WaterEntryDrawer({
   isOpen,
   title,
   value,
   onClose,
   onSave,
   onIncrease,
   onDecrease,
   onChange,
   onBlur,
   isAddingNew = false,  // Default to false, unless specified
   onDelete,
}: WaterEntryDrawerProps) {
   const { theme } = useTheme();

   return (
      <Drawer open={isOpen} onClose={onClose}>
         <DrawerContent className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
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
            <DrawerFooter className="flex justify-between p-6">
               <Button onClick={onSave} className="px-6 py-3 rounded-xl text-xl">
                  {isAddingNew ? "Add" : "Save"}
               </Button>
               {!isAddingNew && onDelete && (
                  <Button variant="destructive" className="px-6 py-3 rounded-xl text-xl" onClick={onDelete}>
                     Remove
                  </Button>
               )}
               <DrawerClose asChild>
                  <Button variant="outline" onClick={onClose} className="px-6 py-3 rounded-xl text-xl">
                     Cancel
                  </Button>
               </DrawerClose>
            </DrawerFooter>
         </DrawerContent>
      </Drawer>
   );
}
