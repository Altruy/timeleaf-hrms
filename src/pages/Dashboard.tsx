
import AppLayout from "@/components/layout/AppLayout";
import { BarChart2, Calendar, Clock, Users } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import ProjectCard from "@/components/dashboard/ProjectCard";
import ActiveTimer from "@/components/dashboard/ActiveTimer";
import AttendanceWidget from "@/components/dashboard/AttendanceWidget";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, activeTimeLog } = useTimeTracking();
  
  // Filter active projects
  const activeProjects = projects.filter(project => project.status === 'active');
  
  return (
    <AppLayout>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening today.</p>
      </div>
      
      {activeTimeLog && (
        <div className="mb-6">
          <ActiveTimer />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Working Hours"
          value="32.5h"
          icon={Clock}
          description="This week"
          trend="up"
          trendValue="2.1% from last week"
        />
        <StatsCard
          title="Projects"
          value={activeProjects.length.toString()}
          icon={BarChart2}
          description="Active projects"
        />
        <StatsCard
          title="Attendance"
          value="92%"
          icon={Calendar}
          description="This month"
          trend="neutral"
          trendValue="Same as last month"
        />
        <StatsCard
          title="Team Members"
          value="8"
          icon={Users}
          description="In your projects"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Active Projects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeProjects.slice(0, 4).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Attendance</h2>
          <AttendanceWidget />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
