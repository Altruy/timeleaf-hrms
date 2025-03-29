
import { Project, TimeLog } from "@/types";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { mockProjects, mockTimeLogs } from "@/data/mockData";
import { format } from "date-fns";
import { toast } from "sonner";

interface TimeTrackingContextType {
  projects: Project[];
  timeLogs: TimeLog[];
  activeTimeLog: TimeLog | null;
  startTimer: (projectId: string, task: string) => void;
  stopTimer: () => void;
  getTotalTimeForProject: (projectId: string) => number; // In minutes
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export function TimeTrackingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activeTimeLog, setActiveTimeLog] = useState<TimeLog | null>(null);
  
  // Load initial data
  useEffect(() => {
    if (user) {
      // Get projects that the user is part of
      const userProjects = mockProjects.filter(project => 
        project.team.includes(user.id) || project.manager === user.id
      );
      setProjects(userProjects);
      
      // Get user's time logs
      const userTimeLogs = mockTimeLogs.filter(log => log.userId === user.id);
      setTimeLogs(userTimeLogs);
      
      // Check if there's an active timer (in a real app, this would be stored in the database)
      const activeLog = localStorage.getItem('activeTimeLog');
      if (activeLog) {
        setActiveTimeLog(JSON.parse(activeLog));
      }
    }
  }, [user]);
  
  // Update active timer every minute
  useEffect(() => {
    if (!activeTimeLog) return;
    
    const intervalId = setInterval(() => {
      setActiveTimeLog(prev => {
        if (!prev) return null;
        
        const now = new Date();
        const startTime = new Date(prev.startTime);
        const diffInMs = now.getTime() - startTime.getTime();
        const durationMinutes = Math.floor(diffInMs / 1000 / 60);
        
        const updated = {
          ...prev,
          duration: durationMinutes
        };
        
        // Save to localStorage
        localStorage.setItem('activeTimeLog', JSON.stringify(updated));
        
        return updated;
      });
    }, 60000); // update every minute
    
    return () => clearInterval(intervalId);
  }, [activeTimeLog]);
  
  const startTimer = (projectId: string, task: string) => {
    if (!user) return;
    
    if (activeTimeLog) {
      toast.error("Please stop the current timer before starting a new one.");
      return;
    }
    
    const now = new Date();
    const newTimeLog: TimeLog = {
      id: `temp-${Date.now()}`,
      userId: user.id,
      projectId,
      task,
      startTime: now.toISOString(),
      duration: 0,
      date: format(now, 'yyyy-MM-dd')
    };
    
    setActiveTimeLog(newTimeLog);
    localStorage.setItem('activeTimeLog', JSON.stringify(newTimeLog));
    toast.success(`Started tracking time for ${task}`);
  };
  
  const stopTimer = () => {
    if (!activeTimeLog) {
      toast.error("No active timer to stop.");
      return;
    }
    
    const now = new Date();
    const startTime = new Date(activeTimeLog.startTime);
    const diffInMs = now.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(diffInMs / 1000 / 60);
    
    const completedTimeLog: TimeLog = {
      ...activeTimeLog,
      id: `log-${Date.now()}`,
      endTime: now.toISOString(),
      duration: durationMinutes
    };
    
    const updatedTimeLogs = [...timeLogs, completedTimeLog];
    setTimeLogs(updatedTimeLogs);
    setActiveTimeLog(null);
    localStorage.removeItem('activeTimeLog');
    
    toast.success(`Logged ${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m for ${completedTimeLog.task}`);
  };
  
  const getTotalTimeForProject = (projectId: string) => {
    const projectLogs = timeLogs.filter(log => log.projectId === projectId);
    
    // Sum up durations
    return projectLogs.reduce((total, log) => total + log.duration, 0);
  };
  
  return (
    <TimeTrackingContext.Provider
      value={{
        projects,
        timeLogs,
        activeTimeLog,
        startTimer,
        stopTimer,
        getTotalTimeForProject
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTracking() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error("useTimeTracking must be used within a TimeTrackingProvider");
  }
  return context;
}
