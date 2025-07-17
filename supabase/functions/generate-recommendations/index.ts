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

    const { preferences, domain, difficulty = 3 } = await req.json() as RecommendationRequest;

    // Mock recommendation generation (in real implementation, you'd call Qloo API or other services)
    const mockRecommendations = [
      {
        domain: 'film',
        title: 'Stalker (1979)',
        description: 'Andrei Tarkovsky\'s philosophical science fiction meditation',
        difficulty: 5,
        image_url: 'https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400',
        reason: 'Your enjoyment of mainstream cinema makes this slow-burn Soviet masterpiece a perfect challenge for developing patience with contemplative storytelling.',
        cultural_context: 'Soviet philosophical cinema',
        metadata: {
          director: 'Andrei Tarkovsky',
          year: 1979,
          genre: 'Sci-Fi/Art Film',
          runtime: '163 min'
        }
      },
      {
        domain: 'music',
        title: 'Gamelan Degung',
        description: 'Traditional Indonesian court music ensemble',
        difficulty: 4,
        image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
        reason: 'Given your Western pop preferences, this Indonesian traditional music will introduce you to non-Western scales and communal music-making concepts.',
        cultural_context: 'Indonesian traditional music',
        metadata: {
          origin: 'West Java, Indonesia',
          instruments: 'Bronze metallophones, gongs, drums',
          scale: 'Pelog and Slendro'
        }
      },
      {
        domain: 'food',
        title: 'Hákarl (Fermented Shark)',
        description: 'Traditional Icelandic fermented shark delicacy',
        difficulty: 5,
        image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
        reason: 'Your comfort with familiar flavors makes this intensely unique Icelandic tradition the ultimate test of culinary openness.',
        cultural_context: 'Traditional Icelandic cuisine',
        metadata: {
          preparation: 'Buried for 4-5 months, then hung for 4-5 months',
          origin: 'Iceland',
          significance: 'Survival food turned cultural identity'
        }
      },
      {
        domain: 'books',
        title: 'Finnegans Wake',
        description: 'James Joyce\'s experimental stream-of-consciousness novel',
        difficulty: 5,
        image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
        reason: 'Your preference for straightforward narratives makes Joyce\'s linguistic playground a transformative challenge in reading comprehension.',
        cultural_context: 'Irish literary modernism',
        metadata: {
          author: 'James Joyce',
          published: 1939,
          pages: 628,
          languages: 'Multiple (dream language)'
        }
      },
      {
        domain: 'fashion',
        title: 'Comme des Garçons Deconstructed Coat',
        description: 'Rei Kawakubo\'s avant-garde architectural fashion',
        difficulty: 4,
        image_url: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400',
        reason: 'Your conventional style choices make this radical deconstruction of clothing norms a perfect entry into conceptual fashion.',
        cultural_context: 'Japanese avant-garde fashion',
        metadata: {
          designer: 'Rei Kawakubo',
          movement: 'Deconstructivism',
          philosophy: 'Anti-fashion, conceptual design'
        }
      }
    ];

    // Filter recommendations by domain if specified
    let filteredRecommendations = mockRecommendations;
    if (domain && domain !== 'all') {
      filteredRecommendations = mockRecommendations.filter(rec => rec.domain === domain);
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