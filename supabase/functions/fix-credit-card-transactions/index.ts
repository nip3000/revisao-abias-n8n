import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se o usuário é admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validar token do usuário
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token)
    
    if (userError || !userData.user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabaseClient
      .rpc('is_admin', { user_id: userData.user.id })

    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'GET') {
      // Consultar status - quantas transações precisam ser corrigidas
      const { data: problematicTransactions, error: queryError } = await supabaseClient
        .from('poupeja_transactions')
        .select(`
          id,
          description,
          amount,
          date,
          credit_card_id,
          credit_cards!inner(name, user_id)
        `)
        .eq('type', 'expense')
        .not('credit_card_id', 'is', null)

      if (queryError) {
        console.error('Error querying problematic transactions:', queryError)
        return new Response(
          JSON.stringify({ error: 'Failed to query transactions', details: queryError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Filtrar apenas as que não têm compra correspondente
      const transactionsToFix = []
      for (const transaction of problematicTransactions || []) {
        const { data: existingPurchase } = await supabaseClient
          .from('credit_card_purchases')
          .select('id')
          .eq('transaction_id', transaction.id)
          .single()

        if (!existingPurchase) {
          transactionsToFix.push(transaction)
        }
      }

      return new Response(
        JSON.stringify({ 
          transactions_to_fix: transactionsToFix.length,
          transactions: transactionsToFix
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { action } = await req.json()

      if (action === 'fix') {
        console.log('Starting credit card transactions fix...')
        
        // Executar a função de correção
        const { data, error } = await supabaseClient
          .rpc('fix_credit_card_transactions')

        if (error) {
          console.error('Error executing fix function:', error)
          return new Response(
            JSON.stringify({ error: 'Failed to execute fix', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        console.log('Fix completed:', data)

        return new Response(
          JSON.stringify({ 
            success: true,
            result: data?.[0] || { fixed_transactions: 0, created_purchases: 0, errors: [] }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})