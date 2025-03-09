'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface NotificationPreferences {
  matchStart: boolean;
  goals: boolean;
  cards: boolean;
  halftime: boolean;
  fulltime: boolean;
  favoriteTeamsOnly: boolean;
}

export default function NotificationSystem() {
  const { user } = useAuth();
  const [notificationsSupported, setNotificationsSupported] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    matchStart: true,
    goals: true,
    cards: true,
    halftime: true,
    fulltime: true,
    favoriteTeamsOnly: false
  });

  // Check if notifications are supported and permission status on mount
  useEffect(() => {
    const checkNotificationSupport = () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        setNotificationsSupported(false);
        return;
      }
      
      setNotificationsSupported(true);
      
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    };
    
    checkNotificationSupport();
    
    // Load saved preferences from localStorage if available
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Error parsing saved notification preferences:', error);
      }
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!notificationsSupported) return;
    
    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        // Show a test notification
        new Notification('LiveGames Notifications Enabled', {
          body: 'You will now receive updates for live matches',
          icon: '/favicon.ico'
        });
      } else {
        setNotificationsEnabled(false);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Toggle a specific notification preference
  const togglePreference = (key: keyof NotificationPreferences) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    
    setPreferences(updatedPreferences);
    
    // Save to localStorage
    localStorage.setItem('notificationPreferences', JSON.stringify(updatedPreferences));
  };

  // Function to display a notification (would be called from match events)
  const showNotification = (title: string, body: string, icon?: string) => {
    if (!notificationsEnabled) return;
    
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico'
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  if (!user) {
    return null; // Only show for logged in users
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowDialog(true)}
        className="flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        Notifications
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Match Notifications</DialogTitle>
            <DialogDescription>
              Get real-time updates for your favorite matches
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {!notificationsSupported ? (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800/30">
                <CardContent className="pt-4">
                  <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                    Your browser doesn't support notifications. Try using a different browser to enable this feature.
                  </p>
                </CardContent>
              </Card>
            ) : !notificationsEnabled ? (
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
                <CardContent className="pt-4">
                  <p className="text-blue-800 dark:text-blue-300 text-sm mb-3">
                    Enable notifications to get updates about match events in real-time, even when you're not on the site.
                  </p>
                  <Button onClick={requestPermission} className="w-full">
                    Enable Notifications
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Notification Settings</CardTitle>
                    <CardDescription>Choose which events you want to be notified about</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="matchStart" className="text-sm font-medium">Match Start</label>
                      <input 
                        type="checkbox" 
                        id="matchStart" 
                        checked={preferences.matchStart} 
                        onChange={() => togglePreference('matchStart')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="goals" className="text-sm font-medium">Goals</label>
                      <input 
                        type="checkbox" 
                        id="goals" 
                        checked={preferences.goals} 
                        onChange={() => togglePreference('goals')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="cards" className="text-sm font-medium">Cards (Yellow/Red)</label>
                      <input 
                        type="checkbox" 
                        id="cards" 
                        checked={preferences.cards} 
                        onChange={() => togglePreference('cards')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="halftime" className="text-sm font-medium">Half-time</label>
                      <input 
                        type="checkbox" 
                        id="halftime" 
                        checked={preferences.halftime} 
                        onChange={() => togglePreference('halftime')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="fulltime" className="text-sm font-medium">Full-time</label>
                      <input 
                        type="checkbox" 
                        id="fulltime" 
                        checked={preferences.fulltime} 
                        onChange={() => togglePreference('fulltime')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t mt-2">
                      <label htmlFor="favoriteTeamsOnly" className="text-sm font-medium">Only for favorite teams</label>
                      <input 
                        type="checkbox" 
                        id="favoriteTeamsOnly" 
                        checked={preferences.favoriteTeamsOnly} 
                        onChange={() => togglePreference('favoriteTeamsOnly')} 
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>
                
                <Button 
                  onClick={() => {
                    showNotification('Test Notification', 'This is a test notification from LiveGames');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send Test Notification
                </Button>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setShowDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}