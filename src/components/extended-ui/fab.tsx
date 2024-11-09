import { Button } from '@/components/base-ui/button';
import { LucideIcon } from 'lucide-react';

type FABProps = {
   onClick: () => void;
   onMouseDown?: () => void; // Add optional event handlers
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
   onMouseDown,
   onMouseUp,
   onMouseLeave,
   onTouchStart,
   onTouchEnd,
   icon: Icon,
   variant = 'secondary',
   bgClass = 'bg-gray-700',
}: FABProps) {
   return (
      <Button
         onClick={onClick}
         onMouseDown={onMouseDown} // Pass down the event handlers to Button
         onMouseUp={onMouseUp}
         onMouseLeave={onMouseLeave}
         onTouchStart={onTouchStart}
         onTouchEnd={onTouchEnd}
         variant={variant}
         className={`p-4 h-16 w-16 rounded-full shadow-lg text-white ${bgClass}`}
         size="lg"
      >
         <Icon />
      </Button>
   );
}
