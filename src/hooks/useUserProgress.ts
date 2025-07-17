import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface ProgressItem {
  id: string;
  item_id: string;
  item_type: string;
  status: string;
  domain: string;
  difficulty?: number;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name?: string;
  onboarding_completed: boolean;
  taste_preferences?: any;
  created_at: string;
  updated_at: string;
}

export const useUserProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProgress([]);
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (progressError) {
        console.error('Error fetching progress:', progressError);
      } else {
        setProgress(progressData || []);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackProgress = async (
    itemId: string,
    itemType: string,
    status: string,
    domain: string,
    difficulty?: number,
    metadata?: any
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_type: itemType,
          status: status,
          domain: domain,
          difficulty: difficulty,
          metadata: metadata
        })
        .select()
        .single();

      if (error) {
        console.error('Error tracking progress:', error);
        return null;
      }

      // Refresh progress data
      await fetchUserData();
      return data;
    } catch (error) {
      console.error('Error tracking progress:', error);
      return null;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          ...updates
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return null;
      }

      setProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  };

  const getProgressByStatus = (status: string) => {
    return progress.filter(item => item.status === status);
  };

  const getProgressByDomain = (domain: string) => {
    return progress.filter(item => item.domain === domain);
  };

  return {
    progress,
    profile,
    loading,
    trackProgress,
    updateProfile,
    getProgressByStatus,
    getProgressByDomain,
    refreshData: fetchUserData
  };
};