import { useState } from "react";
import { Button } from "./components/ui/button";

export default function App() {
  const dailyGoal = 3000; // Daily water intake goal in milliliters
  const [waterIntake, setWaterIntake] = useState(0);

  const handleAddWater = (amount: number) => {
    setWaterIntake((prev) => Math.min(prev + amount, dailyGoal));
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gray-900 text-white">
      {/* Background that fills from the bottom up */}
      <div
        className="absolute bottom-0 left-0 w-full bg-blue-800 transition-all duration-300"
        style={{
          height: `${(waterIntake / dailyGoal) * 100}%`, // Fills the background based on water intake
        }}
      ></div>

      {/* Content overlay */}
      <div className="relative z-10 text-gray-100 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4">Water Logger</h1>
        <div className="mb-6 w-1/2 text-center">
          <p className="text-xl mt-2">
            {waterIntake} ml of {dailyGoal} ml
          </p>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={() => handleAddWater(250)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            +250ml
          </Button>
          <Button
            onClick={() => handleAddWater(500)}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            +500ml
          </Button>
        </div>
      </div>
    </div>
  );
}
