import { Children, ReactNode } from "react";

const DashboardCard = ({ children }: { children: ReactNode }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {children}
    </div>
  );
};
