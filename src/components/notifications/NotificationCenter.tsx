
import React from 'react';
import { Bell, X, CheckCheck, Info, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  createdAt: Date;
  read: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  createdAt,
  read,
  onMarkAsRead,
  onDelete
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className={`p-3 border-b last:border-0 ${read ? 'bg-background' : 'bg-muted/20'} transition-colors`}>
      <div className="flex items-start gap-2">
        <div className="mt-1">{getIcon()}</div>
        <div className="flex-1 text-sm">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{title}</h4>
            <div className="flex gap-1">
              {!read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onMarkAsRead(id)}
                  title="Mark as read"
                >
                  <CheckCheck className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive/80"
                onClick={() => onDelete(id)}
                title="Delete notification"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-xs">{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="end">
        <div className="border-b px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium text-sm">Notifications</h3>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7 px-2" 
                onClick={markAllAsRead}
              >
                Mark all read
              </Button>
            )}
            
            {notifications.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={deleteAllNotifications}
                  >
                    Delete all notifications
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 py-8 text-center">
              <p className="text-muted-foreground text-sm">No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                id={notification.id}
                title={notification.title}
                message={notification.message}
                type={notification.type}
                createdAt={notification.createdAt}
                read={notification.read}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
