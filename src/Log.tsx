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
import { Minus, Plus } from "lucide-react";
import { ModeToggle } from "./components/mode-toggle"; // Import the ModeToggle component
import { useTheme } from "@/components/theme-provider"; // Import the useTheme hook

export default function Log() {
  const { theme } = useTheme(); // Get the current theme (dark or light)
  const dailyGoal = 150; // Daily water intake goal in ounces
  const [waterIntake, setWaterIntake] = useState(0); // Track water intake
  const [quickAddValues, setQuickAddValues] = useState([8, 16]); // Default quick add values
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Drawer open/close state
  const [currentButton, setCurrentButton] = useState(0); // Track which button is being edited

  // Right-click (context menu) detection for desktop as a long press simulation
  const handleRightClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); // Prevent default right-click behavior
    setCurrentButton(index); // Set the button being right-clicked
    setIsDrawerOpen(true); // Open the drawer
  };

  // Function to handle adding water
  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, dailyGoal));
  };

  // Function to handle quick add value update
  function handleQuickAddChange(adjustment: number) {
    const newValues = [...quickAddValues];
    newValues[currentButton] = Math.max(1, newValues[currentButton] + adjustment); // Ensure no negative values
    setQuickAddValues(newValues);
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`} // Change background and text color based on the theme
    >
      {/* Mode toggle positioned at the top right */}
      <div className="absolute top-4 right-4 z-10">
        <ModeToggle />
      </div>

      {/* Background that fills from the bottom up */}
      <div
        className={`absolute bottom-0 left-0 w-full transition-all duration-300 ${
          theme === "dark" ? "bg-blue-900" : "bg-blue-800"
        }`} // Adjust background color based on theme
        style={{
          height: `${(waterIntake / dailyGoal) * 100}%`, // Fills the background based on water intake
        }}
      ></div>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Water Logger</h1>
        <div className="mb-6 w-1/2 text-center">
          <p className="text-xl mt-2">
            {waterIntake} oz of {dailyGoal} oz
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => handleAddWater(quickAddValues[0])}
            onContextMenu={(e) => handleRightClick(e, 0)} // Right-click for button 1
            className="px-4 py-2 rounded"
          >
            +{quickAddValues[0]}oz
          </Button>
          <Button
            onClick={() => handleAddWater(quickAddValues[1])}
            onContextMenu={(e) => handleRightClick(e, 1)} // Right-click for button 2
            className="px-4 py-2 rounded"
          >
            +{quickAddValues[1]}oz
          </Button>
        </div>
      </div>

      {/* Drawer component */}
      <Drawer open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit Quick Add Value</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => handleQuickAddChange(-1)}
                disabled={quickAddValues[currentButton] <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">Decrease</span>
              </Button>
              <div className="flex-1 text-center">
                <div className="text-7xl font-bold tracking-tighter">
                  {quickAddValues[currentButton]}
                </div>
                <div className="text-[0.70rem] uppercase">
                  Ounces
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-full"
                onClick={() => handleQuickAddChange(1)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
          </div>
          <DrawerFooter className="flex justify-between p-4">
            <Button
              onClick={() => setIsDrawerOpen(false)}
              className="px-4 py-2 rounded"
            >
              Submit
            </Button>
            <DrawerClose asChild>
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
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
