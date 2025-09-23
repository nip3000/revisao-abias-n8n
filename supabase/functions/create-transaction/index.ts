import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TransactionRequest {
  type: 'income' | 'expense';
  amount: number;
  category_id?: string;
  category?: string;
  description?: string;
  date: string;
  goal_id?: string;
  account_id?: string;
  credit_card_id?: string;
  user_id: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const transactionData: TransactionRequest = await req.json();
    
    console.log('n8n transaction request:', transactionData);

    // Validate required fields
    if (!transactionData.user_id || !transactionData.type || !transactionData.amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, type, amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If this is an expense with credit_card_id, create a credit card purchase
    if (transactionData.type === 'expense' && transactionData.credit_card_id) {
      console.log('Creating credit card purchase for n8n transaction');
      
      // Validate that the credit card belongs to the user
      const { data: creditCard, error: cardError } = await supabase
        .from('credit_cards')
        .select('id, user_id')
        .eq('id', transactionData.credit_card_id)
        .eq('user_id', transactionData.user_id)
        .single();

      if (cardError || !creditCard) {
        console.error('Credit card validation error:', cardError);
        return new Response(
          JSON.stringify({ error: 'Invalid credit card or access denied' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Create credit card purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('credit_card_purchases')
        .insert({
          card_id: transactionData.credit_card_id,
          description: transactionData.description || 'Compra via n8n',
          amount: transactionData.amount,
          purchase_date: transactionData.date.split('T')[0],
          installments: 1,
          installment_amount: transactionData.amount,
          is_installment: false,
          category_id: transactionData.category_id
        })
        .select()
        .single();

      if (purchaseError) {
        console.error('Error creating credit card purchase:', purchaseError);
        return new Response(
          JSON.stringify({ error: 'Failed to create credit card purchase', details: purchaseError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Generate bills for the credit card
      const { error: billError } = await supabase.rpc('auto_generate_credit_card_bills', {
        card_id_param: transactionData.credit_card_id
      });

      if (billError) {
        console.error('Error generating credit card bills:', billError);
        // Don't fail the request, just log the error
      }

      console.log('Credit card purchase created successfully:', purchase.id);
      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'credit_card_purchase',
          purchase_id: purchase.id,
          message: 'Credit card purchase created successfully' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For regular transactions (income or expense without credit card)
    console.log('Creating regular transaction for n8n');

    // Get or validate category
    let categoryId = transactionData.category_id;
    
    if (!categoryId && transactionData.category) {
      // Try to find category by name
      const { data: categoryByName } = await supabase
        .from('poupeja_categories')
        .select('id')
        .eq('name', transactionData.category)
        .eq('type', transactionData.type)
        .eq('user_id', transactionData.user_id)
        .single();
      
      if (categoryByName) {
        categoryId = categoryByName.id;
      }
    }

    if (!categoryId) {
      // Fallback to "Outros" category
      const { data: defaultCategory } = await supabase
        .from('poupeja_categories')
        .select('id')
        .eq('name', 'Outros')
        .eq('type', transactionData.type)
        .eq('user_id', transactionData.user_id)
        .single();
      
      if (defaultCategory) {
        categoryId = defaultCategory.id;
      } else {
        return new Response(
          JSON.stringify({ error: `No valid category found for ${transactionData.type}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Create the transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('poupeja_transactions')
      .insert({
        type: transactionData.type,
        amount: transactionData.amount,
        category_id: categoryId,
        description: transactionData.description || '',
        date: transactionData.date,
        goal_id: transactionData.goal_id || null,
        account_id: transactionData.account_id || null,
        user_id: transactionData.user_id
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create transaction', details: transactionError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If this is an income transaction linked to a goal, update the goal's current amount
    if (transactionData.type === 'income' && transactionData.goal_id) {
      console.log('Updating goal current amount for income transaction');
      const { error: goalError } = await supabase.rpc('update_goal_amount', {
        p_goal_id: transactionData.goal_id,
        p_amount_change: transactionData.amount
      });
      
      if (goalError) {
        console.error('Error updating goal amount:', goalError);
        // Don't fail the request, just log the error
      }
    }

    console.log('Transaction created successfully:', transaction.id);
    return new Response(
      JSON.stringify({ 
        success: true, 
        type: 'transaction',
        transaction_id: transaction.id,
        message: 'Transaction created successfully' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in create-transaction function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});