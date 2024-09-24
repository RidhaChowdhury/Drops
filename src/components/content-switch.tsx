import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface ContentSwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  checkedContent: React.ReactNode;
  uncheckedContent: React.ReactNode;
}

const ContentSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  ContentSwitchProps
>(({ className, checkedContent, uncheckedContent, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 bg-neutral-200 dark:bg-neutral-800",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-7 w-7 rounded-full bg-white shadow-lg ring-0 transition-transform transform data-[state=checked]:translate-x-8 data-[state=unchecked]:translate-x-0 flex items-center justify-center text-[12px] font-bold dark:bg-neutral-950",
        typeof checkedContent === "string" || typeof uncheckedContent === "string"
          ? "text-[10px]" // Adjusted text size for a larger switch
          : "text-base"
      )}
    >
      {props.checked ? checkedContent : uncheckedContent}
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));

ContentSwitch.displayName = "ContentSwitch";

export { ContentSwitch };
