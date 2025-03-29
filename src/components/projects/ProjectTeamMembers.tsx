
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
      // Modified query to avoid using auth.users nested select
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          user_id,
          team_member_id,
          joined_at,
          team_members (
            id,
            position,
            department,
            salary,
            commission_rate
          )
        `)
        .eq('project_id', projectId);
      
      if (error) throw error;
      
      // Fetch team member email information separately
      if (data && data.length > 0) {
        const userIds = data.map(member => member.user_id);
        
        const response = await fetch(`${EDGE_FUNCTION_URL}/get_user_emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ user_ids: userIds })
        });
        
        let usersData = [];
        
        if (response.ok) {
          usersData = await response.json();
        } else {
          console.error('Error fetching user emails:', await response.text());
          usersData = userIds.map(id => ({ 
            id, 
            email: `user-${id.substring(0, 8)}@example.com` 
          }));
        }
        
        // Combine the data
        const enhancedData = data.map(member => {
          const userEmail = usersData.find(u => u.id === member.user_id)?.email || 
                           `user-${member.user_id.substring(0, 8)}@example.com`;
          
          return {
            ...member,
            email: userEmail
          };
        });
        
        setProjectMembers(enhancedData);
      } else {
        setProjectMembers([]);
      }
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
                  <AvatarFallback>{getInitials(member.email)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{member.email}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                  {member.team_members && (
                    <p className="text-xs text-muted-foreground">
                      {member.team_members.department} · {member.team_members.position}
                    </p>
                  )}
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
    team_member_id: '',
    role: 'member'
  });
  const [availableTeamMembers, setAvailableTeamMembers] = useState([]);
  
  useEffect(() => {
    fetchAvailableTeamMembers();
  }, []);
  
  const fetchAvailableTeamMembers = async () => {
    try {
      // Get team members who are not already in the project
      const existingTeamMemberIds = existingMembers
        .filter(m => m.team_member_id)
        .map(m => m.team_member_id);
      
      // Modified query to not use auth.users nested select
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          id,
          user_id,
          position,
          department,
          status
        `)
        .eq('status', 'active');
      
      if (error) throw error;
      
      // Fetch user emails separately
      if (data && data.length > 0) {
        const userIds = data.map(member => member.user_id);
        
        const response = await fetch(`${EDGE_FUNCTION_URL}/get_user_emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ user_ids: userIds })
        });
        
        let usersData = [];
        
        if (response.ok) {
          usersData = await response.json();
        } else {
          console.error('Error fetching user emails:', await response.text());
          usersData = userIds.map(id => ({ 
            id, 
            email: `user-${id.substring(0, 8)}@example.com` 
          }));
        }
        
        // Combine the data and filter out members already in the project
        const enhancedMembers = data.map(member => {
          const userEmail = usersData.find(u => u.id === member.user_id)?.email || 
                           `user-${member.user_id.substring(0, 8)}@example.com`;
          
          return {
            ...member,
            email: userEmail
          };
        }).filter(member => !existingTeamMemberIds.includes(member.id));
        
        setAvailableTeamMembers(enhancedMembers);
      } else {
        setAvailableTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching available team members:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectTeamMember = (teamMemberId) => {
    const selectedMember = availableTeamMembers.find(m => m.id === teamMemberId);
    if (selectedMember) {
      setFormData(prev => ({
        ...prev,
        team_member_id: teamMemberId,
        user_id: selectedMember.user_id
      }));
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="team_member_id">Team Member</Label>
          <Select
            name="team_member_id"
            onValueChange={handleSelectTeamMember}
            required
          >
            <SelectTrigger id="team_member_id">
              <SelectValue placeholder="Select a team member" />
            </SelectTrigger>
            <SelectContent>
              {availableTeamMembers.map(member => (
                <SelectItem key={member.id} value={member.id}>
                  {member.email} ({member.position})
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
