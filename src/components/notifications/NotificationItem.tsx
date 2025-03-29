
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/hooks/useNotificationMutations';

export interface NotificationItemProps {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date;
  read: boolean;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  id,
  title,
  message,
  type,
  createdAt,
  read,
  onMarkAsRead,
  onDelete,
  className
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

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return read ? '' : 'border-l-4 border-l-amber-500';
      case 'error':
        return read ? '' : 'border-l-4 border-l-red-500';
      case 'success':
        return read ? '' : 'border-l-4 border-l-green-500';
      default:
        return read ? '' : 'border-l-4 border-l-blue-500';
    }
  };

  return (
    <div className={cn(
      'p-3 border-b last:border-0 transition-colors',
      read ? 'bg-background' : 'bg-muted/20',
      getTypeStyles(),
      className
    )}>
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
                  className="h-5 w-5 hover:bg-muted/50"
                  onClick={() => onMarkAsRead(id)}
                  title="Mark as read"
                >
                  <CheckCheck className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
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

export default NotificationItem;
