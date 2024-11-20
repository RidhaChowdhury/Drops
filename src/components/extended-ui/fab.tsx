import { Button } from '@/components/base-ui/button';
import { LucideIcon } from 'lucide-react';
import { useRef, useState } from 'react';

type FABProps = {
   onClick: () => void;
   onLongPress?: () => void;
   onMouseDown?: () => void;
   onMouseUp?: () => void;
   onMouseLeave?: () => void;
   onTouchStart?: () => void;
   onTouchEnd?: () => void;
   icon: LucideIcon;
   variant:
      | 'secondary'
      | 'default'
      | 'destructive'
      | 'outline'
      | 'ghost'
      | 'link'
      | null
      | undefined;
   bgClass?: string;
};

export default function FAB({
   onClick,
   onLongPress,
   onMouseDown,
   onMouseUp,
   onMouseLeave,
   onTouchStart,
   onTouchEnd,
   icon: Icon,
   variant = 'secondary',
   bgClass = 'bg-gray-700',
}: FABProps) {
   const timeoutRef = useRef<NodeJS.Timeout>();
   const [isLongPress, setIsLongPress] = useState(false);
   const LONG_PRESS_DURATION = 1000; // 1 second

   const handleTouchStart = () => {
      setIsLongPress(false);
      if (onLongPress) {
         timeoutRef.current = setTimeout(() => {
            setIsLongPress(true);
            onLongPress();
         }, LONG_PRESS_DURATION);
      }
      onTouchStart?.();
   };

   const handleTouchEnd = () => {
      if (timeoutRef.current) {
         clearTimeout(timeoutRef.current);
      }
      if (!isLongPress) {
         onClick();
      }
      onTouchEnd?.();
      setIsLongPress(false);
   };

   return (
      <Button
         onMouseDown={onMouseDown}
         onMouseUp={onMouseUp}
         onMouseLeave={onMouseLeave}
         onTouchStart={handleTouchStart}
         onTouchEnd={handleTouchEnd}
         variant={variant}
         className={`p-4 h-16 w-16 rounded-full shadow-lg text-white ${bgClass}`}
         size="lg"
      >
         <Icon />
      </Button>
   );
}
