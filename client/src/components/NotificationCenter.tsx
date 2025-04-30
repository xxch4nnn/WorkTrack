import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertTriangle, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Activity } from '@shared/schema';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';

type NotificationProps = {
  className?: string;
};

const NotificationCenter: React.FC<NotificationProps> = ({ className }) => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Get activities from the API
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark all notifications as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/activities/mark-read');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      setUnreadCount(0);
    },
  });

  // Count unread notifications
  useEffect(() => {
    const unread = activities.filter(activity => !activity.isRead).length;
    setUnreadCount(unread);
  }, [activities]);

  // Get an icon based on the activity type
  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'dtr_approved':
      case 'payroll_processed':
      case 'dtr_submitted':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'dtr_rejected':
      case 'payroll_error':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  // Format the notification time
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 min-w-[1.25rem] flex items-center justify-center p-0 text-xs" 
              variant="destructive"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 text-xs" 
              onClick={() => markAllReadMutation.mutate()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="max-h-[300px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <DropdownMenuGroup>
              {activities.map((activity, index) => (
                <div key={activity.id || index}>
                  <DropdownMenuItem 
                    className={cn(
                      "flex items-start py-2 px-4 cursor-default", 
                      !activity.isRead && "bg-muted/50"
                    )}
                  >
                    <div className="mr-2 mt-0.5">{getActivityIcon(activity.action)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-1">{activity.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground">
                          {formatTime(activity.timestamp || new Date())}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  {index < activities.length - 1 && <DropdownMenuSeparator />}
                </div>
              ))}
            </DropdownMenuGroup>
          )}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem className="justify-center text-center" asChild>
          <Button variant="ghost" size="sm" className="w-full h-8" asChild>
            <a href="/activities">View all notifications</a>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationCenter;