import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TasteJourneyRequest {
  action: 'start' | 'generate-path' | 'create-plan';
  preferences?: any;
  domain?: string;
  currentTaste?: string;
  targetTaste?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { action, preferences, domain, currentTaste, targetTaste } = await req.json() as TasteJourneyRequest;

    console.log('Taste journey request:', { action, domain, user: user.id });

    switch (action) {
      case 'start':
        return await startTasteJourney(supabaseClient, user.id, preferences);
        
      case 'generate-path':
        return await generateProgressivePath(supabaseClient, user.id, domain, currentTaste, targetTaste);
        
      case 'create-plan':
        return await createFiveDayPlan(supabaseClient, user.id, preferences, domain);
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
    }

  } catch (error) {
    console.error('Error in taste-journey function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function startTasteJourney(supabase: any, userId: string, preferences: any) {
  console.log('Starting taste journey for user:', userId);
  
  try {
    // 1. Get user's taste graph using Qloo's affinity-cluster
    const affinityResponse = await supabase.functions.invoke('qloo-api', {
      body: {
        endpoint: 'affinity-cluster',
        method: 'GET',
        params: {
          user_preferences: JSON.stringify(preferences),
          domains: 'film,music,books,food,fashion'
        }
      }
    });

    console.log('Qloo affinity response:', affinityResponse);

    let tasteGraph = {};
    if (affinityResponse.data) {
      tasteGraph = affinityResponse.data;
    }

    // 2. Generate onboarding analysis with Gemini
    const geminiResponse = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt: `Analyze this user's taste preferences and create a comprehensive cultural profile. Identify comfort zones, potential growth areas, and recommend 3 discomfort challenges for immediate exploration.`,
        type: 'onboarding',
        preferences: preferences,
        context: `User preferences: ${JSON.stringify(preferences)}`
      }
    });

    console.log('Gemini onboarding analysis completed');

    let onboardingReport = 'Welcome to your taste journey! We\'ll help you expand your cultural horizons.';
    if (geminiResponse.data?.response) {
      onboardingReport = geminiResponse.data.response;
    }

    // 3. Generate initial discomfort recommendations using Qloo's antitheses
    const antithesesResponse = await supabase.functions.invoke('qloo-api', {
      body: {
        endpoint: 'recipes/antitheses',
        method: 'POST',
        body: {
          preferences: preferences,
          domains: ['film', 'music', 'books', 'food', 'fashion'],
          intensity: 0.7 // Medium discomfort level to start
        }
      }
    });

    console.log('Qloo antitheses response:', antithesesResponse);

    let discomfortItems = [];
    if (antithesesResponse.data?.recommendations) {
      discomfortItems = antithesesResponse.data.recommendations;
    }

    // 4. Save taste graph data to Supabase for trend analysis
    if (tasteGraph && Object.keys(tasteGraph).length > 0) {
      const { error: saveError } = await supabase
        .from('user_profiles')
        .update({
          taste_preferences: {
            ...preferences,
            taste_graph: tasteGraph,
            onboarding_analysis: onboardingReport,
            last_analyzed: new Date().toISOString()
          }
        })
        .eq('user_id', userId);

      if (saveError) {
        console.error('Error saving taste graph:', saveError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tasteGraph,
        onboardingReport,
        discomfortItems,
        message: 'Taste journey started successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error starting taste journey:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to start taste journey', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function generateProgressivePath(supabase: any, userId: string, domain: string, currentTaste: string, targetTaste: string) {
  console.log('Generating progressive path:', { domain, currentTaste, targetTaste });

  try {
    // Use Qloo's cross-domain affinity to build bridge content
    const bridgeResponse = await supabase.functions.invoke('qloo-api', {
      body: {
        endpoint: 'cross-domain-affinity',
        method: 'GET',
        params: {
          from: currentTaste,
          to: targetTaste,
          domain: domain,
          steps: 4 // Create a 4-step progression
        }
      }
    });

    console.log('Qloo bridge response:', bridgeResponse);

    let progressivePath = [];
    if (bridgeResponse.data?.path) {
      progressivePath = bridgeResponse.data.path;
    } else {
      // Fallback: create a mock progressive path
      progressivePath = [
        { title: currentTaste, difficulty: 1, description: 'Your comfort zone' },
        { title: 'Bridge Content 1', difficulty: 2, description: 'Gentle introduction to new elements' },
        { title: 'Bridge Content 2', difficulty: 3, description: 'Moderate challenge with familiar elements' },
        { title: targetTaste, difficulty: 4, description: 'Your growth target' }
      ];
    }

    // Enhance each step with Gemini-generated descriptions
    for (let i = 0; i < progressivePath.length; i++) {
      const step = progressivePath[i];
      
      const descriptionResponse = await supabase.functions.invoke('gemini-api', {
        body: {
          prompt: `Create a compelling description and cultural context for "${step.title}" as step ${i + 1} of 4 in a ${domain} journey from "${currentTaste}" to "${targetTaste}". Explain why this step is important for cultural growth.`,
          type: 'explanation',
          domain: domain
        }
      });

      if (descriptionResponse.data?.response) {
        progressivePath[i].culturalContext = descriptionResponse.data.response;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        progressivePath,
        domain,
        journey: `${currentTaste} → ${targetTaste}`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating progressive path:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate progressive path', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}

async function createFiveDayPlan(supabase: any, userId: string, preferences: any, domain?: string) {
  console.log('Creating 5-day taste plan for user:', userId);

  try {
    // Get cross-domain affinity data from Qloo
    const crossDomainResponse = await supabase.functions.invoke('qloo-api', {
      body: {
        endpoint: 'cross-domain-affinity',
        method: 'GET',
        params: {
          preferences: JSON.stringify(preferences),
          target_domain: domain || 'all',
          timeframe: '5_days'
        }
      }
    });

    let crossDomainData = {};
    if (crossDomainResponse.data) {
      crossDomainData = crossDomainResponse.data;
    }

    // Generate 5-day plan using Gemini
    const planResponse = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt: `Create a structured 5-day cultural expansion plan. Each day should include:
        - One primary challenge in ${domain || 'any domain'}
        - Learning objective for the day
        - Reflection prompt
        - Connection to previous day's experience
        - Estimated time commitment
        
        Make it engaging, progressive, and achievable. Focus on building cultural confidence through manageable discomfort.`,
        type: 'curriculum',
        domain: domain,
        preferences: preferences,
        context: `Cross-domain affinity data: ${JSON.stringify(crossDomainData)}`
      }
    });

    let fiveDayPlan = {
      title: '5-Day Cultural Expansion Journey',
      domain: domain || 'Multi-domain',
      days: []
    };

    if (planResponse.data?.response) {
      // Parse the Gemini response to extract structured plan
      fiveDayPlan.description = planResponse.data.response;
      
      // Create structured daily entries (simplified for demo)
      const domains = ['film', 'music', 'books', 'food', 'fashion'];
      for (let i = 1; i <= 5; i++) {
        fiveDayPlan.days.push({
          day: i,
          domain: domain || domains[(i - 1) % domains.length],
          title: `Day ${i}: Expand Your ${domain || domains[(i - 1) % domains.length]} Horizons`,
          challenge: `Challenge for day ${i}`,
          timeCommitment: '30-60 minutes',
          reflectionPrompt: `How did today's experience change your perspective?`
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fiveDayPlan,
        crossDomainConnections: crossDomainData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error creating 5-day plan:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create 5-day plan', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}