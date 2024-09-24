import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import {
  setTheme,
  setDailyIntakeGoal,
  setMeasurementUnit,
  clearHistory,
  backupData,
  loadFromCSV,
} from "./settingsSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentSwitch } from "@/components/content-switch"; // Import the ContentSwitch
import { Label } from "@/components/ui/label";
import { Sun, Moon } from "lucide-react"; // Icons for theme switch
import { useTheme } from "@/components/theme-provider";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { dailyIntakeGoal, measurementUnit } = useSelector((state: RootState) => state.settings);

  return (
    <div
      className={`relative flex flex-col items-center justify-center min-h-screen overflow-hidden font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* General Settings Section */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-8 space-y-8">
        <div className="text-left w-full px-4 mb-4">
          <h1 className="text-4xl font-bold">General Settings</h1>
        </div>

        {/* Theme Switch */}
        <div className="flex items-center justify-between w-full px-4">
          <Label className="text-lg">Theme</Label>
          <ContentSwitch
            checked={theme === "dark"}
            onCheckedChange={(checked) => dispatch(setTheme(checked ? "dark" : "light"))}
            checkedContent={<Moon className="h-3 w-3" />}
            uncheckedContent={<Sun className="h-3 w-3" />}
          />
        </div>

        {/* Unit Switch */}
        <div className="flex items-center justify-between w-full px-4">
          <Label className="text-lg">Unit</Label>
          <ContentSwitch
            checked={measurementUnit === "ml"}
            onCheckedChange={(checked) => dispatch(setMeasurementUnit(checked ? "ml" : "oz"))}
            checkedContent="ml"
            uncheckedContent="Oz"
            
          />
        </div>

        {/* Daily Intake Goal */}
        <div className="flex items-center justify-between w-full px-4">
          <Label className="text-lg">Daily Goal</Label>
          <Input
            type="number"
            value={dailyIntakeGoal}
            onChange={(e) => dispatch(setDailyIntakeGoal(Number(e.target.value)))}
            className="w-[180px]"
          />
        </div>
      </div>

      {/* Data Management Section */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-lg mt-12 space-y-4">
        <div className="text-left w-full px-4 mb-4">
          <h2 className="text-3xl font-bold">Data Management</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full px-4">
          <Button variant="secondary" onClick={() => dispatch(backupData())}>
            Backup Data
          </Button>
          <Button variant="secondary" onClick={() => dispatch(loadFromCSV())}>
            Load from CSV
          </Button>
          <Button variant="destructive" onClick={() => dispatch(clearHistory())}>
            Clear Full History
          </Button>
        </div>
      </div>
    </div>
  );
}
