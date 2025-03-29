
export type UserRole = 'employee' | 'manager' | 'hr' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  avatar?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: 'present' | 'absent' | 'late' | 'halfDay';
  workingHours: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  manager: string;
  team: string[];
}

export interface TimeLog {
  id: string;
  userId: string;
  projectId: string;
  task: string;
  startTime: string;
  endTime?: string;
  duration: number; // in minutes
  date: string;
  notes?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  read: boolean;
}

export interface DashboardStats {
  attendanceRate: number;
  projectsCount: number;
  hoursThisWeek: number;
  pendingTasks: number;
  upcomingEvents: Event[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  type: 'meeting' | 'deadline' | 'reminder';
}
