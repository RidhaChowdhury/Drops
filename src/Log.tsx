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
import { Minus, Plus, GlassWater, RotateCcw, Droplet } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import Wave from "react-wavify"; // Import the Wave component

// Define the types for water history entries
type WaterEntry = {
  date: string;
  intake: number;
  drinkLog: number[];
};

// Utility functions
const getCurrentDate = (): string => new Date().toISOString().split("T")[0];
const getWaterHistory = (): WaterEntry[] => JSON.parse(localStorage.getItem("waterHistory") || "[]");
const saveWaterHistory = (history: WaterEntry[]): void =>
  localStorage.setItem("waterHistory", JSON.stringify(history));

export default function Log({ isActive }: { isActive: boolean }) {
  const { theme } = useTheme();
  const dailyGoal = 150;
  const currentDate = getCurrentDate();
  const waterHistory: WaterEntry[] = getWaterHistory();

  const todayEntry: WaterEntry | undefined = waterHistory.find((entry: WaterEntry) => entry.date === currentDate);
  const [waterIntake, setWaterIntake] = useState<number>(todayEntry ? todayEntry.intake : 0);
  const [drinkLog, setDrinkLog] = useState<number[]>(todayEntry && todayEntry.drinkLog ? todayEntry.drinkLog : []);

  const [quickAddValues, setQuickAddValues] = useState<number[]>(() =>
    JSON.parse(localStorage.getItem("quickAddValues") || "[8, 16]")
  );
  const [isQuickAddDrawerOpen, setIsQuickAddDrawerOpen] = useState(false);
  const [isCustomDrawerOpen, setIsCustomDrawerOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<number | null>(null);
  const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showFABs, setShowFABs] = useState(false); // State to control FAB animation

  // Toggle FAB visibility based on the active state of the Log page
  useEffect(() => {
    if (isActive) {
      // Fade in the FABs when the Log page is active
      const timeout = setTimeout(() => setShowFABs(true), 100);
      return () => clearTimeout(timeout);
    } else {
      // Fade out the FABs when the Log page is not active
      setShowFABs(false);
    }
  }, [isActive]);

  useEffect(() => {
    const updatedHistory = waterHistory.filter((entry: WaterEntry) => entry.date !== currentDate);
    updatedHistory.push({ date: currentDate, intake: waterIntake, drinkLog });
    saveWaterHistory(updatedHistory);
  }, [waterIntake, drinkLog, currentDate]);

  // Handle quick add button right-click (context menu) to edit
  const handleRightClickQuickAdd = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); // Prevent default context menu
    setCurrentButton(index);
    setNewQuickAddValue(quickAddValues[index]);
    setIsAddingNew(false);
    setIsQuickAddDrawerOpen(true);
  };

  const handleAddNewQuickAdd = () => {
    setNewQuickAddValue(16);
    setIsAddingNew(true);
    setIsQuickAddDrawerOpen(true);
  };

  const handleSaveQuickAdd = () => {
    if (isAddingNew) {
      const updatedQuickAddValues = [...quickAddValues, Math.max(1, newQuickAddValue)];
      setQuickAddValues(updatedQuickAddValues);
    } else if (currentButton !== null) {
      const newValues = [...quickAddValues];
      newValues[currentButton] = Math.max(1, newQuickAddValue);
      setQuickAddValues(newValues);
    }
    setIsQuickAddDrawerOpen(false);
  };

  const handleDeleteQuickAdd = () => {
    const newValues = quickAddValues.filter((_, index) => index !== currentButton);
    setQuickAddValues(newValues);
    setIsQuickAddDrawerOpen(false);
  };

  // Undo water intake
  const handleUndo = () => {
    if (drinkLog.length > 0) {
      const lastDrink = drinkLog[drinkLog.length - 1];
      setWaterIntake((prev) => Math.max(0, prev - lastDrink));
      setDrinkLog((prev) => prev.slice(0, -1)); // Remove the last drink from the log
    }
  };

  // Reset all water intake when right-clicking (context menu) on the undo button
  const handleRightClickUndo = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default context menu
    setWaterIntake(0);
    setDrinkLog([]); // Clear the log
  };

  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => prev + amount);
    setDrinkLog((prev) => [...prev, amount]); // Log each drink for undo functionality
  };

  const handleOpenCustomDrawer = () => {
    setNewQuickAddValue(16);
    setIsCustomDrawerOpen(true);
  };

  const handleSaveCustomAmount = () => {
    handleAddWater(newQuickAddValue);
    setIsCustomDrawerOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 16 : parseInt(e.target.value);
    setNewQuickAddValue(value);
  };

  const handleInputBlur = () => {
    setNewQuickAddValue(Math.max(1, newQuickAddValue));
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="absolute top-6 left-6 z-10">
        <Droplet className='h-6 w-6'/>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      {/* Water Progress Wave */}
      <div className="absolute bottom-0 left-0 w-full h-full overflow-hidden">
        <div className="relative w-full" style={{ height: "105%" }}>
          <Wave
            fill={theme === "dark" ? "#1E3A8A" : "#3B82F6"}
            paused={false}
            options={{
              height: 10,
              amplitude: 15,
              speed: 0.15,
              points: 4,
            }}
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              height: `${(waterIntake / dailyGoal) * 100 + 5}%`,
              transition: "height 0.5s ease",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-10 text-center">
          <p className="text-8xl font-bold mt-4">{waterIntake} oz</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {[...quickAddValues]
            .sort((a, b) => a - b)
            .map((value, index) => (
              <Button
                key={index}
                onClick={() => handleAddWater(value)}
                onContextMenu={(e) => handleRightClickQuickAdd(e, index)} // Right-click to edit
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

      {/* Floating Action Buttons (FABs) */}
      <div
        className={`fixed bottom-8 right-8 z-20 flex space-x-4 transform ${
          showFABs ? "opacity-100 translate-y-0" : "opacity-0 translate-x-10"
        } transition-all ${
          isActive ? "duration-500 delay-200" : "duration-200"
        }`}
      >

        <Button
          onClick={handleUndo}
          onContextMenu={handleRightClickUndo} // Right-click to reset intake
          variant="secondary"
          className="p-4 h-16 w-16 rounded-full shadow-lg text-white bg-gray-700"
          size="lg"
        >
          <RotateCcw />
        </Button>

        <Button
          onClick={handleOpenCustomDrawer}
          className="p-4 h-16 w-16 rounded-full shadow-lg text-white"
          size="lg"
        >
          <GlassWater />
        </Button>
      </div>

      {/* Quick Add Drawer */}
      <Drawer open={isQuickAddDrawerOpen} onClose={() => setIsQuickAddDrawerOpen(false)}>
        <DrawerContent className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
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
              <Button
                variant="outline"
                onClick={() => setIsQuickAddDrawerOpen(false)}
                className="px-6 py-3 rounded-xl text-xl"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Custom Amount Drawer */}
      <Drawer open={isCustomDrawerOpen} onClose={() => setIsCustomDrawerOpen(false)}>
        <DrawerContent className={`${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
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
              <Button
                variant="outline"
                onClick={() => setIsCustomDrawerOpen(false)}
                className="px-6 py-3 rounded-xl text-xl"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
