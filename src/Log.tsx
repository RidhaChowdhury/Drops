import * as React from "react";
import { useState } from "react";
import { Button } from "./components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./components/ui/drawer";
import { Minus, Plus, Trash, GlassWater } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle";
import { useTheme } from "@/components/theme-provider";

export default function Log() {
  const { theme } = useTheme();
  const dailyGoal = 150;
  const [waterIntake, setWaterIntake] = useState(0);
  const [quickAddValues, setQuickAddValues] = useState([8, 16]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentButton, setCurrentButton] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuickAddValue, setNewQuickAddValue] = useState<number>(16);

  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setCurrentButton(index);
    setIsAddingNew(false);
    setNewQuickAddValue(quickAddValues[index]);
    setIsDrawerOpen(true);
  };

  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, dailyGoal));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 16 : parseInt(e.target.value);
    setNewQuickAddValue(value);
  };

  const handleInputBlur = () => {
    setNewQuickAddValue(Math.max(1, newQuickAddValue));
  };

  const handleDeleteQuickAdd = () => {
    const newValues = quickAddValues.filter((_, index) => index !== currentButton);
    setQuickAddValues(newValues);
    setIsDrawerOpen(false);
  };

  const handleAddNewQuickAdd = () => {
    setNewQuickAddValue(16);
    setIsAddingNew(true);
    setIsDrawerOpen(true);
  };

  const handleSaveQuickAdd = () => {
    if (isAddingNew) {
      setQuickAddValues([...quickAddValues, Math.max(1, newQuickAddValue)]);
    } else if (currentButton !== null) {
      const newValues = [...quickAddValues];
      newValues[currentButton] = Math.max(1, newQuickAddValue);
      setQuickAddValues(newValues);
    }
    setIsDrawerOpen(false);
  };

  const handleCancel = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenCustomDrawer = () => {
    setNewQuickAddValue(16);
    setIsAddingNew(true);
    setIsDrawerOpen(true);
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <div className="absolute top-6 left-6 z-10">
        <h2 className="text-3xl font-semibold">Hydrate</h2>
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
              {value}oz
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

      <div className="fixed bottom-8 right-8 z-20">
        <Button 
          onClick={handleOpenCustomDrawer} 
          className="p-6 h-24 w-24 rounded-full shadow-lg text-white hover:bg-blue-500"
          size="lg"
        >
          <GlassWater />
        </Button>
      </div>

      <Drawer open={isDrawerOpen} onClose={handleCancel}>
        <DrawerContent
          className={`${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <DrawerHeader>
            <DrawerTitle className="text-3xl">
              {isAddingNew ? "Custom Amount" : "Edit Quick Add Value"}
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
    </div>
  );
}