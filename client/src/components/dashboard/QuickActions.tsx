import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { PlusCircle, FileText, CreditCard, BarChart, Building2 } from "lucide-react";

const QuickActions = () => {
  const { toast } = useToast();

  const quickActions = [
    {
      icon: <PlusCircle className="text-primary mr-2 h-5 w-5" />,
      label: "Add New Employee",
      href: "/employees/new",
    },
    {
      icon: <FileText className="text-primary mr-2 h-5 w-5" />,
      label: "Review Pending DTRs",
      href: "/dtr-management?status=pending",
      badge: "18",
    },
    {
      icon: <CreditCard className="text-primary mr-2 h-5 w-5" />,
      label: "Process Payroll",
      href: "/payroll/process",
    },
    {
      icon: <BarChart className="text-primary mr-2 h-5 w-5" />,
      label: "Generate Reports",
      href: "/reports",
    },
    {
      icon: <Building2 className="text-primary mr-2 h-5 w-5" />,
      label: "Manage Clients",
      href: "/companies",
    },
  ];

  return (
    <Card>
      <CardHeader className="py-5">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <button
                type="button"
                className="w-full inline-flex justify-between items-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                <div className="flex items-center">
                  {action.icon}
                  <span>{action.label}</span>
                </div>
                {action.badge ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {action.badge}
                  </span>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
