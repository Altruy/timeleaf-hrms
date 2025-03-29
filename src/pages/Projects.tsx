
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeTracking } from "@/contexts/TimeTrackingContext";
import { Input } from "@/components/ui/input";
import { Search, Play, Pause, Clock, ChevronRight } from "lucide-react";
import { formatDuration, stringToColor } from "@/utils/helpers";
import { useEffect, useState } from "react";
import { Project } from "@/types";
import ActiveTimer from "@/components/dashboard/ActiveTimer";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const Projects = () => {
  const { projects, activeTimeLog, timeLogs, startTimer, stopTimer } = useTimeTracking();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [taskName, setTaskName] = useState("");
  
  useEffect(() => {
    let result = projects;
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by tab
    if (activeTab !== "all") {
      result = result.filter(project => project.status === activeTab);
    }
    
    setFilteredProjects(result);
  }, [projects, searchTerm, activeTab]);
  
  const handleStartTimer = (project: Project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleConfirmStartTimer = () => {
    if (selectedProject && taskName.trim()) {
      startTimer(selectedProject.id, taskName);
      setTaskName("");
      setOpenDialog(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage your projects and track time</p>
      </div>
      
      {activeTimeLog && (
        <div className="mb-6">
          <ActiveTimer />
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>My Projects</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Project</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time Logged</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredProjects.length > 0 ? (
                        filteredProjects.map((project) => {
                          const projectColor = stringToColor(project.name);
                          const isActiveTimer = activeTimeLog && activeTimeLog.projectId === project.id;
                          
                          return (
                            <tr
                              key={project.id}
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-3"
                                    style={{ backgroundColor: projectColor }}
                                  ></div>
                                  <div>
                                    <div className="font-medium">{project.name}</div>
                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                      {project.description}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    project.status === 'active' ? 'bg-green-100 text-green-800' :
                                    project.status === 'on-hold' ? 'bg-amber-100 text-amber-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {project.status.split('-').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                  ).join(' ')}
                                </span>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  {formatDuration(0)} {/* Replace with actual time logged */}
                                </div>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                  {isActiveTimer ? (
                                    <button
                                      onClick={stopTimer}
                                      className="timer-button timer-button-stop"
                                    >
                                      <Pause className="h-4 w-4" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleStartTimer(project)}
                                      className="timer-button timer-button-start"
                                      disabled={!!activeTimeLog}
                                    >
                                      <Play className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    className="flex items-center justify-center rounded-full w-10 h-10 text-gray-500 hover:bg-gray-100 transition-colors"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No projects found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start timer for {selectedProject?.name}</DialogTitle>
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
    </AppLayout>
  );
};

export default Projects;
