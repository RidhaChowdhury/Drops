import { ReactNode } from 'react';

type FABRowProps = {
   children: ReactNode;
   isActive: boolean;
   showFABs: boolean;
};

export default function FABRow({ children, isActive, showFABs }: FABRowProps) {
   return (
      <div
         className={`fixed bottom-14 right-8 z-20 flex space-x-4 transform ${
            showFABs ? 'opacity-100 translate-y-0' : 'opacity-0 translate-x-10'
         } transition-all ${
            isActive ? 'duration-500 delay-200' : 'duration-200'
         }`}
      >
         {children}
      </div>
   );
}
