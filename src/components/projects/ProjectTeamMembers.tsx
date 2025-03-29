
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamMemberList } from "./team-members/TeamMemberList";
import { AddMemberForm } from "./team-members/AddMemberForm";
import { useProjectMembers } from "./team-members/useProjectMembers";

interface ProjectTeamMembersProps {
  projectId: string;
  managerId?: string;
}

const ProjectTeamMembers: React.FC<ProjectTeamMembersProps> = ({ projectId, managerId }) => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const { 
    projectMembers, 
    isLoading, 
    handleAddMember, 
    handleRemoveMember 
  } = useProjectMembers(projectId);
  
  const handleAddMemberSubmit = async (userData: any) => {
    const success = await handleAddMember(userData);
    if (success) {
      setIsAddMemberOpen(false);
    }
  };
  
  return (
    <div>
      <TeamMemberList
        members={projectMembers}
        isLoading={isLoading}
        onAddMember={() => setIsAddMemberOpen(true)}
        onRemoveMember={handleRemoveMember}
      />
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <AddMemberForm 
            projectId={projectId} 
            onSubmit={handleAddMemberSubmit} 
            onCancel={() => setIsAddMemberOpen(false)}
            existingMembers={projectMembers}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectTeamMembers;
