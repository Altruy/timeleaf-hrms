
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, UserMinus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ProjectTeamMembers = ({ projectId, managerId }) => {
  const [projectMembers, setProjectMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  
  useEffect(() => {
    if (projectId) {
      fetchProjectMembers();
    }
  }, [projectId]);
  
  const fetchProjectMembers = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          user_id,
          joined_at,
          auth.users (email, id)
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      setProjectMembers(data || []);
    } catch (error) {
      console.error('Error fetching project members:', error);
      toast({
        title: "Error fetching team members",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddMember = async (userData) => {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .insert([{
          project_id: projectId,
          ...userData
        }])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Member added",
        description: "Team member has been added to the project."
      });
      
      setIsAddMemberOpen(false);
      fetchProjectMembers();
    } catch (error) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);
      
      if (error) throw error;
      
      toast({
        title: "Member removed",
        description: "Team member has been removed from the project."
      });
      
      fetchProjectMembers();
    } catch (error) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hrms-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading project members...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button size="sm" onClick={() => setIsAddMemberOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
      
      {projectMembers.length > 0 ? (
        <div className="space-y-3">
          {projectMembers.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarFallback>{getInitials(member.users?.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.users?.email}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveMember(member.id)}
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg">
          <p className="text-muted-foreground">No team members assigned to this project</p>
          <Button 
            variant="link" 
            onClick={() => setIsAddMemberOpen(true)}
            className="mt-2"
          >
            Add team members
          </Button>
        </div>
      )}
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <AddMemberForm 
            projectId={projectId} 
            onSubmit={handleAddMember} 
            onCancel={() => setIsAddMemberOpen(false)}
            existingMembers={projectMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Add Member Form
const AddMemberForm = ({ projectId, onSubmit, onCancel, existingMembers }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    role: 'member'
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  
  useEffect(() => {
    fetchAvailableUsers();
  }, []);
  
  const fetchAvailableUsers = async () => {
    try {
      // Get users from the team_members table who are not already in the project
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          auth.users (email, id)
        `)
        .not('user_id', 'in', `(${existingMembers.map(m => m.user_id).join(',')})`);
      
      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="user_id">Team Member</Label>
          <Select
            name="user_id"
            onValueChange={value => handleChange({ target: { name: 'user_id', value }})}
            required
          >
            <SelectTrigger id="user_id">
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.users?.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="role">Role in Project</Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={value => handleChange({ target: { name: 'role', value }})}
            required
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="manager">Project Manager</SelectItem>
              <SelectItem value="lead">Team Lead</SelectItem>
              <SelectItem value="member">Team Member</SelectItem>
              <SelectItem value="observer">Observer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add to Project</Button>
      </DialogFooter>
    </form>
  );
};

export default ProjectTeamMembers;
