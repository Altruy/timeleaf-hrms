
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Clock } from "lucide-react";
import { Project } from "@/types";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { formatDuration, stringToColor } from "@/utils/helpers";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const { getTotalTimeForProject, activeTimeLog, startTimer, stopTimer } = useTimeTracking();
  const [openDialog, setOpenDialog] = useState(false);
  const [taskName, setTaskName] = useState("");

  const totalMinutes = getTotalTimeForProject(project.id);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalFormattedTime = formatDuration(totalMinutes);
  
  const isTimerActive = activeTimeLog && activeTimeLog.projectId === project.id;
  const projectColor = stringToColor(project.name);
  
  const handleStartTimer = () => {
    setOpenDialog(true);
  };

  const handleConfirmStartTimer = () => {
    if (taskName.trim()) {
      startTimer(project.id, taskName);
      setTaskName("");
      setOpenDialog(false);
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: projectColor }}
            ></div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {totalFormattedTime}
            </div>
          </div>
          <CardTitle className="text-base mt-1">{project.name}</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {project.description}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>60%</span>
          </div>
          
          <Progress value={60} className="h-1.5 mb-4" />
          
          <div className="flex justify-end">
            {isTimerActive ? (
              <button 
                onClick={stopTimer}
                className="timer-button timer-button-stop"
              >
                <Pause className="h-4 w-4" />
              </button>
            ) : (
              <button 
                onClick={handleStartTimer}
                className="timer-button timer-button-start"
              >
                <Play className="h-4 w-4" />
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start timer for {project.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="task" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Task name
                </label>
                <Input
                  id="task"
                  placeholder="What are you working on?"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStartTimer}>Start Timer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProjectCard;
