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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { theme, dailyIntakeGoal, measurementUnit } = useSelector(
    (state: RootState) => state.settings
  );

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-4">
              <Label className="w-24">Theme</Label>
              <Select
                value={theme}
                onValueChange={(value) => dispatch(setTheme(value as "light" | "dark"))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Measurement Unit */}
            <div className="flex items-center space-x-4">
              <Label className="w-24">Unit</Label>
              <Select
                value={measurementUnit}
                onValueChange={(value) => dispatch(setMeasurementUnit(value as "oz" | "ml"))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oz">Ounces</SelectItem>
                  <SelectItem value="ml">Milliliters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Daily Intake Goal */}
            <div className="flex items-center space-x-4">
              <Label className="w-24">Daily Goal</Label>
              <Input
                type="number"
                value={dailyIntakeGoal}
                onChange={(e) => dispatch(setDailyIntakeGoal(Number(e.target.value)))}
                className="w-[180px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  );
}
