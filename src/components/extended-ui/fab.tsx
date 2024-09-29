import { Button } from '@/components/base-ui/button';
import { LucideIcon } from 'lucide-react';

type FABProps = {
   onClick: () => void;
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
   icon: Icon,
   variant = 'secondary',
   bgClass = 'bg-gray-700',
}: FABProps) {
   return (
      <Button
         onClick={onClick}
         variant={variant}
         className={`p-4 h-16 w-16 rounded-full shadow-lg text-white ${bgClass}`}
         size="lg"
      >
         <Icon />
      </Button>
   );
}
