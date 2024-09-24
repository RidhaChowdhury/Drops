import { ThemeProvider } from "@/components/theme-provider";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassWater, BarChart, Settings } from "lucide-react"; // Icons for each tab
import { useSwipeable } from "react-swipeable";
import Log from "./Log"; // Water screen

// Metrics Component
const Metrics = () => (
  <div className="flex justify-center items-center h-full w-full min-h-screen">
    <p className="text-2xl">Metrics Screen Placeholder</p>
  </div>
);

// Settings Component
const SettingsScreen = () => (
  <div className="flex justify-center items-center h-full w-full min-h-screen">
    <p className="text-2xl">Settings Screen Placeholder</p>
  </div>
);

const tabs = [
  { label: "Water", icon: <GlassWater />, value: "water" },
  { label: "Metrics", icon: <BarChart />, value: "metrics" },
  { label: "Settings", icon: <Settings />, value: "settings" },
];

export default function App() {
  const [selectedTab, setSelectedTab] = useState("water");

  const getTabIndex = () => tabs.findIndex((tab) => tab.value === selectedTab);

  // Handle swipe navigation
  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipeLeft(),
    onSwipedRight: () => handleSwipeRight(),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const handleSwipeLeft = () => {
    const currentIndex = getTabIndex();
    const nextIndex = (currentIndex + 1) % tabs.length;
    setSelectedTab(tabs[nextIndex].value);
  };

  const handleSwipeRight = () => {
    const currentIndex = getTabIndex();
    const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    setSelectedTab(tabs[prevIndex].value);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative min-h-screen w-full flex flex-col items-center justify-center" {...handlers}>
        {/* Sliding Content */}
        <div className="relative w-full min-h-screen overflow-hidden">
          <div
            className="absolute inset-0 w-full transition-transform duration-500"
            style={{
              transform: `translateX(-${getTabIndex() * 100}%)`,
            }}
          >
            {/* Individual screens */}
            <div className="w-full min-h-screen absolute top-0 left-0">
              <Log isActive={selectedTab === "water"} />
            </div>
            <div className="w-full min-h-screen absolute top-0 left-full">
              <Metrics />
            </div>
            <div className="w-full min-h-screen absolute top-0 left-[200%]">
              <SettingsScreen />
            </div>
          </div>
        </div>

        {/* Centered Tab Bar */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2">
            <TabsList className="flex justify-center space-x-4 bg-gray-800 text-white p-3 rounded-full shadow-lg">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center justify-center p-4 rounded-full"
                >
                  {tab.icon}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}
