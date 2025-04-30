import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  PlusCircle, FileText, CreditCard, BarChart, Building2, 
  Settings, FileSpreadsheet, Edit, MoreHorizontal, Save, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const QuickActions = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [availableActions, setAvailableActions] = useState([
    {
      id: "add_employee",
      icon: <PlusCircle className="text-primary mr-2 h-5 w-5" />,
      label: "Add New Employee",
      href: "/employees/new",
      enabled: true
    },
    {
      id: "review_dtr",
      icon: <FileText className="text-primary mr-2 h-5 w-5" />,
      label: "Review Pending DTRs",
      href: "/dtr-management?status=pending",
      badge: "18",
      enabled: true
    },
    {
      id: "process_payroll",
      icon: <CreditCard className="text-primary mr-2 h-5 w-5" />,
      label: "Process Payroll",
      href: "/payroll/process",
      enabled: true
    },
    {
      id: "generate_reports",
      icon: <BarChart className="text-primary mr-2 h-5 w-5" />,
      label: "Generate Reports",
      href: "/reports",
      enabled: true
    },
    {
      id: "manage_clients",
      icon: <Building2 className="text-primary mr-2 h-5 w-5" />,
      label: "Manage Clients",
      href: "/companies",
      enabled: true
    },
    {
      id: "manage_dtr_formats",
      icon: <FileSpreadsheet className="text-primary mr-2 h-5 w-5" />,
      label: "Manage DTR Formats",
      href: "/settings?tab=dtrformats",
      enabled: false
    },
    {
      id: "settings",
      icon: <Settings className="text-primary mr-2 h-5 w-5" />,
      label: "System Settings",
      href: "/settings",
      enabled: false
    },
  ]);

  // Load saved preferences
  useEffect(() => {
    const savedPreferences = localStorage.getItem('quickActionPreferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setAvailableActions(prevActions => {
          return prevActions.map(action => {
            const savedAction = preferences.find(p => p.id === action.id);
            if (savedAction) {
              return { ...action, enabled: savedAction.enabled };
            }
            return action;
          });
        });
      } catch (error) {
        console.error('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  const savePreferences = () => {
    try {
      const preferences = availableActions.map(action => ({
        id: action.id,
        enabled: action.enabled
      }));
      localStorage.setItem('quickActionPreferences', JSON.stringify(preferences));
      toast({
        title: "Preferences Saved",
        description: "Your quick actions have been updated."
      });
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Filter to only show enabled actions
  const quickActions = availableActions.filter(action => action.enabled);

  const toggleActionEnabled = (actionId) => {
    setAvailableActions(prevActions => prevActions.map(action => 
      action.id === actionId ? { ...action, enabled: !action.enabled } : action
    ));
  };

  return (
    <Card>
      <CardHeader className="py-5 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCustomizeDialog(true)}
        >
          <Edit className="h-4 w-4 mr-1" />
          Customize
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="space-y-3">
          {quickActions.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No quick actions selected.</p>
              <Button 
                variant="link" 
                className="mt-2" 
                onClick={() => setShowCustomizeDialog(true)}
              >
                Customize quick actions
              </Button>
            </div>
          ) : (
            quickActions.map((action, index) => (
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
            ))
          )}
        </div>
      </CardContent>

      {/* Customize Dialog */}
      <Dialog open={showCustomizeDialog} onOpenChange={setShowCustomizeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Quick Actions</DialogTitle>
            <DialogDescription>
              Select which actions you want to show in your quick actions panel.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto py-4">
            <div className="space-y-4">
              {availableActions.map((action) => (
                <div key={action.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {action.icon}
                    <Label htmlFor={`action-${action.id}`} className="font-medium">
                      {action.label}
                    </Label>
                  </div>
                  <Switch
                    id={`action-${action.id}`}
                    checked={action.enabled}
                    onCheckedChange={() => toggleActionEnabled(action.id)}
                  />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCustomizeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              savePreferences();
              setShowCustomizeDialog(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default QuickActions;
