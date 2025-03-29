
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase, SUPABASE_PUBLISHABLE_KEY, EDGE_FUNCTION_URL } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  position: string;
  department?: string;
}

interface ProjectMember {
  id: string;
  team_member_id?: string;
}

interface AddMemberFormProps {
  projectId: string;
  onSubmit: (data: { user_id: string; team_member_id: string; role: string }) => void;
  onCancel: () => void;
  existingMembers: ProjectMember[];
}

export const AddMemberForm: React.FC<AddMemberFormProps> = ({
  projectId,
  onSubmit,
  onCancel,
  existingMembers,
}) => {
  const [formData, setFormData] = useState({
    user_id: '',
    team_member_id: '',
    role: 'member'
  });
  const [availableTeamMembers, setAvailableTeamMembers] = useState<TeamMember[]>([]);
  
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
  
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectTeamMember = (teamMemberId: string) => {
    const selectedMember = availableTeamMembers.find(m => m.id === teamMemberId);
    if (selectedMember) {
      setFormData(prev => ({
        ...prev,
        team_member_id: teamMemberId,
        user_id: selectedMember.user_id
      }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
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
