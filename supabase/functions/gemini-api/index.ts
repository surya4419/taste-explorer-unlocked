import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeminiRequest {
  prompt: string;
  context?: string;
  type: 'onboarding' | 'explanation' | 'curriculum' | 'growth-report';
  domain?: string;
  preferences?: any;
  progressData?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    // Initialize Supabase client for auth
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

    // Verify user authentication
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

    const { prompt, context, type, domain, preferences, progressData } = await req.json() as GeminiRequest;

    console.log('Gemini API request:', { type, domain, prompt: prompt.substring(0, 100) + '...' });

    // Build context-aware prompt based on type
    let systemPrompt = '';
    let userPrompt = prompt;

    switch (type) {
      case 'onboarding':
        systemPrompt = `You are a cultural mentor specializing in taste analysis. Analyze user preferences with emotional intelligence and create personalized discomfort challenges. Focus on tone, emotional patterns, and cultural comfort zones. Be insightful but not overwhelming.`;
        break;
        
      case 'explanation':
        systemPrompt = `You are a cultural educator. Explain why experiencing discomfort in ${domain || 'cultural'} domains is valuable for growth. Use simple, engaging language. Connect the unfamiliar to familiar experiences. Be encouraging and curious, not preachy.`;
        break;
        
      case 'curriculum':
        systemPrompt = `You are a curriculum designer for cultural expansion. Create progressive learning paths that bridge familiar tastes to challenging ones. Design 5-day taste plans using cross-domain connections. Focus on gradual discomfort escalation and clear learning objectives.`;
        break;
        
      case 'growth-report':
        systemPrompt = `You are a growth analyst. Review user progress data and provide insights about cultural expansion patterns. Identify breakthroughs, suggest next challenges, and celebrate meaningful progress. Be specific and actionable.`;
        break;
    }

    // Add context if provided
    if (context) {
      userPrompt = `Context: ${context}\n\nRequest: ${prompt}`;
    }

    // Add preferences and progress data if available
    if (preferences) {
      userPrompt += `\n\nUser Preferences: ${JSON.stringify(preferences)}`;
    }

    if (progressData) {
      userPrompt += `\n\nProgress Data: ${JSON.stringify(progressData)}`;
    }

    console.log('Calling Gemini API with system prompt:', systemPrompt.substring(0, 100) + '...');

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\n${userPrompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const geminiData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiData);
      return new Response(
        JSON.stringify({ 
          error: 'Gemini API error', 
          details: geminiData,
          status: geminiResponse.status 
        }),
        {
          status: geminiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Gemini API response received');

    // Extract the generated text
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';

    return new Response(
      JSON.stringify({ 
        response: generatedText,
        type,
        domain,
        fullResponse: geminiData 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in gemini-api function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});