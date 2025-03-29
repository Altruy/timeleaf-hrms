
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendance } from "@/contexts/AttendanceContext";
import { formatTime, formatHours } from "@/utils/helpers";
import { AlertCircle, ArrowDownCircle, ArrowUpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Attendance = () => {
  const { 
    attendanceRecords, 
    todayAttendance, 
    isCheckedIn, 
    isCheckedOut, 
    checkIn, 
    checkOut 
  } = useAttendance();
  
  // Sort records by date in descending order
  const sortedRecords = [...attendanceRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Attendance Management</h1>
        <p className="text-muted-foreground">Track your attendance and working hours</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <ArrowDownCircle className="h-4 w-4 mr-1 text-hrms-success" />
                    Check In
                  </div>
                  <div className="text-xl font-semibold">
                    {formatTime(todayAttendance.checkInTime)}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1 flex items-center">
                    <ArrowUpCircle className="h-4 w-4 mr-1 text-hrms-danger" />
                    Check Out
                  </div>
                  <div className="text-xl font-semibold">
                    {formatTime(todayAttendance.checkOutTime)}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                {!isCheckedIn ? (
                  <Button
                    onClick={checkIn}
                    className="flex-1 attendance-btn-in"
                  >
                    Check In
                  </Button>
                ) : !isCheckedOut ? (
                  <Button
                    onClick={checkOut}
                    className="flex-1 attendance-btn-out"
                  >
                    Check Out
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-gray-200 text-gray-600 hover:bg-gray-200"
                  >
                    Completed
                  </Button>
                )}
              </div>
            </div>
            
            {!isCheckedIn && (
              <div className="mt-4 p-3 bg-amber-50 text-amber-700 text-sm rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p>You haven't checked in today. Please check in to start recording your work hours.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Working Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center">
              <Clock className="h-6 w-6 mr-2 text-hrms-primary" />
              {formatHours(todayAttendance.workingHours || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Today</p>
            
            <div className="mt-4 pt-4 border-t">
              <div className="text-xl font-bold">
                {formatHours(35.5)}
              </div>
              <p className="text-sm text-muted-foreground">This week</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">92%</div>
            <p className="text-sm text-muted-foreground">This month</p>
            
            <div className="mt-6 grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-lg font-medium">23</div>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
              <div>
                <div className="text-lg font-medium">2</div>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-4">Attendance History</h2>
        <Card>
          <CardContent className="p-0">
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check In</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Check Out</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Working Hours</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {sortedRecords.map((record) => (
                      <tr 
                        key={record.id}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">{record.date}</td>
                        <td className="p-4 align-middle">{formatTime(record.checkInTime)}</td>
                        <td className="p-4 align-middle">{formatTime(record.checkOutTime)}</td>
                        <td className="p-4 align-middle">{formatHours(record.workingHours)}</td>
                        <td className="p-4 align-middle">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              record.status === 'present' ? 'bg-green-100 text-green-800' :
                              record.status === 'absent' ? 'bg-red-100 text-red-800' :
                              record.status === 'late' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Attendance;
