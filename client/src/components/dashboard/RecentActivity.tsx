import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, CreditCard, XCircle, UserPlus } from "lucide-react";
import { Activity } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type RecentActivityProps = {
  isLoading: boolean;
  activities?: Activity[];
};

const getActivityIcon = (action: string) => {
  switch (action) {
    case "dtr_submitted":
      return (
        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-blue-100">
          <CheckCircle className="h-4 w-4 text-primary" />
        </span>
      );
    case "payroll_processed":
      return (
        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-green-100">
          <CreditCard className="h-4 w-4 text-success" />
        </span>
      );
    case "dtr_rejected":
      return (
        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-red-100">
          <XCircle className="h-4 w-4 text-error" />
        </span>
      );
    case "employee_added":
      return (
        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-yellow-100">
          <UserPlus className="h-4 w-4 text-warning" />
        </span>
      );
    default:
      return (
        <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
          <CheckCircle className="h-4 w-4 text-gray-500" />
        </span>
      );
  }
};

const RecentActivity = ({ isLoading, activities = [] }: RecentActivityProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-5">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <li key={i}>
                    <div className="relative pb-8">
                      {i < 3 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <Skeleton className="h-4 w-60 mb-1" />
                          </div>
                          <div className="text-right">
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
            ) : activities.length > 0 ? (
              activities.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx < activities.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>{getActivityIcon(activity.action)}</div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-800">
                            {activity.description}
                          </p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          <time dateTime={activity.timestamp}>
                            {formatDistanceToNow(new Date(activity.timestamp), {
                              addSuffix: true,
                            })}
                          </time>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="text-center text-gray-500 py-4">
                No recent activities found.
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
