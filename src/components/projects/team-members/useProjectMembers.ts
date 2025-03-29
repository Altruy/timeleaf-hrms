
import { useState, useEffect } from "react";
import { supabase, SUPABASE_PUBLISHABLE_KEY, EDGE_FUNCTION_URL } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProjectMember {
  id: string;
  role: string;
  user_id: string;
  team_member_id?: string;
  email: string;
  team_members?: {
    id: string;
    position: string;
    department: string;
    salary?: number;
    commission_rate?: number;
  };
}

export const useProjectMembers = (projectId: string) => {
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
    } catch (error: any) {
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
  
  const handleAddMember = async (userData: { project_id: string; user_id: string; team_member_id: string; role: string }) => {
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
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  };
  
  const handleRemoveMember = async (memberId: string) => {
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
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectMembers();
    }
  }, [projectId]);

  return {
    projectMembers,
    isLoading,
    fetchProjectMembers,
    handleAddMember,
    handleRemoveMember
  };
};
