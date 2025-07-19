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
        auth: { persistSession: false },
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
    // 1. Try to get insights from Qloo API
    const insightsResponse = await supabase.functions.invoke('qloo-api', {
      body: {
        endpoint: 'insights',
        method: 'POST',
        body: {
          filter: {
            type: 'urn:entity:movie',
            limit: 5
          },
          signal: {
            interests: {
              tags: ['popular', 'trending']
            }
          }
        }
      }
    });

    console.log('Qloo insights response:', insightsResponse);

    let tasteGraph = {};
    if (insightsResponse.data && !insightsResponse.error) {
      tasteGraph = {
        insights: insightsResponse.data,
        generated_at: new Date().toISOString()
      };
    }

    // 2. Generate onboarding analysis with Gemini
    const geminiResponse = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt: `Analyze this user's taste preferences and create a comprehensive cultural profile. Identify comfort zones, potential growth areas, and recommend 3 discomfort challenges for immediate exploration.

User preferences: ${JSON.stringify(preferences)}

Please provide:
1. A summary of their current taste profile
2. Identified comfort zones
3. Recommended growth areas
4. 3 specific discomfort challenges they should try`,
        type: 'onboarding',
        preferences: preferences
      }
    });

    console.log('Gemini onboarding analysis completed');

    let onboardingReport = 'Welcome to your taste journey! Based on your preferences, we\'ve identified several exciting opportunities for cultural expansion. Your journey will be personalized to gradually introduce new experiences that challenge your current tastes while building on what you already enjoy.';
    
    if (geminiResponse.data?.response) {
      onboardingReport = geminiResponse.data.response;
    }

    // 3. Generate initial discomfort recommendations
    const recommendationsResponse = await supabase.functions.invoke('generate-recommendations', {
      body: {
        userId: userId,
        preferences: preferences,
        domain: 'film', // Start with film recommendations
        difficulty: 3
      }
    });

    let discomfortItems = [];
    if (recommendationsResponse.data?.recommendations) {
      discomfortItems = recommendationsResponse.data.recommendations.slice(0, 3);
    }

    // 4. Save taste graph data to Supabase
    const { error: saveError } = await supabase
      .from('user_profiles')
      .update({
        taste_preferences: {
          ...preferences,
          taste_graph: tasteGraph,
          onboarding_analysis: onboardingReport,
          last_analyzed: new Date().toISOString()
        },
        onboarding_completed: true
      })
      .eq('user_id', userId);

    if (saveError) {
      console.error('Error saving taste graph:', saveError);
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
    // Create a progressive path using AI
    const pathResponse = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt: `Create a 4-step progressive learning path in ${domain} from "${currentTaste}" to "${targetTaste}".

For each step, provide:
- Title (specific recommendation)
- Difficulty level (1-5)
- Description (why this step is important)
- Cultural context (background information)

Make each step a logical bridge that builds on the previous one. The progression should feel natural and achievable.

Format as a JSON array with objects containing: title, difficulty, description, culturalContext`,
        type: 'curriculum',
        domain: domain
      }
    });

    let progressivePath = [];
    
    if (pathResponse.data?.response) {
      try {
        // Try to parse JSON from the response
        const jsonMatch = pathResponse.data.response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          progressivePath = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Could not parse JSON from Gemini response, creating fallback path');
      }
    }

    // Fallback: create a structured progressive path
    if (progressivePath.length === 0) {
      const pathTemplates: Record<string, any[]> = {
        film: [
          { title: currentTaste, difficulty: 1, description: 'Your comfort zone - familiar and enjoyable' },
          { title: 'Critically Acclaimed Blockbusters', difficulty: 2, description: 'Popular films with deeper themes' },
          { title: 'International Cinema', difficulty: 3, description: 'Foreign films with subtitles' },
          { title: targetTaste, difficulty: 4, description: 'Your growth target - challenging but rewarding' }
        ],
        music: [
          { title: currentTaste, difficulty: 1, description: 'Your current musical preferences' },
          { title: 'Genre Fusion', difficulty: 2, description: 'Blends of familiar and new styles' },
          { title: 'Instrumental Exploration', difficulty: 3, description: 'Focus on composition over vocals' },
          { title: targetTaste, difficulty: 4, description: 'Advanced musical complexity' }
        ],
        books: [
          { title: currentTaste, difficulty: 1, description: 'Your preferred reading style' },
          { title: 'Literary Fiction', difficulty: 2, description: 'Character-driven narratives' },
          { title: 'Experimental Narratives', difficulty: 3, description: 'Unconventional storytelling' },
          { title: targetTaste, difficulty: 4, description: 'Complex literary works' }
        ],
        food: [
          { title: currentTaste, difficulty: 1, description: 'Your culinary comfort zone' },
          { title: 'Fusion Cuisine', difficulty: 2, description: 'Familiar flavors with new techniques' },
          { title: 'Regional Specialties', difficulty: 3, description: 'Authentic cultural dishes' },
          { title: targetTaste, difficulty: 4, description: 'Challenging flavor profiles' }
        ],
        fashion: [
          { title: currentTaste, difficulty: 1, description: 'Your current style preferences' },
          { title: 'Contemporary Trends', difficulty: 2, description: 'Modern interpretations of classic styles' },
          { title: 'Cultural Fashion', difficulty: 3, description: 'Traditional garments from other cultures' },
          { title: targetTaste, difficulty: 4, description: 'Avant-garde and experimental fashion' }
        ]
      };

      progressivePath = pathTemplates[domain] || pathTemplates.film;
    }

    // Enhance each step with cultural context if not already present
    for (let i = 0; i < progressivePath.length; i++) {
      if (!progressivePath[i].culturalContext) {
        progressivePath[i].culturalContext = `Step ${i + 1} in your ${domain} journey: Building cultural awareness through gradual exposure to new experiences.`;
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
    // Generate 5-day plan using Gemini
    const planResponse = await supabase.functions.invoke('gemini-api', {
      body: {
        prompt: `Create a structured 5-day cultural expansion plan focusing on ${domain || 'multiple domains'}.

Each day should include:
- Day number and theme
- One primary challenge/activity
- Learning objective
- Time commitment (realistic)
- Reflection prompt
- Connection to overall growth

Make it engaging, progressive, and achievable. Focus on building cultural confidence through manageable discomfort.

User preferences: ${JSON.stringify(preferences)}`,
        type: 'curriculum',
        domain: domain,
        preferences: preferences
      }
    });

    let fiveDayPlan = {
      title: `5-Day ${domain || 'Multi-Domain'} Cultural Expansion Journey`,
      domain: domain || 'Multi-domain',
      description: 'A carefully crafted journey to expand your cultural horizons',
      days: []
    };

    if (planResponse.data?.response) {
      fiveDayPlan.description = planResponse.data.response;
    }

    // Create structured daily entries
    const domains = ['film', 'music', 'books', 'food', 'fashion'];
    const themes = [
      'Foundation Building',
      'Comfort Zone Expansion', 
      'Cultural Bridge',
      'Deep Dive',
      'Integration & Reflection'
    ];

    for (let i = 1; i <= 5; i++) {
      const dayDomain = domain || domains[(i - 1) % domains.length];
      fiveDayPlan.days.push({
        day: i,
        theme: themes[i - 1],
        domain: dayDomain,
        title: `Day ${i}: ${themes[i - 1]} in ${dayDomain.charAt(0).toUpperCase() + dayDomain.slice(1)}`,
        challenge: `Explore a ${dayDomain} recommendation that challenges your current preferences`,
        timeCommitment: '30-60 minutes',
        learningObjective: `Build comfort with unfamiliar ${dayDomain} experiences`,
        reflectionPrompt: `How did today's ${dayDomain} experience change your perspective? What surprised you?`,
        connectionToGrowth: `This step builds your cultural confidence and openness to new experiences`
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        fiveDayPlan
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