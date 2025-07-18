import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TasteJourneyData {
  tasteGraph: any;
  onboardingReport: string;
  discomfortItems: any[];
  progressivePaths: Record<string, any[]>;
  fiveDayPlans: Record<string, any>;
}

interface ProgressiveStep {
  title: string;
  difficulty: number;
  description: string;
  culturalContext?: string;
}

export const useTasteJourney = () => {
  const { toast } = useToast();
  const [journeyData, setJourneyData] = useState<TasteJourneyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startTasteJourney = useCallback(async (preferences: any) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting taste journey with preferences:', preferences);

      const { data, error } = await supabase.functions.invoke('taste-journey', {
        body: {
          action: 'start',
          preferences
        }
      });

      if (error) {
        console.error('Error starting taste journey:', error);
        throw new Error(error.message || 'Failed to start taste journey');
      }

      console.log('Taste journey started successfully:', data);

      setJourneyData({
        tasteGraph: data.tasteGraph || {},
        onboardingReport: data.onboardingReport || '',
        discomfortItems: data.discomfortItems || [],
        progressivePaths: {},
        fiveDayPlans: {}
      });

      toast({
        title: 'Taste Journey Started!',
        description: 'Your personalized cultural expansion journey has begun.',
      });

      return data;
    } catch (err: any) {
      console.error('Error in startTasteJourney:', err);
      const errorMessage = err.message || 'Failed to start taste journey';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const generateProgressivePath = useCallback(async (domain: string, currentTaste: string, targetTaste: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Generating progressive path:', { domain, currentTaste, targetTaste });

      const { data, error } = await supabase.functions.invoke('taste-journey', {
        body: {
          action: 'generate-path',
          domain,
          currentTaste,
          targetTaste
        }
      });

      if (error) {
        console.error('Error generating progressive path:', error);
        throw new Error(error.message || 'Failed to generate progressive path');
      }

      console.log('Progressive path generated:', data);

      // Update journey data with new progressive path
      setJourneyData(prev => prev ? {
        ...prev,
        progressivePaths: {
          ...prev.progressivePaths,
          [domain]: data.progressivePath || []
        }
      } : null);

      toast({
        title: 'Progressive Path Created!',
        description: `Your ${domain} journey path has been generated.`,
      });

      return data.progressivePath || [];
    } catch (err: any) {
      console.error('Error in generateProgressivePath:', err);
      const errorMessage = err.message || 'Failed to generate progressive path';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFiveDayPlan = useCallback(async (preferences: any, domain?: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Creating 5-day plan:', { domain, preferences });

      const { data, error } = await supabase.functions.invoke('taste-journey', {
        body: {
          action: 'create-plan',
          preferences,
          domain
        }
      });

      if (error) {
        console.error('Error creating 5-day plan:', error);
        throw new Error(error.message || 'Failed to create 5-day plan');
      }

      console.log('5-day plan created:', data);

      // Update journey data with new plan
      const planKey = domain || 'general';
      setJourneyData(prev => prev ? {
        ...prev,
        fiveDayPlans: {
          ...prev.fiveDayPlans,
          [planKey]: data.fiveDayPlan || {}
        }
      } : null);

      toast({
        title: '5-Day Plan Created!',
        description: `Your ${domain || 'multi-domain'} expansion plan is ready.`,
      });

      return data.fiveDayPlan || {};
    } catch (err: any) {
      console.error('Error in createFiveDayPlan:', err);
      const errorMessage = err.message || 'Failed to create 5-day plan';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const callGeminiAPI = useCallback(async (
    prompt: string, 
    type: 'onboarding' | 'explanation' | 'curriculum' | 'growth-report',
    context?: any
  ) => {
    try {
      console.log('Calling Gemini API:', { type, prompt: prompt.substring(0, 100) + '...' });

      const { data, error } = await supabase.functions.invoke('gemini-api', {
        body: {
          prompt,
          type,
          context: context ? JSON.stringify(context) : undefined,
          ...context
        }
      });

      if (error) {
        console.error('Error calling Gemini API:', error);
        throw new Error(error.message || 'Failed to call Gemini API');
      }

      console.log('Gemini API response received');
      return data.response || '';
    } catch (err: any) {
      console.error('Error in callGeminiAPI:', err);
      const errorMessage = err.message || 'Failed to call Gemini API';
      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  const callQlooAPI = useCallback(async (
    endpoint: 'affinity-cluster' | 'recipes/antitheses' | 'cross-domain-affinity',
    method: 'GET' | 'POST',
    params?: any,
    body?: any
  ) => {
    try {
      console.log('Calling Qloo API:', { endpoint, method });

      const { data, error } = await supabase.functions.invoke('qloo-api', {
        body: {
          endpoint,
          method,
          params,
          body
        }
      });

      if (error) {
        console.error('Error calling Qloo API:', error);
        throw new Error(error.message || 'Failed to call Qloo API');
      }

      console.log('Qloo API response received');
      return data;
    } catch (err: any) {
      console.error('Error in callQlooAPI:', err);
      const errorMessage = err.message || 'Failed to call Qloo API';
      toast({
        title: 'API Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  }, [toast]);

  return {
    journeyData,
    loading,
    error,
    startTasteJourney,
    generateProgressivePath,
    createFiveDayPlan,
    callGeminiAPI,
    callQlooAPI,
  };
};