import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const DashboardHeading = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900 mb-6", className)}>
      {children}
    </h2>
  );
};

export default DashboardHeading;
