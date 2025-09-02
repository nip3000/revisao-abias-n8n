
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const { data, error } = await supabase
      .from("poupeja_transactions")
      .select(`
        *,
        category:poupeja_categories(id, name, icon, color, type),
        account:poupeja_accounts(id, name, bank_name)
      `)
      .order("date", { ascending: false });

    if (error) throw error;

    console.log("Raw transaction data from Supabase:", data?.slice(0, 2)); // Debug: mostrar primeiras 2 transações

    return data.map((item) => ({
      id: item.id,
      type: item.type as 'income' | 'expense',
      amount: item.amount,
      category: item.category?.name || "Outros",
      categoryIcon: item.category?.icon || "circle",
      categoryColor: item.category?.color || "#607D8B",
      description: item.description || "",
      date: item.date,
      goalId: item.goal_id || undefined,
      creditCardId: item.credit_card_id || undefined,
      category_id: item.category_id,
      account_id: item.account_id,
      accountId: item.account_id,
      accountName: item.account ? 
        `${item.account.name}${item.account.bank_name ? ` • ${item.account.bank_name}` : ''}` : 
        undefined
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

export const addTransaction = async (transaction: Omit<Transaction, "id">): Promise<Transaction | null> => {
  try {
    console.log("addTransaction called with:", transaction);
    
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      throw new Error("You must be logged in to add a transaction");
    }

    const userId = authData.user.id;
    const newId = uuidv4();

    // Se for uma despesa com cartão de crédito (e creditCardId não for undefined), criar compra no cartão
    if (transaction.type === 'expense' && transaction.creditCardId && transaction.creditCardId !== 'none') {
      console.log("Creating credit card purchase instead of direct transaction");
      
      // Import creditCardService here to avoid circular dependencies
      const { creditCardService } = await import('@/services/creditCardService');
      
      const purchaseData = {
        card_id: transaction.creditCardId,
        description: transaction.description || 'Compra no cartão',
        amount: transaction.amount,
        purchase_date: transaction.date.split('T')[0], // Convert to date only
        installments: 1,
        installment_amount: transaction.amount,
        is_installment: false,
        category_id: transaction.category_id
      };
      
      const purchase = await creditCardService.createPurchase(purchaseData);
      
      if (purchase) {
        console.log("Credit card purchase created successfully, returning null to prevent transaction creation");
        // Return null to indicate this was handled as a credit card purchase
        // and should NOT be added to regular transactions
        return null;
      }
      
      throw new Error("Failed to create credit card purchase");
    }

    // Fluxo normal para transações sem cartão de crédito ou receitas
    console.log("Creating normal transaction (no credit card or income)");
    
    // Get category ID - if it's already an ID, use it directly, otherwise find by name
    let categoryId = transaction.category_id || transaction.category;
    
    // Check if the category is actually a category ID by trying to find it
    const { data: categoryCheck } = await supabase
      .from("poupeja_categories")
      .select("id")
      .eq("id", categoryId)
      .single();
    
    if (!categoryCheck) {
      // If not found by ID, try to find by name
      const { data: categoryByName } = await supabase
        .from("poupeja_categories")
        .select("id")
        .eq("name", categoryId)
        .eq("type", transaction.type)
        .single();
      
      if (categoryByName) {
        categoryId = categoryByName.id;
      } else {
        // Fallback to finding any "Outros" category for this user and type
        const { data: defaultCategory } = await supabase
          .from("poupeja_categories")
          .select("id")
          .eq("name", "Outros")
          .eq("type", transaction.type)
          .eq("user_id", userId)
          .single();
        
        if (defaultCategory) {
          categoryId = defaultCategory.id;
        } else {
          throw new Error(`No valid category found for ${transaction.type}`);
        }
      }
    }

    const { data, error } = await supabase
      .from("poupeja_transactions")
      .insert({
        id: newId,
        type: transaction.type,
        amount: transaction.amount,
        category_id: categoryId,
        description: transaction.description,
        date: transaction.date,
        goal_id: transaction.goalId,
        account_id: transaction.accountId,
        user_id: userId
      })
      .select(`
        *,
        category:poupeja_categories(id, name, icon, color, type),
        account:poupeja_accounts(id, name, bank_name)
      `)
      .single();

    if (error) throw error;

    // If this is an income transaction linked to a goal, update the goal's current amount
    if (transaction.type === 'income' && transaction.goalId) {
      console.log("Updating goal current amount for income transaction");
      const { error: goalError } = await supabase.rpc('update_goal_amount', {
        p_goal_id: transaction.goalId,
        p_amount_change: transaction.amount
      });
      
      if (goalError) {
        console.error("Error updating goal amount:", goalError);
      } else {
        console.log("Goal amount updated successfully");
      }
    }

    return {
      id: data.id,
      type: data.type as 'income' | 'expense',
      amount: data.amount,
      category: data.category?.name || "Outros",
      categoryIcon: data.category?.icon || "circle",
      categoryColor: data.category?.color || "#607D8B",
      description: data.description || "",
      date: data.date,
      goalId: data.goal_id || undefined,
      accountId: data.account_id || undefined,
      account_id: data.account_id,
      creditCardId: data.credit_card_id || undefined,
      credit_card_id: data.credit_card_id,
      accountName: data.account ? 
        `${data.account.name}${data.account.bank_name ? ` • ${data.account.bank_name}` : ''}` : 
        undefined
    };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return null;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
  try {
    // First, get the old transaction to check if goal_id, amount, or credit_card_id changed
    const { data: oldTransaction } = await supabase
      .from("poupeja_transactions")
      .select("goal_id, amount, type, credit_card_id")
      .eq("id", transaction.id)
      .single();

    // Check if this is being converted to a credit card expense
    const creditCardId = transaction.creditCardId || transaction.credit_card_id;
    if (transaction.type === 'expense' && creditCardId && creditCardId !== 'none') {
      console.log("Converting transaction to credit card purchase");
      
      // Import creditCardService here to avoid circular dependencies
      const { creditCardService } = await import('@/services/creditCardService');
      
      const purchaseData = {
        card_id: creditCardId,
        description: transaction.description || 'Compra no cartão',
        amount: transaction.amount,
        purchase_date: transaction.date.split('T')[0], // Convert to date only
        installments: 1,
        installment_amount: transaction.amount,
        is_installment: false,
        category_id: transaction.category_id || transaction.category
      };
      
      const purchase = await creditCardService.createPurchase(purchaseData);
      
      if (purchase) {
        console.log("Credit card purchase created, deleting original transaction");
        
        // Delete the original transaction since it's now a credit card purchase
        const { error: deleteError } = await supabase
          .from("poupeja_transactions")
          .delete()
          .eq("id", transaction.id);
        
        if (deleteError) throw deleteError;
        
        // Return null to indicate the transaction was converted (not updated)
        return null;
      }
      
      throw new Error("Failed to convert to credit card purchase");
    }

    // Get category ID - if it's already an ID, use it directly, otherwise find by name
    let categoryId = transaction.category_id || transaction.category;
    
    // Check if the category is actually a category ID by trying to find it
    const { data: categoryCheck } = await supabase
      .from("poupeja_categories")
      .select("id")
      .eq("id", categoryId)
      .single();
    
    if (!categoryCheck) {
      // If not found by ID, try to find by name
      const { data: categoryByName } = await supabase
        .from("poupeja_categories")
        .select("id")
        .eq("name", categoryId)
        .eq("type", transaction.type)
        .single();
      
      if (categoryByName) {
        categoryId = categoryByName.id;
      } else {
        // Get user ID for proper fallback
        const { data: authData } = await supabase.auth.getUser();
        const userId = authData?.user?.id;
        
        if (userId) {
          // Fallback to finding any "Outros" category for this user and type
          const { data: defaultCategory } = await supabase
            .from("poupeja_categories")
            .select("id")
            .eq("name", "Outros")
            .eq("type", transaction.type)
            .eq("user_id", userId)
            .single();
          
          if (defaultCategory) {
            categoryId = defaultCategory.id;
          } else {
            throw new Error(`No valid category found for ${transaction.type}`);
          }
        }
      }
    }

    // Normal transaction update (no credit card conversion)
    const { data, error } = await supabase
      .from("poupeja_transactions")
      .update({
        type: transaction.type,
        amount: transaction.amount,
        category_id: categoryId,
        description: transaction.description,
        date: transaction.date,
        goal_id: transaction.goalId,
        account_id: transaction.accountId || transaction.account_id,
        credit_card_id: creditCardId === 'none' ? null : creditCardId
      })
      .eq("id", transaction.id)
      .select(`
        *,
        category:poupeja_categories(id, name, icon, color, type),
        account:poupeja_accounts(id, name, bank_name)
      `)
      .single();

    if (error) throw error;

    // Update goal amounts if needed
    if (oldTransaction) {
      // If old transaction was income and linked to a goal, subtract the old amount
      if (oldTransaction.type === 'income' && oldTransaction.goal_id) {
        await supabase.rpc('update_goal_amount', {
          p_goal_id: oldTransaction.goal_id,
          p_amount_change: -oldTransaction.amount
        });
      }

      // If new transaction is income and linked to a goal, add the new amount
      if (transaction.type === 'income' && transaction.goalId) {
        await supabase.rpc('update_goal_amount', {
          p_goal_id: transaction.goalId,
          p_amount_change: transaction.amount
        });
      }
    }

    return {
      id: data.id,
      type: data.type as 'income' | 'expense',
      amount: data.amount,
      category: data.category?.name || "Outros",
      categoryIcon: data.category?.icon || "circle",
      categoryColor: data.category?.color || "#607D8B",
      description: data.description || "",
      date: data.date,
      goalId: data.goal_id || undefined,
      accountId: data.account_id || undefined,
      account_id: data.account_id,
      creditCardId: data.credit_card_id || undefined,
      credit_card_id: data.credit_card_id,
      accountName: data.account ? 
        `${data.account.name}${data.account.bank_name ? ` • ${data.account.bank_name}` : ''}` : 
        undefined
    };
  } catch (error) {
    console.error("Error updating transaction:", error);
    return null;
  }
};

export const deleteTransaction = async (id: string): Promise<boolean> => {
  try {
    // First, get the transaction to check if it's linked to a goal
    const { data: transactionToDelete } = await supabase
      .from("poupeja_transactions")
      .select("goal_id, amount, type")
      .eq("id", id)
      .single();

    const { error } = await supabase
      .from("poupeja_transactions")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // If this was an income transaction linked to a goal, subtract the amount from the goal
    if (transactionToDelete && transactionToDelete.type === 'income' && transactionToDelete.goal_id) {
      await supabase.rpc('update_goal_amount', {
        p_goal_id: transactionToDelete.goal_id,
        p_amount_change: -transactionToDelete.amount
      });
    }

    return true;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return false;
  }
};

export const deleteMultipleTransactions = async (ids: string[]): Promise<boolean> => {
  try {
    if (ids.length === 0) return true;

    // First, get all transactions that will be deleted to check for goal updates
    const { data: transactionsToDelete } = await supabase
      .from("poupeja_transactions")
      .select("id, goal_id, amount, type")
      .in("id", ids);

    // Delete all transactions
    const { error } = await supabase
      .from("poupeja_transactions")
      .delete()
      .in("id", ids);

    if (error) throw error;

    // Update goal amounts for any income transactions that were linked to goals
    if (transactionsToDelete) {
      for (const transaction of transactionsToDelete) {
        if (transaction.type === 'income' && transaction.goal_id) {
          await supabase.rpc('update_goal_amount', {
            p_goal_id: transaction.goal_id,
            p_amount_change: -transaction.amount
          });
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error deleting multiple transactions:", error);
    return false;
  }
};
