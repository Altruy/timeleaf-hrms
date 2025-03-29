
import { Card, CardContent } from "@/components/ui/card";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { mockProjects } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { StopCircle } from "lucide-react";
import { formatDuration } from "@/utils/helpers";

const ActiveTimer = () => {
  const { activeTimeLog, stopTimer } = useTimeTracking();
  
  if (!activeTimeLog) {
    return null;
  }
  
  const project = mockProjects.find(p => p.id === activeTimeLog.projectId);
  
  if (!project) {
    return null;
  }
  
  return (
    <Card className="border-hrms-primary/20 bg-hrms-primary/5">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-hrms-primary">
              {activeTimeLog.task}
            </h3>
            <p className="text-sm text-muted-foreground">{project.name}</p>
            <div className="mt-2 text-2xl font-bold text-hrms-primary animate-pulse-opacity">
              {formatDuration(activeTimeLog.duration)}
            </div>
          </div>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={stopTimer}
            className="h-10 px-4"
          >
            <StopCircle className="mr-2 h-4 w-4" />
            Stop Timer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTimer;
