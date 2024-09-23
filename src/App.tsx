import { ThemeProvider } from "@/components/theme-provider"
import Log from "./Log"

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Log/>
    </ThemeProvider>
  );
}
