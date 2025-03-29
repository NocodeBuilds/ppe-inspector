
import React from 'react';
import { Trash2, BellOff, Check, Filter, ArrowDownAZ, ArrowUpAZ } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuGroup,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NotificationType } from '@/hooks/useNotificationMutations';

export interface NotificationMenuProps {
  onClearAll: () => void;
  onClearRead: () => void;
  onMarkAllAsRead: () => void;
  filterType: NotificationType | 'all';
  setFilterType: (type: NotificationType | 'all') => void;
  sortDirection: 'newest' | 'oldest';
  setSortDirection: (direction: 'newest' | 'oldest') => void;
  showUnreadOnly: boolean;
  setShowUnreadOnly: (show: boolean) => void;
  hasNotifications: boolean;
  hasUnread: boolean;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  onClearAll,
  onClearRead, 
  onMarkAllAsRead,
  filterType,
  setFilterType,
  sortDirection,
  setSortDirection,
  showUnreadOnly,
  setShowUnreadOnly,
  hasNotifications,
  hasUnread
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-7 w-7 hover:bg-muted"
          disabled={!hasNotifications}
        >
          <Filter className="h-4 w-4" />
          <span className="sr-only">Notification options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter & Sort</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <span>Filter by type</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuCheckboxItem 
                  checked={filterType === 'all'}
                  onCheckedChange={() => setFilterType('all')}
                >
                  All types
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filterType === 'info'}
                  onCheckedChange={() => setFilterType('info')}
                >
                  Information
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filterType === 'success'}
                  onCheckedChange={() => setFilterType('success')}
                >
                  Success
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filterType === 'warning'}
                  onCheckedChange={() => setFilterType('warning')}
                >
                  Warning
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem 
                  checked={filterType === 'error'}
                  onCheckedChange={() => setFilterType('error')}
                >
                  Error
                </DropdownMenuCheckboxItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          
          <DropdownMenuCheckboxItem
            checked={showUnreadOnly}
            onCheckedChange={setShowUnreadOnly}
          >
            Unread only
          </DropdownMenuCheckboxItem>
          
          <DropdownMenuCheckboxItem
            checked={sortDirection === 'newest'}
            onCheckedChange={(checked) => {
              if (checked) setSortDirection('newest');
              else setSortDirection('oldest');
            }}
          >
            {sortDirection === 'newest' ? (
              <ArrowDownAZ className="mr-2 h-4 w-4" />
            ) : (
              <ArrowUpAZ className="mr-2 h-4 w-4" />
            )}
            {sortDirection === 'newest' ? 'Newest first' : 'Oldest first'}
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={onMarkAllAsRead}
            disabled={!hasUnread}
            className="text-blue-500 focus:text-blue-500"
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={onClearRead}
            disabled={!hasNotifications}
            className="text-amber-500 focus:text-amber-500"
          >
            <BellOff className="mr-2 h-4 w-4" />
            Clear read notifications
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={onClearAll}
            disabled={!hasNotifications}
            className="text-red-500 focus:text-red-500"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear all notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMenu;
