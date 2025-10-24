
'use client';

import { useState } from 'react';
import type { User } from '@/lib/types';
import { useUserStore } from '@/store/user-store';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';

interface ChangeRoleDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: User;
}

const roles: User['role'][] = ['admin', 'sales', 'accountant', 'supplier', 'customer'];

export function ChangeRoleDialog({ isOpen, setIsOpen, user }: ChangeRoleDialogProps) {
  const { updateUser } = useUserStore();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<User['role']>(user.role);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateUser(user._id, { role: selectedRole });
      toast({
        title: 'Role Updated',
        description: `${user.name}'s role has been changed to ${selectedRole}.`,
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: `Could not update role for ${user.name}.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role for {user.name}</DialogTitle>
          <DialogDescription>
            Select a new role for this user. This will change their permissions and access level.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <Label htmlFor="role-select">User Role</Label>
            <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as User['role'])}>
                <SelectTrigger id="role-select">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    {roles.map(role => (
                        <SelectItem key={role} value={role} className="capitalize">
                            {role}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveChanges} disabled={isSaving || selectedRole === user.role}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
