import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  userId: string;
  preferences: any;
  domain: string;
  difficulty?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    console.log('Attempting to get user from JWT...');

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    console.log('User retrieval result:', { 
      hasUser: !!user, 
      userId: user?.id, 
      error: userError?.message 
    });

    if (userError || !user) {
      console.error('Authentication failed:', userError);
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized', 
          details: userError?.message || 'No user found' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { preferences, domain, difficulty = 3 } = await req.json() as RecommendationRequest;

    console.log('Generating recommendations for:', { domain, difficulty, preferences });

    // Call Qloo API to get insights
    const qlooResponse = await supabaseClient.functions.invoke('qloo-api', {
      body: {
        endpoint: 'insights',
        method: 'POST',
        body: {
          filter: {
            type: domain === 'film' ? 'urn:entity:movie' : 
                  domain === 'music' ? 'urn:entity:artist' :
                  domain === 'books' ? 'urn:entity:book' :
                  domain === 'food' ? 'urn:entity:brand' :
                  'urn:entity:movie', // default
            limit: 10
          },
          signal: {
            interests: {
              tags: preferences.tags || []
            }
          }
        }
      }
    });

    let recommendations = [];

    if (qlooResponse.error) {
      console.error('Qloo API error:', qlooResponse.error);
      // Fall back to mock data if Qloo API fails
      recommendations = [
        {
          domain: domain === 'all' ? 'film' : domain,
          title: 'Cultural Discovery',
          description: 'A thoughtfully curated recommendation based on your preferences',
          difficulty: difficulty,
          image_url: 'https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400',
          reason: 'This recommendation challenges your current tastes while providing a gateway to new cultural experiences.',
          cultural_context: 'Cross-cultural exploration',
          metadata: {
            source: 'fallback',
            generated_at: new Date().toISOString()
          }
        }
      ];
    } else {
      // Transform Qloo API response into our recommendation format
      const qlooData = qlooResponse.data;
      console.log('Qloo API response:', qlooData);
      
      if (qlooData.data && Array.isArray(qlooData.data)) {
        recommendations = qlooData.data.slice(0, 5).map((item: any, index: number) => ({
          domain: domain === 'all' ? 'film' : domain,
          title: item.name || item.title || `Recommendation ${index + 1}`,
          description: item.description || 'A cultural recommendation from Qloo API',
          difficulty: Math.max(1, Math.min(5, difficulty + Math.floor(Math.random() * 3) - 1)),
          image_url: item.image_url || 'https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400',
          reason: `Based on your preferences, this ${domain} recommendation offers a perfect balance of familiarity and cultural expansion.`,
          cultural_context: item.cultural_context || 'Contemporary cultural exploration',
          metadata: {
            qloo_id: item.id,
            generated_at: new Date().toISOString(),
            ...item
          }
        }));
      } else {
        // Fallback if response structure is unexpected
        recommendations = [
          {
            domain: domain === 'all' ? 'film' : domain,
            title: 'Cultural Discovery',
            description: 'A thoughtfully curated recommendation',
            difficulty: difficulty,
            image_url: 'https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400',
            reason: 'This recommendation challenges your current tastes while providing a gateway to new cultural experiences.',
            cultural_context: 'Cross-cultural exploration',
            metadata: {
              source: 'qloo_processed',
              generated_at: new Date().toISOString()
            }
          }
        ];
      }
    }

    // Filter recommendations by domain if specified (already filtered in Qloo API call)
    let filteredRecommendations = recommendations;
    if (domain && domain !== 'all') {
      filteredRecommendations = recommendations.filter(rec => rec.domain === domain);
    }

    // Generate AI-powered difficulty adjustment based on user preferences
    const adjustedRecommendations = filteredRecommendations.map(rec => ({
      ...rec,
      difficulty: Math.max(1, Math.min(5, rec.difficulty + (difficulty - 3)))
    }));

    // Store recommendations in database
    const { data: savedRecommendations, error: saveError } = await supabaseClient
      .from('content_recommendations')
      .upsert(
        adjustedRecommendations.map(rec => ({
          user_id: user.id,
          external_id: `mock_${rec.domain}_${Date.now()}`,
          domain: rec.domain,
          title: rec.title,
          description: rec.description,
          difficulty: rec.difficulty,
          image_url: rec.image_url,
          reason: rec.reason,
          cultural_context: rec.cultural_context,
          metadata: rec.metadata
        })),
        { onConflict: 'user_id,external_id' }
      )
      .select();

    if (saveError) {
      console.error('Error saving recommendations:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save recommendations' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        recommendations: savedRecommendations,
        message: 'Recommendations generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});