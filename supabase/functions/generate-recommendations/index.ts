import { createClient } from 'npm:@supabase/supabase-js@2.38.4';

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

// Helper function to sanitize metadata for JSON serialization
function sanitizeMetadata(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeMetadata(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      try {
        sanitized[key] = sanitizeMetadata(value);
      } catch (error) {
        // Skip non-serializable properties
        console.warn(`Skipping non-serializable property: ${key}`);
      }
    }
    return sanitized;
  }
  
  // Skip functions, symbols, and other non-serializable types
  return null;
}

// Helper function to get valid tags from Qloo
async function getValidTags(supabaseClient: any, domain: string) {
  try {
    const { data, error } = await supabaseClient.functions.invoke('qloo-api', {
      body: {
        endpoint: 'v2/tags',
        method: 'GET',
        params: {
          limit: 10
        }
      }
    });

    if (error || !data?.data) {
      console.log('Using fallback tags for domain:', domain);
      return [];
    }

    // Only return tags that have valid IDs
    return data.data
      .filter((tag: any) => tag.id && typeof tag.id === 'string')
      .map((tag: any) => tag.id)
      .slice(0, 5);
  } catch (error) {
    console.error('Error getting tags:', error);
    return [];
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
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

    const requestBody = await req.json();
    const { preferences, domain, difficulty = 3 } = requestBody as RecommendationRequest;

    console.log('Generating recommendations for:', { domain, difficulty, preferences });

    // Map domain to Qloo entity type
    const entityTypeMap: Record<string, string> = {
      film: 'urn:entity:movie',
      music: 'urn:entity:artist',
      books: 'urn:entity:book',
      food: 'urn:entity:brand',
      fashion: 'urn:entity:brand'
    };

    const entityType = entityTypeMap[domain] || 'urn:entity:movie';

    // Get valid tags for the domain
    const validTags = await getValidTags(supabaseClient, domain);
    console.log('Using tags:', validTags);

    let recommendations = [];

    // Try to get recommendations from Qloo API
    if (validTags.length > 0) {
      try {
        const qlooResponse = await supabaseClient.functions.invoke('qloo-api', {
          body: {
            endpoint: 'insights',
            method: 'POST',
            body: {
              filter: {
                type: entityType,
                limit: 10
              },
              signal: {
                interests: {
                  tags: validTags
                }
              }
            }
          }
        });

        if (!qlooResponse.error && qlooResponse.data?.data && Array.isArray(qlooResponse.data.data)) {
          recommendations = qlooResponse.data.data.slice(0, 5).map((item: any, index: number) => ({
            domain: domain === 'all' ? 'film' : domain,
            title: item.name || item.title || `${domain} Recommendation ${index + 1}`,
            description: item.description || `A curated ${domain} recommendation from our cultural database`,
            difficulty: Math.max(1, Math.min(5, difficulty + Math.floor(Math.random() * 3) - 1)),
            image_url: item.image_url || getDefaultImage(domain),
            reason: generateReason(domain, preferences),
            cultural_context: item.cultural_context || `Contemporary ${domain} exploration`,
            metadata: sanitizeMetadata({
              qloo_id: item.id,
              generated_at: new Date().toISOString(),
              source: 'qloo_api',
              name: item.name,
              description: item.description,
              image_url: item.image_url
            })
          }));
          console.log('Successfully generated recommendations from Qloo API');
        } else {
          console.log('Qloo API returned unexpected format, using fallback');
          recommendations = await createFallbackRecommendations(domain, difficulty, preferences);
        }
      } catch (error) {
        console.error('Error calling Qloo API:', error);
        recommendations = await createFallbackRecommendations(domain, difficulty, preferences);
      }
    } else {
      console.log('No valid tags found, using fallback recommendations');
      recommendations = await createFallbackRecommendations(domain, difficulty, preferences);
    }

    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
      recommendations = await createFallbackRecommendations(domain, difficulty, preferences);
    }

    // Adjust difficulty based on user preference
    const adjustedRecommendations = recommendations.map(rec => ({
      ...rec,
      difficulty: Math.max(1, Math.min(5, rec.difficulty + (difficulty - 3)))
    }));

    // Store recommendations in database with proper error handling
    try {
      const { data: savedRecommendations, error: saveError } = await supabaseClient
        .from('content_recommendations')
        .upsert(
          adjustedRecommendations.map(rec => ({
            user_id: user.id,
            external_id: rec.metadata?.qloo_id || `fallback_${rec.domain}_${Date.now()}_${Math.random()}`,
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
          JSON.stringify({ error: 'Failed to save recommendations', details: saveError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(`Successfully generated and saved ${savedRecommendations?.length || 0} recommendations`);

      return new Response(
        JSON.stringify({ 
          recommendations: savedRecommendations,
          message: 'Recommendations generated successfully',
          source: validTags.length > 0 ? 'qloo_api' : 'fallback'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in generate-recommendations:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Helper functions
function getDefaultImage(domain: string): string {
  const images: Record<string, string> = {
    film: 'https://images.unsplash.com/photo-1489599651372-014db5c0d3d2?w=400',
    music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    books: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    food: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    fashion: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'
  };
  return images[domain] || images.film;
}

function generateReason(domain: string, preferences: any): string {
  const reasons: Record<string, string> = {
    film: 'Based on your viewing preferences, this film will challenge your narrative expectations while maintaining visual appeal.',
    music: 'This musical selection expands your sonic palette by introducing new rhythmic and harmonic elements.',
    books: 'This literary work bridges familiar themes with new storytelling approaches to broaden your reading horizons.',
    food: 'This culinary experience introduces new flavors and textures that complement your existing taste preferences.',
    fashion: 'This style choice pushes your aesthetic boundaries while remaining wearable and expressive.'
  };
  return reasons[domain] || 'This recommendation is designed to expand your cultural comfort zone in meaningful ways.';
}

async function createFallbackRecommendations(domain: string, difficulty: number, preferences: any) {
  const fallbackData: Record<string, any[]> = {
    film: [
      {
        title: 'The Tree of Life',
        description: 'Terrence Malick\'s experimental meditation on existence',
        cultural_context: 'American experimental cinema'
      },
      {
        title: 'Persona',
        description: 'Ingmar Bergman\'s psychological masterpiece',
        cultural_context: 'Swedish art cinema'
      },
      {
        title: 'Chungking Express',
        description: 'Wong Kar-wai\'s vibrant Hong Kong romance',
        cultural_context: 'Hong Kong New Wave'
      }
    ],
    music: [
      {
        title: 'Aphex Twin - Selected Ambient Works',
        description: 'Pioneering electronic ambient compositions',
        cultural_context: 'British electronic avant-garde'
      },
      {
        title: 'Godspeed You! Black Emperor - F#A#∞',
        description: 'Post-rock orchestral soundscapes',
        cultural_context: 'Canadian post-rock movement'
      },
      {
        title: 'Alice Coltrane - Journey in Satchidananda',
        description: 'Spiritual jazz with Eastern influences',
        cultural_context: 'American spiritual jazz'
      }
    ],
    books: [
      {
        title: 'If on a winter\'s night a traveler',
        description: 'Italo Calvino\'s metafictional masterpiece',
        cultural_context: 'Italian postmodern literature'
      },
      {
        title: 'The Left Hand of Darkness',
        description: 'Ursula K. Le Guin\'s gender-bending sci-fi',
        cultural_context: 'American speculative fiction'
      },
      {
        title: 'Blindness',
        description: 'José Saramago\'s allegorical novel',
        cultural_context: 'Portuguese magical realism'
      }
    ],
    food: [
      {
        title: 'Natto (Fermented Soybeans)',
        description: 'Traditional Japanese breakfast with unique texture',
        cultural_context: 'Japanese traditional cuisine'
      },
      {
        title: 'Durian Fruit',
        description: 'Southeast Asian fruit with complex flavor profile',
        cultural_context: 'Southeast Asian tropical cuisine'
      },
      {
        title: 'Hákarl (Fermented Shark)',
        description: 'Traditional Icelandic delicacy',
        cultural_context: 'Nordic preservation traditions'
      }
    ],
    fashion: [
      {
        title: 'Avant-Garde Asymmetrical Jacket',
        description: 'Rei Kawakubo-inspired deconstructed silhouette',
        cultural_context: 'Japanese conceptual fashion'
      },
      {
        title: 'Traditional Hanbok with Modern Twist',
        description: 'Korean traditional dress reimagined for contemporary wear',
        cultural_context: 'Korean fashion fusion'
      },
      {
        title: 'Sustainable Hemp Clothing',
        description: 'Eco-conscious fashion with natural textures',
        cultural_context: 'Sustainable fashion movement'
      }
    ]
  };

  const domainData = fallbackData[domain] || fallbackData.film;
  
  return domainData.map((item, index) => ({
    domain,
    title: item.title,
    description: item.description,
    difficulty: Math.max(1, Math.min(5, difficulty + index)),
    image_url: getDefaultImage(domain),
    reason: generateReason(domain, preferences),
    cultural_context: item.cultural_context,
    metadata: sanitizeMetadata({
      source: 'fallback',
      generated_at: new Date().toISOString(),
      index
    })
  }));
}