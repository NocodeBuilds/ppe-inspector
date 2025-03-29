
import React, { useState, useMemo } from 'react';
import { Bell, X, CheckCheck, BellPlus, BellRing, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useNotifications, NotificationType } from '@/hooks/useNotifications';
import NotificationItem from './NotificationItem';
import NotificationMenu from './NotificationMenu';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useNetwork } from '@/hooks/useNetwork';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const NotificationCenter: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    isLoading,
    syncStatus,
    hasPendingActions,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    deleteAllNotifications 
  } = useNotifications();
  
  const { isOnline } = useNetwork();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [sortDirection, setSortDirection] = useState<'newest' | 'oldest'>('newest');
  
  // Handle clearing read notifications
  const handleClearRead = () => {
    if (confirm('Are you sure you want to clear all read notifications?')) {
      // This is a client-side only operation since we don't have a bulk delete endpoint
      notifications
        .filter(n => n.read)
        .forEach(n => deleteNotification(n.id));
    }
  };
  
  // Filter and sort notifications
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(notification => {
        // Apply type filter
        if (filterType !== 'all' && notification.type !== filterType) {
          return false;
        }
        
        // Apply read/unread filter
        if (showUnreadOnly && notification.read) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // Apply sort
        if (sortDirection === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
      });
  }, [notifications, filterType, showUnreadOnly, sortDirection]);
  
  // Count unread by type
  const unreadByType = useMemo(() => {
    return notifications.reduce((acc, notification) => {
      if (!notification.read) {
        acc[notification.type] = (acc[notification.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [notifications]);
  
  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            {hasPendingActions ? (
              <BellPlus className="h-5 w-5 animate-pulse text-amber-500" />
            ) : unreadCount > 0 ? (
              <BellRing className="h-5 w-5" /> 
            ) : (
              <Bell className="h-5 w-5" />
            )}
            
            {unreadCount > 0 && (
              <Badge 
                className="absolute top-0.5 right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[350px] p-0" 
          align="end"
          onInteractOutside={(e) => {
            if (isMenuOpen) {
              e.preventDefault();
            }
          }}
        >
          <div className="border-b px-4 py-3 flex justify-between items-center sticky top-0 bg-background z-10">
            <h3 className="font-medium text-sm flex items-center">
              Notifications
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="ml-2 h-5 text-[10px]"
                >
                  {unreadCount} unread
                </Badge>
              )}
            </h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7 px-2" 
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Mark all read
                </Button>
              )}
              
              {/* Menu dropdown with filter options */}
              <NotificationMenu 
                onClearAll={() => {
                  if (confirm('Are you sure you want to clear all notifications?')) {
                    deleteAllNotifications();
                  }
                }}
                onClearRead={handleClearRead}
                onMarkAllAsRead={markAllAsRead}
                filterType={filterType}
                setFilterType={setFilterType}
                sortDirection={sortDirection}
                setSortDirection={setSortDirection}
                showUnreadOnly={showUnreadOnly}
                setShowUnreadOnly={setShowUnreadOnly}
                hasNotifications={notifications.length > 0}
                hasUnread={unreadCount > 0}
                />
            </div>
          </div>
          
          {/* Offline alert */}
          {!isOnline && (
            <Alert className="m-2 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <AlertTitle className="flex items-center text-amber-800 dark:text-amber-300">
                <BellOff className="h-4 w-4 mr-2" /> Offline Mode
              </AlertTitle>
              <AlertDescription className="text-amber-700 dark:text-amber-400 text-xs">
                Changes will be synced when you're back online.
              </AlertDescription>
            </Alert>
          )}
          
          <ScrollArea className="h-[350px]">
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
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 py-8 text-center">
                <BellOff className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">No notifications{showUnreadOnly ? ' (unread)' : ''}</p>
                {filterType !== 'all' && (
                  <p className="text-muted-foreground text-xs mt-1">
                    Filter: {filterType} notifications
                  </p>
                )}
                {notifications.length > 0 && filteredNotifications.length === 0 && (
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="mt-2 text-xs h-7 px-2" 
                    onClick={() => {
                      setFilterType('all');
                      setShowUnreadOnly(false);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
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
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Footer with stats */}
          {notifications.length > 0 && (
            <div className="p-2 text-xs text-muted-foreground border-t text-center flex justify-center space-x-2">
              {unreadByType.error > 0 && (
                <Badge variant="destructive" className="h-5 text-[10px]">
                  {unreadByType.error} error{unreadByType.error !== 1 ? 's' : ''}
                </Badge>
              )}
              {unreadByType.warning > 0 && (
                <Badge variant="outline" className="h-5 text-[10px] bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-800">
                  {unreadByType.warning} warning{unreadByType.warning !== 1 ? 's' : ''}
                </Badge>
              )}
              {unreadByType.success > 0 && (
                <Badge variant="outline" className="h-5 text-[10px] bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800">
                  {unreadByType.success} success
                </Badge>
              )}
              {unreadByType.info > 0 && (
                <Badge variant="outline" className="h-5 text-[10px] bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800">
                  {unreadByType.info} info
                </Badge>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {/* Notification detail dialog (can be used later for showing more detail) */}
      <Dialog open={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notification Detail</DialogTitle>
            <DialogDescription>
              View details of this notification
            </DialogDescription>
          </DialogHeader>
          <div>
            {/* Notification detail content */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationCenter;
