import React from 'react';
import { cn } from '../../../lib/utils';

interface CodeDiagramProps {
  children: React.ReactNode;
  flip?: boolean;
  className?: string;
}

export const CodeDiagram: React.FC<CodeDiagramProps> = ({ children, flip = false, className }) => {
  const childrenArray = React.Children.toArray(children);
  const left = childrenArray[0];
  const right = childrenArray[1];

  return (
    <div className={cn(
      "my-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start",
      className
    )}>
      <div className={cn("w-full", flip ? "lg:order-2" : "lg:order-1")}>
        {left}
      </div>
      <div className={cn(
        "w-full flex justify-center items-center p-6 rounded-2xl bg-[var(--react-wash)] border border-[var(--react-border)]",
        flip ? "lg:order-1" : "lg:order-2"
      )}>
        {right}
      </div>
    </div>
  );
};
