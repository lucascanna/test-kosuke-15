'use client';

import { Check, Loader2, Upload, Edit, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@clerk/nextjs';
import { useUserAvatar } from '@/hooks/use-user-avatar';
import { useProfileUpload } from '@/hooks/use-profile-upload';
import { ButtonSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc/client';
import { useToast } from '@/hooks/use-toast';

// Page-specific skeleton for profile settings
function ProfileSettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-48 mb-4" />

        <div className="flex flex-col md:flex-row gap-8">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center gap-4">
            <Skeleton className="h-32 w-32 rounded-lg" />
            <ButtonSkeleton />
          </div>

          {/* Profile Information */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <ButtonSkeleton size="sm" />
                  <ButtonSkeleton size="sm" />
                </div>
              </div>
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileSettings() {
  const { user, isSignedIn } = useUser();
  const { profileImageUrl, initials, displayName, primaryEmail } = useUserAvatar(user);
  const { handleImageUpload, isUploading } = useProfileUpload();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(displayName);

  const updateDisplayName = trpc.user.updateDisplayName.useMutation({
    onSuccess: async (data) => {
      setIsEditing(false);
      setEditDisplayName(data.displayName); // Update local state
      toast({
        title: 'Profile updated',
        description: 'Your display name has been updated successfully.',
      });
      // Force Clerk to reload the user data
      await user?.reload();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  if (!isSignedIn || !user) {
    return <ProfileSettingsSkeleton />;
  }

  const handleSaveProfile = () => {
    if (!editDisplayName.trim()) return;
    updateDisplayName.mutate({ displayName: editDisplayName });
  };

  const handleCancelEdit = () => {
    setEditDisplayName(displayName);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveProfile();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account settings and profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32 rounded-lg overflow-hidden border border-border bg-muted">
                {profileImageUrl ? (
                  <Image
                    src={profileImageUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized={profileImageUrl.includes('localhost')}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary">
                    <span className="text-2xl font-medium text-primary-foreground">{initials}</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Button variant="outline" disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Change Image
                </Button>
                {!isUploading && (
                  <Input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                )}
              </div>
            </div>

            {/* Profile Information */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="displayName"
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Display Name
                  </Label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Input
                        id="displayName"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your display name"
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        onClick={handleSaveProfile}
                        disabled={updateDisplayName.isPending || !editDisplayName.trim()}
                        size="sm"
                      >
                        {updateDisplayName.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-base flex-1">{displayName}</p>
                      <Button
                        onClick={() => {
                          setEditDisplayName(displayName);
                          setIsEditing(true);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <p className="text-base">{primaryEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
