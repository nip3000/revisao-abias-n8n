import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log("n8n transaction request:", requestData);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract and validate required fields
    const {
      type,
      amount,
      description,
      date,
      category_id,
      user_id,
      account_id,
      credit_card_id
    } = requestData;

    // Validate required fields
    if (!type || !amount || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, amount, user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Set auth context to the user_id
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(user_id);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process transaction based on type and credit card
    if (type === 'expense' && credit_card_id) {
      console.log("Processing credit card transaction");
      
      // Create credit card purchase
      const { data: purchase, error: purchaseError } = await supabase
        .from('credit_card_purchases')
        .insert({
          card_id: credit_card_id,
          description: description || 'Compra via WhatsApp',
          amount: amount,
          purchase_date: date ? date.split('T')[0] : new Date().toISOString().split('T')[0],
          installments: 1,
          installment_amount: amount,
          is_installment: false,
          category_id: category_id
        })
        .select()
        .single();

      if (purchaseError) {
        console.error("Error creating credit card purchase:", purchaseError);
        return new Response(
          JSON.stringify({ error: 'Failed to create credit card purchase', details: purchaseError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Auto-generate bills for the credit card
      const { error: billError } = await supabase.rpc('auto_generate_credit_card_bills', {
        card_id_param: credit_card_id
      });

      if (billError) {
        console.error("Error generating credit card bills:", billError);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'credit_card_purchase',
          data: purchase 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.log("Processing regular transaction");
      
      // Get default account if not provided
      let finalAccountId = account_id;
      if (!finalAccountId) {
        const { data: defaultAccount } = await supabase.rpc('get_default_account_id', {
          p_user_id: user_id
        });
        
        if (!defaultAccount) {
          const { data: createdAccount } = await supabase.rpc('create_default_account_for_user', {
            p_user_id: user_id
          });
          finalAccountId = createdAccount;
        } else {
          finalAccountId = defaultAccount;
        }
      }

      // Get category ID if not provided or find default
      let finalCategoryId = category_id;
      if (!finalCategoryId) {
        const { data: defaultCategory } = await supabase
          .from('poupeja_categories')
          .select('id')
          .eq('name', 'Outros')
          .eq('type', type)
          .eq('user_id', user_id)
          .single();
        
        if (defaultCategory) {
          finalCategoryId = defaultCategory.id;
        }
      }

      // Create regular transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('poupeja_transactions')
        .insert({
          type: type,
          amount: amount,
          category_id: finalCategoryId,
          description: description || '',
          date: date ? date.split('T')[0] : new Date().toISOString().split('T')[0],
          account_id: finalAccountId,
          user_id: user_id
        })
        .select(`
          *,
          category:poupeja_categories(id, name, icon, color, type),
          account:poupeja_accounts(id, name, bank_name)
        `)
        .single();

      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create transaction', details: transactionError }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          type: 'transaction',
          data: transaction 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});