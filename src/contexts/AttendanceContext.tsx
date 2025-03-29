
import { AttendanceRecord } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { mockAttendance, todayAttendance as initialTodayAttendance } from "@/data/mockData";
import { format } from "date-fns";
import { toast } from 'sonner';

interface AttendanceContextType {
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord;
  isCheckedIn: boolean;
  isCheckedOut: boolean;
  checkIn: () => void;
  checkOut: () => void;
  getWorkingHours: () => number;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord>(initialTodayAttendance);
  
  useEffect(() => {
    if (user) {
      // Load attendance records for the current user
      const userAttendance = mockAttendance.filter(record => record.userId === user.id);
      setAttendanceRecords(userAttendance);
      
      // Check if today's record already exists
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = userAttendance.find(record => record.date === today) || {
        ...initialTodayAttendance,
        userId: user.id,
        date: today
      };
      
      setTodayAttendance(todayRecord);
    }
  }, [user]);
  
  const isCheckedIn = Boolean(todayAttendance?.checkInTime);
  const isCheckedOut = Boolean(todayAttendance?.checkOutTime);
  
  const checkIn = () => {
    if (!user) return;
    if (isCheckedIn) {
      toast.error("You have already checked in today.");
      return;
    }
    
    const now = new Date();
    const checkInTime = format(now, 'HH:mm:ss');
    const today = format(now, 'yyyy-MM-dd');
    
    const updatedAttendance: AttendanceRecord = {
      ...todayAttendance,
      checkInTime,
      status: 'present',
      workingHours: 0
    };
    
    setTodayAttendance(updatedAttendance);
    
    // Update or create today's record in the list
    const updatedRecords = [...attendanceRecords];
    const todayIndex = updatedRecords.findIndex(record => record.date === today);
    
    if (todayIndex >= 0) {
      updatedRecords[todayIndex] = updatedAttendance;
    } else {
      updatedRecords.push(updatedAttendance);
    }
    
    setAttendanceRecords(updatedRecords);
    toast.success("Successfully checked in.");
  };
  
  const checkOut = () => {
    if (!user) return;
    if (!isCheckedIn) {
      toast.error("You need to check in before checking out.");
      return;
    }
    if (isCheckedOut) {
      toast.error("You have already checked out today.");
      return;
    }
    
    const now = new Date();
    const checkOutTime = format(now, 'HH:mm:ss');
    const today = format(now, 'yyyy-MM-dd');
    
    // Calculate working hours
    const checkInParts = todayAttendance.checkInTime!.split(':').map(Number);
    const checkOutParts = checkOutTime.split(':').map(Number);
    
    const checkInDate = new Date();
    checkInDate.setHours(checkInParts[0], checkInParts[1], checkInParts[2], 0);
    
    const checkOutDate = new Date();
    checkOutDate.setHours(checkOutParts[0], checkOutParts[1], checkOutParts[2], 0);
    
    const diffInMs = checkOutDate.getTime() - checkInDate.getTime();
    const workingHours = diffInMs / 1000 / 60 / 60;
    
    const updatedAttendance: AttendanceRecord = {
      ...todayAttendance,
      checkOutTime,
      workingHours: Number(workingHours.toFixed(2))
    };
    
    setTodayAttendance(updatedAttendance);
    
    // Update today's record in the list
    const updatedRecords = [...attendanceRecords];
    const todayIndex = updatedRecords.findIndex(record => record.date === today);
    
    if (todayIndex >= 0) {
      updatedRecords[todayIndex] = updatedAttendance;
    } else {
      updatedRecords.push(updatedAttendance);
    }
    
    setAttendanceRecords(updatedRecords);
    toast.success("Successfully checked out.");
  };
  
  const getWorkingHours = () => {
    if (!isCheckedIn) return 0;
    
    if (isCheckedOut) {
      return todayAttendance.workingHours;
    }
    
    // Calculate current working hours if checked in but not checked out
    const checkInParts = todayAttendance.checkInTime!.split(':').map(Number);
    
    const checkInDate = new Date();
    checkInDate.setHours(checkInParts[0], checkInParts[1], checkInParts[2], 0);
    
    const now = new Date();
    
    const diffInMs = now.getTime() - checkInDate.getTime();
    const workingHours = diffInMs / 1000 / 60 / 60;
    
    return Number(workingHours.toFixed(2));
  };
  
  return (
    <AttendanceContext.Provider
      value={{
        attendanceRecords,
        todayAttendance,
        isCheckedIn,
        isCheckedOut,
        checkIn,
        checkOut,
        getWorkingHours,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error("useAttendance must be used within an AttendanceProvider");
  }
  return context;
}
