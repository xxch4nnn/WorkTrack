import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, FileText, CreditCard, Building2 } from "lucide-react";

type StatItem = {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  changeValue?: string;
  changeDirection?: 'up' | 'down' | 'neutral';
  changeText?: string;
};

type DashboardStatsProps = {
  isLoading: boolean;
  stats?: {
    totalEmployees: number;
    pendingDTRs: number;
    payrollTotal: number;
    activeClients: number;
  };
};

const DashboardStats = ({ isLoading, stats }: DashboardStatsProps) => {
  const defaultStats: StatItem[] = [
    {
      id: "totalEmployees",
      label: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: <Users className="h-5 w-5 text-primary" />,
      changeDirection: "up",
      changeValue: "8%",
    },
    {
      id: "pendingDTRs",
      label: "Pending DTRs",
      value: stats?.pendingDTRs || 0,
      icon: <FileText className="h-5 w-5 text-primary" />,
      changeText: "Due soon",
      changeDirection: "neutral",
    },
    {
      id: "payrollTotal",
      label: "Payroll Total",
      value: `₱${stats?.payrollTotal?.toLocaleString() || 0}`,
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      changeDirection: "down",
      changeValue: "3%",
    },
    {
      id: "activeClients",
      label: "Active Clients",
      value: stats?.activeClients || 0,
      icon: <Building2 className="h-5 w-5 text-primary" />,
      changeText: "2 new",
      changeDirection: "up",
    },
  ];

  const getChangeIndicator = (direction?: 'up' | 'down' | 'neutral', text?: string) => {
    if (direction === 'up') {
      return (
        <div className="ml-2 flex items-baseline text-sm font-medium text-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
          <span className="sr-only">Increased by</span>
          {text}
        </div>
      );
    } else if (direction === 'down') {
      return (
        <div className="ml-2 flex items-baseline text-sm font-medium text-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
          <span className="sr-only">Decreased by</span>
          {text}
        </div>
      );
    } else if (text) {
      return (
        <div className="ml-2 flex items-baseline text-sm font-medium text-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>{text}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      {isLoading
        ? Array(4)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="ml-5 w-full">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
        : defaultStats.map((stat) => (
            <Card key={stat.id}>
              <CardContent className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-light rounded-md p-3">
                    {stat.icon}
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                        {getChangeIndicator(
                          stat.changeDirection, 
                          stat.changeDirection === 'neutral' 
                            ? stat.changeText 
                            : stat.changeValue
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
    </div>
  );
};

export default DashboardStats;
