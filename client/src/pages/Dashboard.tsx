import { format } from 'date-fns';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentDTRTable from '@/components/dashboard/RecentDTRTable';
import PayrollStatus from '@/components/dashboard/PayrollStatus';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FileDown, Plus } from 'lucide-react';

const Dashboard = () => {
  const { data: statsData, isLoading: isStatsLoading } = useQuery({
    queryKey: ['/api/stats'],
  });

  const { data: dtrsData, isLoading: isDtrsLoading } = useQuery({
    queryKey: ['/api/dtrs/recent'],
  });

  const { data: payrollData, isLoading: isPayrollLoading } = useQuery({
    queryKey: ['/api/payroll/status'],
  });

  const { data: activitiesData, isLoading: isActivitiesLoading } = useQuery({
    queryKey: ['/api/activities'],
  });

  const currentDate = format(new Date(), 'MMMM d, yyyy');
  
  // Calculate the current pay period (1st-15th or 16th-end of month)
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth();
  const year = today.getFullYear();
  
  let payPeriodStart, payPeriodEnd;
  if (day <= 15) {
    payPeriodStart = format(new Date(year, month, 1), 'MMMM d');
    payPeriodEnd = format(new Date(year, month, 15), 'MMMM d, yyyy');
  } else {
    payPeriodStart = format(new Date(year, month, 16), 'MMMM d');
    payPeriodEnd = format(new Date(year, month + 1, 0), 'MMMM d, yyyy');
  }
  
  const currentPayrollCycle = `${payPeriodStart}-${payPeriodEnd}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Dashboard Header */}
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{currentDate}</span>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>
                Payroll Cycle: <span className="font-medium">{currentPayrollCycle}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-2">
          <Button variant="outline" size="sm">
            <FileDown className="mr-2 h-4 w-4" />
            Export Reports
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Payroll Run
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats isLoading={isStatsLoading} stats={statsData} />

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent DTR Submissions */}
        <div className="lg:col-span-2">
          <RecentDTRTable isLoading={isDtrsLoading} dtrs={dtrsData} />
        </div>

        {/* Payroll Status */}
        <div>
          <PayrollStatus isLoading={isPayrollLoading} payrollData={payrollData} />
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity isLoading={isActivitiesLoading} activities={activitiesData} />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
