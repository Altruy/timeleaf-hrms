
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Button } from "@/components/ui/button";
import { formatHours } from "@/utils/helpers";

const Header = () => {
  const { user } = useAuth();
  const { isCheckedIn, isCheckedOut, checkIn, checkOut, getWorkingHours } = useAttendance();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const getAttendanceStatus = () => {
    if (isCheckedIn && !isCheckedOut) {
      return (
        <div className="attendance-status attendance-status-in">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Working • {formatHours(getWorkingHours())}
        </div>
      );
    } else if (isCheckedIn && isCheckedOut) {
      return (
        <div className="attendance-status attendance-status-out">
          Checked out • {formatHours(getWorkingHours())}
        </div>
      );
    } else {
      return (
        <div className="attendance-status bg-gray-100 text-gray-800">
          Not checked in
        </div>
      );
    }
  };
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            {/* Page title would go here, hardcoded for now */}
            Dashboard
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Attendance Actions */}
          <div className="flex items-center gap-3 mr-4">
            {getAttendanceStatus()}
            
            {!isCheckedIn ? (
              <Button
                onClick={checkIn}
                variant="outline"
                size="sm"
                className="attendance-btn-in"
              >
                Check In
              </Button>
            ) : !isCheckedOut ? (
              <Button
                onClick={checkOut}
                variant="outline"
                size="sm"
                className="attendance-btn-out"
              >
                Check Out
              </Button>
            ) : null}
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <BellIcon className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-hrms-primary">
                3
              </Badge>
            </Button>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.position}</p>
            </div>
            <Avatar>
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback>{user ? getInitials(user.name) : 'U'}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
