
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAttendance } from "@/contexts/AttendanceContext";
import { Clock, LogIn, LogOut } from "lucide-react";
import { formatTime } from "@/utils/helpers";

const AttendanceWidget = () => {
  const { todayAttendance, isCheckedIn, isCheckedOut, checkIn, checkOut } = useAttendance();

  const renderAttendanceAction = () => {
    if (!isCheckedIn) {
      return (
        <Button onClick={checkIn} className="w-full attendance-btn-in">
          <LogIn className="h-4 w-4 mr-2" />
          Check In
        </Button>
      );
    }
    
    if (!isCheckedOut) {
      return (
        <Button onClick={checkOut} className="w-full attendance-btn-out">
          <LogOut className="h-4 w-4 mr-2" />
          Check Out
        </Button>
      );
    }
    
    return (
      <Button disabled className="w-full bg-gray-200 text-gray-600 cursor-not-allowed">
        Attendance Completed
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Check In</p>
            <p className="text-sm font-medium">
              {formatTime(todayAttendance.checkInTime)}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Check Out</p>
            <p className="text-sm font-medium">
              {formatTime(todayAttendance.checkOutTime)}
            </p>
          </div>
        </div>
        
        {renderAttendanceAction()}
      </CardContent>
    </Card>
  );
};

export default AttendanceWidget;
