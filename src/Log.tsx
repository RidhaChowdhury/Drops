import { useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./components/ui/drawer";
import { Minus, Plus, GlassWater, RotateCcw } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";
import { useTheme } from "@/components/theme-provider";

export default function Log() {
  const { theme, setTheme } = useTheme(); // Assuming setTheme is available from useTheme
  const dailyGoal = 150;

  const [waterIntake, setWaterIntake] = useState<number>(() => {
    const savedIntake = localStorage.getItem('waterIntake');
    return savedIntake ? JSON.parse(savedIntake) : 0;
  });

  const [quickAddValues, setQuickAddValues] = useState<number[]>(() => {
    const savedQuickAddValues = localStorage.getItem('quickAddValues');
    return savedQuickAddValues ? JSON.parse(savedQuickAddValues) : [8, 16];
  });

  const [isQuickAddDrawerOpen, setIsQuickAddDrawerOpen] = useState(false);
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
  const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);
  const [isAddingNew, setIsAddingNew] = useState(false); // To toggle between adding and editing quick-adds
  const [currentButton, setCurrentButton] = useState<number | null>(null); // Track which quick add is being edited
  const [lastAddedAmount, setLastAddedAmount] = useState<number | null>(null); // To store the last added amount for undo

  // Save water intake to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('waterIntake', JSON.stringify(waterIntake));
  }, [waterIntake]);

  // Save quick add values to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('quickAddValues', JSON.stringify(quickAddValues));
  }, [quickAddValues]);

  // Save theme preference to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle quick add right-click for editing
  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setCurrentButton(index);
    setNewQuickAddValue(quickAddValues[index]);
    setIsAddingNew(false); // We're editing, not adding
    setIsQuickAddDrawerOpen(true); // Open quick-add drawer
  };

  // Handle adding a quick add value
  const handleAddNewQuickAdd = () => {
    setNewQuickAddValue(16);
    setIsAddingNew(true); // We're adding a new quick add
    setIsQuickAddDrawerOpen(true); // Open quick-add drawer
  };

  // Handle saving quick add value (add new or edit existing)
  const handleSaveQuickAdd = () => {
    if (isAddingNew) {
      setQuickAddValues([...quickAddValues, Math.max(1, newQuickAddValue)]);
    } else if (currentButton !== null) {
      const newValues = [...quickAddValues];
      newValues[currentButton] = Math.max(1, newQuickAddValue);
      setQuickAddValues(newValues);
    }
    setIsQuickAddDrawerOpen(false); // Close the quick-add drawer
  };

  // Handle deleting a quick add value
  const handleDeleteQuickAdd = () => {
    const newValues = quickAddValues.filter((_, index) => index !== currentButton);
    setQuickAddValues(newValues);
    setIsQuickAddDrawerOpen(false); // Close the quick-add drawer
  };

  // Add custom amount of water directly (used by the FAB)
  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => prev + amount);
    setLastAddedAmount(amount); // Store the last added amount for undo
  };

  // Undo the last added water intake
  const handleUndo = () => {
    if (lastAddedAmount !== null) {
      setWaterIntake((prev) => Math.max(0, prev - lastAddedAmount)); // Remove the last added amount, ensure intake doesn't go below 0
      setLastAddedAmount(null); // Clear the undo buffer
    }
  };

  // Handle custom input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 16 : parseInt(e.target.value);
    setNewQuickAddValue(value);
  };

  const handleInputBlur = () => {
    setNewQuickAddValue(Math.max(1, newQuickAddValue));
  };

  // Open drawer for adding a custom amount via FAB
  const handleOpenCustomDrawer = () => {
    setNewQuickAddValue(16);
    setIsCustomDrawerOpen(true); // Open the custom drawer for custom water intake
  };

  const handleCancel = () => {
    setIsQuickAddDrawerOpen(false); // Close quick-add drawer
    setIsCustomDrawerOpen(false); // Close custom drawer
  };

  const handleSaveCustomAmount = () => {
    handleAddWater(newQuickAddValue); // Add custom amount to water intake
    setIsCustomDrawerOpen(false); // Close custom drawer
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-3xl font-semibold">Hydrated{waterIntake < dailyGoal ? "?" : "!"}</h2>
      </div>

      <div className="absolute top-6 right-6 z-10">
        <ModeToggle />
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
          theme === "dark" ? "bg-blue-900" : "bg-blue-500"
        }`}
        style={{
          height: `${(waterIntake / dailyGoal) * 100}%`,
        }}
      ></div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-10 text-center">
          <p className="text-8xl font-bold mt-4">{waterIntake} oz</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {quickAddValues.map((value, index) => (
            <Button
              key={index}
              onClick={() => handleAddWater(value)}
              onContextMenu={(e) => handleRightClick(e, index)}
              className="px-6 py-4 rounded-2xl text-2xl h-16 w-20"
            >
              {value} oz
            </Button>
          ))}
          <Button 
            onClick={handleAddNewQuickAdd} 
            variant="secondary" 
            className="rounded-2xl text-2xl h-16 w-16 flex items-center justify-center"
          >
            <Plus />
          </Button>
        </div>
      </div>

      <div className="fixed bottom-8 right-8 z-20 flex space-x-4 items-center">
        {/* Undo FAB */}
        <Button 
          onClick={handleUndo} 
          variant='secondary'
          className="p-6 h-16 w-16 rounded-full shadow-lg text-white hover:bg-red-700"
          size="lg"
          disabled={lastAddedAmount === null} // Disable if no last amount to undo
        >
          <RotateCcw />
        </Button>
        {/* Custom FAB */}
        <Button 
          onClick={handleOpenCustomDrawer} 
          className="p-6 h-24 w-24 rounded-full shadow-lg text-white hover:bg-blue-500"
          size="lg"
        >
          <GlassWater />
        </Button>

      </div>

      {/* Quick Add Drawer for editing or adding quick-add values */}
      <Drawer open={isQuickAddDrawerOpen} onClose={handleCancel}>
        <DrawerContent
          className={`${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <DrawerHeader>
            <DrawerTitle className="text-3xl">
              {isAddingNew ? "New Quick Add" : "Edit Quick Add Value"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-full"
                onClick={() => setNewQuickAddValue((prev) => Math.max(1, prev - 1))}
                disabled={newQuickAddValue <= 1}
              >
                <Minus size={24} />
              </Button>

              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={newQuickAddValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="text-8xl font-bold tracking-tighter bg-transparent border-none text-center w-40"
                  inputMode="numeric"
                />
                <div className="text-xl uppercase mt-2">Ounces</div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-full"
                onClick={() => setNewQuickAddValue((prev) => prev + 1)}
              >
                <Plus size={24} />
              </Button>
            </div>
          </div>

          <DrawerFooter className="flex justify-between p-6">
            <Button onClick={handleSaveQuickAdd} className="px-6 py-3 rounded-xl text-xl">
              {isAddingNew ? "Add" : "Save"}
            </Button>
            {!isAddingNew && (
              <Button
                variant="destructive"
                className="px-6 py-3 rounded-xl text-xl"
                onClick={handleDeleteQuickAdd}
              >
                Remove
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCancel} className="px-6 py-3 rounded-xl text-xl">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Custom Amount Drawer for adding custom water intake */}
      <Drawer open={isCustomDrawerOpen} onClose={handleCancel}>
        <DrawerContent
          className={`${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <DrawerHeader>
            <DrawerTitle className="text-3xl">Add Custom Amount</DrawerTitle>
          </DrawerHeader>
          <div className="p-6 pb-0">
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-full"
                onClick={() => setNewQuickAddValue((prev) => Math.max(1, prev - 1))}
                disabled={newQuickAddValue <= 1}
              >
                <Minus size={24} />
              </Button>

              <div className="flex-1 text-center">
                <input
                  type="number"
                  value={newQuickAddValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="text-8xl font-bold tracking-tighter bg-transparent border-none text-center w-40"
                  inputMode="numeric"
                />
                <div className="text-xl uppercase mt-2">Ounces</div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-full"
                onClick={() => setNewQuickAddValue((prev) => prev + 1)}
              >
                <Plus size={24} />
              </Button>
            </div>
          </div>

          <DrawerFooter className="flex justify-between p-6">
            <Button onClick={handleSaveCustomAmount} className="px-6 py-3 rounded-xl text-xl">
              Add
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleCancel} className="px-6 py-3 rounded-xl text-xl">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
