
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamMember {
  id: string;
  email: string;
  role: string;
  team_members?: {
    department?: string;
    position?: string;
  };
}

interface TeamMemberListProps {
  members: TeamMember[];
  isLoading: boolean;
  onAddMember: () => void;
  onRemoveMember: (id: string) => void;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  isLoading,
  onAddMember,
  onRemoveMember,
}) => {
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
        <Button size="sm" onClick={onAddMember}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
      
      {members.length > 0 ? (
        <div className="space-y-3">
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              id={member.id}
              email={member.email}
              role={member.role}
              department={member.team_members?.department}
              position={member.team_members?.position}
              onRemove={onRemoveMember}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-6 border rounded-lg">
          <p className="text-muted-foreground">No team members assigned to this project</p>
          <Button 
            variant="link" 
            onClick={onAddMember}
            className="mt-2"
          >
            Add team members
          </Button>
        </div>
      )}
    </div>
  );
};
