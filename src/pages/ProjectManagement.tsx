
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Edit, Plus, Search, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import ProjectTeamMembers from "@/components/projects/ProjectTeamMembers";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error fetching projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddProject = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([formData])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Project created",
        description: "The project has been created successfully."
      });
      
      setIsAddProjectOpen(false);
      fetchProjects();
    } catch (error) {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleViewProject = (project) => {
    setSelectedProject(project);
    setIsViewDetailsOpen(true);
  };
  
  const filteredProjects = projects.filter(project => {
    // Filter by search term
    if (searchTerm && !project.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !project.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by tab
    if (activeTab !== "all" && project.status !== activeTab) {
      return false;
    }
    
    return true;
  });
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'on-hold':
        return <Badge className="bg-amber-100 text-amber-800">On Hold</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Project Management</h1>
        <p className="text-muted-foreground">Create and manage projects for your team</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <div className="flex items-center gap-4">
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
              <Button onClick={() => setIsAddProjectOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="on-hold">On Hold</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hrms-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading projects...</p>
                  </div>
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Project Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timeline</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProjects.map((project) => (
                        <TableRow key={project.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {project.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(project.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(new Date(project.start_date), "MMM d, yyyy")}
                                {project.end_date && ` - ${format(new Date(project.end_date), "MMM d, yyyy")}`}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewProject(project)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No projects found</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddProjectOpen(true)}
                    className="mt-2"
                  >
                    Create your first project
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <AddProjectForm onSubmit={handleAddProject} onCancel={() => setIsAddProjectOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* View Project Details Dialog */}
      {selectedProject && (
        <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Project Details</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="team">Team Members</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Project Name</Label>
                      <p className="font-medium mt-1">{selectedProject.name}</p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">{getStatusBadge(selectedProject.status)}</div>
                    </div>
                    <div>
                      <Label>Start Date</Label>
                      <p className="mt-1">{format(new Date(selectedProject.start_date), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <p className="mt-1">
                        {selectedProject.end_date 
                          ? format(new Date(selectedProject.end_date), "MMMM d, yyyy")
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Description</Label>
                    <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                      {selectedProject.description || "No description provided."}
                    </p>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                    Close
                  </Button>
                  <Button>Edit Project</Button>
                </DialogFooter>
              </TabsContent>
              
              <TabsContent value="team">
                <ProjectTeamMembers
                  projectId={selectedProject.id}
                  managerId={selectedProject.manager_id}
                />
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

// Add Project Form Component
const AddProjectForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    end_date: null,
    manager_id: null
  });
  const [managers, setManagers] = useState([]);
  
  useEffect(() => {
    fetchManagers();
  }, []);
  
  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          position,
          user_id,
          auth.users (email, id)
        `)
        .or('position.ilike.%manager%,position.ilike.%lead%,position.ilike.%director%');
      
      if (error) throw error;
      setManagers(data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === "" ? null : value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Project Name</Label>
          <Input 
            id="name" 
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter project name" 
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            placeholder="Project description"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input 
              id="start_date" 
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end_date">End Date (Optional)</Label>
            <Input 
              id="end_date" 
              name="end_date"
              type="date"
              value={formData.end_date || ''}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              name="status" 
              value={formData.status}
              onValueChange={value => handleChange({ target: { name: 'status', value }})}
              required
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="manager_id">Project Manager</Label>
            <Select 
              name="manager_id" 
              value={formData.manager_id || ''}
              onValueChange={value => handleChange({ target: { name: 'manager_id', value }})}
            >
              <SelectTrigger id="manager_id">
                <SelectValue placeholder="Select manager (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {managers.map(manager => (
                  <SelectItem key={manager.id} value={manager.users.id}>
                    {manager.users.email} ({manager.position})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Project</Button>
      </DialogFooter>
    </form>
  );
};

export default ProjectManagement;
