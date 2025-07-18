import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QlooRequest {
  endpoint: 'affinity-cluster' | 'recipes/antitheses' | 'cross-domain-affinity';
  method: 'GET' | 'POST';
  params?: Record<string, any>;
  body?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const qlooApiKey = Deno.env.get('QLOO_API_KEY');
    if (!qlooApiKey) {
      throw new Error('QLOO_API_KEY not configured');
    }

    // Initialize Supabase client for auth
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
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

    const { endpoint, method, params, body } = await req.json() as QlooRequest;

    console.log('Qloo API request:', { endpoint, method, params, body });

    // Construct Qloo API URL
    const baseUrl = 'https://api.qloo.com/v1';
    let qlooUrl = `${baseUrl}/${endpoint}`;

    // Add query parameters for GET requests
    if (method === 'GET' && params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      if (searchParams.toString()) {
        qlooUrl += `?${searchParams.toString()}`;
      }
    }

    console.log('Calling Qloo API:', qlooUrl);

    // Make request to Qloo API
    const qlooResponse = await fetch(qlooUrl, {
      method,
      headers: {
        'Authorization': `Bearer ${qlooApiKey}`,
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(body) : undefined,
    });

    const qlooData = await qlooResponse.json();

    if (!qlooResponse.ok) {
      console.error('Qloo API error:', qlooData);
      return new Response(
        JSON.stringify({ 
          error: 'Qloo API error', 
          details: qlooData,
          status: qlooResponse.status 
        }),
        {
          status: qlooResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Qloo API response received:', qlooData);

    return new Response(
      JSON.stringify(qlooData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in qloo-api function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});