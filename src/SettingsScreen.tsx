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
import { ContentSwitch } from "@/components/content-switch"; // Import the ContentSwitch
import { Label } from "@/components/ui/label";
import { Sun, Moon, Bell, BellOff } from "lucide-react"; // Icons for theme and notifications
import { useTheme } from "@/components/theme-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme(); // Theme management from the provider
  const { dailyIntakeGoal, measurementUnit, notificationsEnabled } = useSelector((state: RootState) => state.settings);

  return (
    <div
      className={`relative flex flex-col items-center justify-center h-screen font-sans ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <ScrollArea className="w-full max-w-lg mx-auto p-4 h-full pt-16"> {/* Added pt-16 to create space for the navbar */}
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
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              checkedContent={<Moon className="h-3 w-3" />}
              uncheckedContent={<Sun className="h-3 w-3" />}
            />
          </div>

          <Separator className="my-4" />

          {/* Unit Switch */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Unit</Label>
            <ContentSwitch
              checked={measurementUnit === "ml"}
              onCheckedChange={(checked) => dispatch(setMeasurementUnit(checked ? "ml" : "oz"))}
              checkedContent="ml"
              uncheckedContent="Oz"
            />
          </div>

          <Separator className="my-4" />

          {/* Daily Intake Goal */}
          <div className="flex items-center justify-between w-full">
            <Label className="text-lg">Daily Goal</Label>
            <div className="flex items-center">
              <Input
                type="number"
                value={dailyIntakeGoal}
                onChange={(e) => dispatch(setDailyIntakeGoal(Number(e.target.value)))}
                className="w-[100px]" // Narrower input box
              />
              <span className="ml-2">{measurementUnit === "ml" ? "ml" : "oz"}</span> {/* Display unit */}
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
              onCheckedChange={(checked) => dispatch(setNotificationsEnabled(checked))}
              checkedContent={<Bell className="h-3 w-3" />}
              uncheckedContent={<BellOff className="h-3 w-3" />}
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
      </ScrollArea>
    </div>
  );
}
