
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Edit, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const TeamMemberList = ({ teamMembers, isLoading, searchQuery, onRefresh }) => {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const filteredMembers = teamMembers.filter(member => {
    if (!searchQuery) return true;
    
    const searchTerm = searchQuery.toLowerCase();
    const email = member.email?.toLowerCase() || '';
    const department = member.department?.toLowerCase() || '';
    const position = member.position?.toLowerCase() || '';
    
    return (
      email.includes(searchTerm) ||
      department.includes(searchTerm) ||
      position.includes(searchTerm)
    );
  });
  
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setViewDialogOpen(true);
  };
  
  const handleDeletePrompt = (member) => {
    setSelectedMember(member);
    setDeleteDialogOpen(true);
  };
  
  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', selectedMember.id);
      
      if (error) throw error;
      
      toast({
        title: "Member removed",
        description: "Team member has been removed successfully."
      });
      
      setDeleteDialogOpen(false);
      onRefresh();
    } catch (error) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'on-leave':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hrms-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading team members...</p>
        </div>
      </div>
    );
  }
  
  if (filteredMembers.length === 0 && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No team members found</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.department}</TableCell>
                <TableCell>{member.position}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(member.hire_date), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleViewMember(member)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeletePrompt(member)}
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
      
      {/* View Member Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{selectedMember.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Department</p>
                  <p>{selectedMember.department}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Position</p>
                  <p>{selectedMember.position}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedMember.status)}>
                    {selectedMember.status.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hire Date</p>
                  <p>{format(new Date(selectedMember.hire_date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Reports To</p>
                  <p>
                    {selectedMember.reports_to 
                      ? teamMembers.find(m => m.id === selectedMember.reports_to)?.email || 'Unknown'
                      : 'None'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to remove this team member?</p>
            <p className="text-sm text-muted-foreground mt-2">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMember}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamMemberList;
