'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile, uploadProfileAvatar } from '../../lib/profile';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
      return;
    }

    if (user) {
      setEmail(user.email || '');
      setDisplayName(user.user_metadata?.display_name || '');
      setAvatarUrl(user.user_metadata?.avatar_url || '');
    }
  }, [user, authLoading, router]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const newAvatarUrl = await uploadProfileAvatar(user.id, file);
      if (newAvatarUrl) {
        // Update user metadata with new avatar URL
        const { error } = await updateUserProfile(user.id, {
          avatar_url: newAvatarUrl
        });

        if (error) throw error;

        setAvatarUrl(newAvatarUrl);
        setSuccessMessage('Avatar updated successfully!');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrorMessage('Failed to upload avatar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const { error } = await updateUserProfile(user.id, {
        display_name: displayName
      });

      if (error) throw error;

      setSuccessMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col justify-center items-center h-64 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white shadow-md"></div>
            <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-3xl">
        <Card className="mb-8 overflow-hidden border-gray-200/50 dark:border-gray-700/50 shadow-lg">
          <CardHeader className="pb-0">
            <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-4 text-green-700 dark:text-green-300">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg p-4 text-red-700 dark:text-red-300">
                {errorMessage}
              </div>
            )}

            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24 cursor-pointer hover:opacity-80 transition-opacity" onClick={handleAvatarClick}>
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={displayName || 'User avatar'} />
                ) : (
                  <AvatarFallback className="text-lg">
                    {(displayName || email || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleAvatarClick}
              >
                Change Avatar
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Click on the avatar or button to upload a new image
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-4 h-4 mr-2 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                      Updating...
                    </span>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}