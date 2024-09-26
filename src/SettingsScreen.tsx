import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import {
  setDailyIntakeGoal,
  setMeasurementUnit,
  setNotificationsEnabled,
  clearHistory,
  backupData,
  loadFromCSV,
} from "./settingsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { Label } from "@/components/ui/label";
import { Sun, Moon, Bell, BellOff, FileDown, FileUp, Bomb } from "lucide-react"; // Icons for theme and notifications
import { useTheme } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ContentSwitch } from "@/components/content-switch"; // Assuming you're using ContentSwitch now

// Conversion utility functions
const convertFromOunces = (oz: number, unit: "oz" | "mL" | "L" | "cups"): number => {
  const conversionRates = {
    oz: 1,
    mL: 29.5735,
    L: 0.0295735,
    cups: 0.125,
  };
  return oz * conversionRates[unit];
};

const convertToOunces = (amount: number, unit: "oz" | "mL" | "L" | "cups"): number => {
  const conversionRates = {
    oz: 1,
    mL: 1 / 29.5735,
    L: 1 / 0.0295735,
    cups: 1 / 0.125,
  };
  return amount * conversionRates[unit];
};

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme(); // Theme management from the provider
  const { dailyIntakeGoal, measurementUnit, notificationsEnabled } = useSelector((state: RootState) => state.settings);

  const units: Array<"oz" | "mL" | "L" | "cups"> = ["oz", "mL", "L", "cups"]; // Strongly typed unit options

  // Convert the daily intake goal from ounces to the selected unit for display
  const displayedDailyGoal = convertFromOunces(dailyIntakeGoal, measurementUnit);

  // Handle input change, converting back to ounces for storage
  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGoalInUnit = parseFloat(e.target.value);
    const newGoalInOunces = convertToOunces(newGoalInUnit, measurementUnit); // Convert to ounces
    dispatch(setDailyIntakeGoal(newGoalInOunces));
  };

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <ScrollArea className="w-full max-w-lg mx-auto p-4 h-full pt-16">
        {/* General Settings Section */}
        <div className="relative z-10 flex flex-col items-center w-full space-y-8">
          <div className="text-left w-full mb-4">
            <h1 className="text-4xl font-bold">General Settings</h1>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Theme</Label>
            <ContentSwitch
              checked={theme === "dark"}
              onCheckedChange={(checked: boolean) => setTheme(checked ? "dark" : "light")}
              checkedContent={<Moon className="h-3 w-3" />}
              uncheckedContent={<Sun className="h-3 w-3" />}
              className="bg-neutral-200 dark:bg-neutral-800" // Ensure bg matches the switch background
            />
          </div>

          {/* Unit Select */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Unit</Label>
            <Select
              value={measurementUnit}
              onValueChange={(value: "oz" | "mL" | "L" | "cups") => dispatch(setMeasurementUnit(value))}
            >
              <SelectTrigger
                className="w-24 rounded-full border-2 border-transparent transition-colors bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
              >
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Daily Intake Goal */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Daily Goal</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={displayedDailyGoal.toFixed(1)} // Display rounded daily goal
                onChange={handleGoalChange} // Convert to ounces before dispatching
                className="w-28 rounded-full border-2 border-transparent bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white"
              />
              <span className="ml-2">{measurementUnit}</span> {/* Display unit dynamically */}
            </div>
          </div>

          <Separator className="my-4" />
        </div>

        {/* Notification Settings Section */}
        <div className="relative z-10 flex flex-col items-center w-full space-y-8">
          <div className="text-left w-full mb-4">
            <h2 className="text-3xl font-bold">Notification Settings</h2>
          </div>

          {/* Notification Switch */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Enable Notifications</Label>
            <ContentSwitch
              checked={notificationsEnabled}
              onCheckedChange={(checked: boolean) => dispatch(setNotificationsEnabled(checked))}
              checkedContent={<Bell className="h-3 w-3" />}
              uncheckedContent={<BellOff className="h-3 w-3" />}
              className="bg-neutral-200 dark:bg-neutral-800"
            />
          </div>

          <Separator className="my-4" />
        </div>

        {/* Data Management Section */}
        <div className="relative z-10 flex flex-col items-center w-full space-y-4">
          <div className="text-left w-full mb-4">
            <h2 className="text-3xl font-bold">Data Management</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <Button variant="secondary" className="rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white" onClick={() => dispatch(backupData())}>
              <FileDown className="mr-2 h-4 w-4" />
              {"Export Data (CSV)"}
            </Button>
            <Button variant="secondary" className="rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white" onClick={() => dispatch(loadFromCSV())}>
              <FileUp className="mr-2 h-4 w-4" />
              {"Load Data (CSV)"}
            </Button>
            <Button variant="destructive" className="rounded-full text-black dark:text-white" onClick={() => dispatch(clearHistory())}>
              <Bomb className="mr-2 h-4 w-4" />
              Clear Full History
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
