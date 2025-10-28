'use client';

import { Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { ButtonSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

// Page-specific skeleton for security settings
function SecuritySettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-destructive/20 p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-64" />
        </div>

        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />

          <div className="rounded-md bg-destructive/10 p-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="flex gap-2">
            <ButtonSkeleton />
            <ButtonSkeleton className="bg-destructive" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SecurityPage() {
  const { user, isSignedIn } = useUser();
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isSignedIn || !user) {
    return <SecuritySettingsSkeleton />;
  }

  const handleDeleteAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please enter your password to confirm account deletion.',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      // Note: Clerk account deletion should be handled via API route
      // For now, we'll show a message about this limitation
      toast({
        title: 'Feature not available',
        description: 'Account deletion needs to be implemented via Clerk API routes.',
        variant: 'destructive',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete account. Please check your password.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Account Deletion Section */}
      <Card className="border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. This action cannot be undone.
              </p>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </Button>
            </div>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-6">
              <div className="rounded-md bg-destructive/10 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-destructive">
                    Warning: This action is irreversible
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    All your data will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="deletePassword" className="text-destructive">
                  Enter your password to confirm
                </Label>
                <Input
                  id="deletePassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="border-destructive/50 focus-visible:ring-destructive"
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Confirm Delete'
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
