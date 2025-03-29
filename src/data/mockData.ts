
import { AttendanceRecord, Notification, Project, TimeLog, User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john.doe@timeleaf.com",
    role: "employee",
    department: "Engineering",
    position: "Software Developer",
    avatar: "/lovable-uploads/4260d4a1-190f-4554-80a3-c86d5c95e013.png"
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane.smith@timeleaf.com",
    role: "manager",
    department: "Engineering",
    position: "Engineering Manager",
  },
  {
    id: "user3",
    name: "Michael Johnson",
    email: "michael.j@timeleaf.com",
    role: "hr",
    department: "Human Resources",
    position: "HR Specialist",
  },
  {
    id: "user4",
    name: "Sarah Williams",
    email: "sarah.w@timeleaf.com",
    role: "admin",
    department: "Administration",
    position: "System Administrator",
  }
];

// Current logged in user
export const currentUser = mockUsers[0];

// Attendance records for the current user
export const mockAttendance: AttendanceRecord[] = [
  {
    id: "att1",
    userId: currentUser.id,
    date: "2023-06-01",
    checkInTime: "09:00:00",
    checkOutTime: "17:30:00",
    status: "present",
    workingHours: 8.5
  },
  {
    id: "att2",
    userId: currentUser.id,
    date: "2023-06-02",
    checkInTime: "09:15:00",
    checkOutTime: "17:45:00",
    status: "present",
    workingHours: 8.5
  },
  {
    id: "att3",
    userId: currentUser.id,
    date: "2023-06-03",
    checkInTime: "10:00:00",
    checkOutTime: "17:00:00",
    status: "late",
    workingHours: 7
  },
  {
    id: "att4",
    userId: currentUser.id,
    date: "2023-06-04",
    checkInTime: "09:00:00",
    checkOutTime: "13:30:00",
    status: "halfDay",
    workingHours: 4.5
  },
  {
    id: "att5",
    userId: currentUser.id,
    date: "2023-06-05",
    checkInTime: null,
    checkOutTime: null,
    status: "absent",
    workingHours: 0
  }
];

// Today's attendance for the current user (default: not checked in)
export const todayAttendance: AttendanceRecord = {
  id: "today",
  userId: currentUser.id,
  date: new Date().toISOString().split("T")[0],
  checkInTime: null,
  checkOutTime: null,
  status: "absent",
  workingHours: 0
};

// Projects accessible to the current user
export const mockProjects: Project[] = [
  {
    id: "proj1",
    name: "Website Redesign",
    description: "Redesigning the company website with new branding guidelines",
    status: "active",
    startDate: "2023-05-15",
    manager: "user2",
    team: [currentUser.id, "user2"]
  },
  {
    id: "proj2",
    name: "Mobile App Development",
    description: "Building a new mobile application for customers",
    status: "active",
    startDate: "2023-04-10",
    manager: "user2",
    team: [currentUser.id, "user2", "user4"]
  },
  {
    id: "proj3",
    name: "Database Migration",
    description: "Migrating from legacy database to new cloud platform",
    status: "on-hold",
    startDate: "2023-03-01",
    manager: "user4",
    team: [currentUser.id, "user4"]
  },
  {
    id: "proj4",
    name: "Annual Report",
    description: "Preparing the annual company report",
    status: "completed",
    startDate: "2023-01-10",
    endDate: "2023-02-28",
    manager: "user3",
    team: [currentUser.id, "user3"]
  }
];

// Time logs for the current user
export const mockTimeLogs: TimeLog[] = [
  {
    id: "log1",
    userId: currentUser.id,
    projectId: "proj1",
    task: "Homepage redesign",
    startTime: "2023-06-01T09:30:00",
    endTime: "2023-06-01T12:00:00",
    duration: 150, // 2.5 hours in minutes
    date: "2023-06-01",
    notes: "Completed the initial wireframes for homepage"
  },
  {
    id: "log2",
    userId: currentUser.id,
    projectId: "proj1",
    task: "About page redesign",
    startTime: "2023-06-01T13:00:00",
    endTime: "2023-06-01T15:30:00",
    duration: 150, // 2.5 hours in minutes
    date: "2023-06-01",
    notes: "Created mockups for the about page"
  },
  {
    id: "log3",
    userId: currentUser.id,
    projectId: "proj2",
    task: "Login screen development",
    startTime: "2023-06-02T09:30:00",
    endTime: "2023-06-02T17:00:00",
    duration: 450, // 7.5 hours in minutes
    date: "2023-06-02",
    notes: "Implemented login screen with authentication"
  },
  {
    id: "log4",
    userId: currentUser.id,
    projectId: "proj3",
    task: "Schema mapping",
    startTime: "2023-06-03T10:30:00",
    endTime: "2023-06-03T16:00:00",
    duration: 330, // 5.5 hours in minutes
    date: "2023-06-03",
    notes: "Mapped old database schema to new schema"
  }
];

// Notifications for the current user
export const mockNotifications: Notification[] = [
  {
    id: "notif1",
    userId: currentUser.id,
    title: "Check-in Reminder",
    message: "Don't forget to check in for today!",
    type: "info",
    date: new Date().toISOString(),
    read: false
  },
  {
    id: "notif2",
    userId: currentUser.id,
    title: "Project Deadline",
    message: "Website Redesign project is due in 3 days",
    type: "warning",
    date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    read: false
  },
  {
    id: "notif3",
    userId: currentUser.id,
    title: "New Task Assigned",
    message: "You have been assigned to work on the Mobile App Dashboard",
    type: "info",
    date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    read: true
  },
  {
    id: "notif4",
    userId: currentUser.id,
    title: "Time Report Approved",
    message: "Your time report for last week has been approved",
    type: "success",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    read: true
  }
];
