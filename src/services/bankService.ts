import { supabase } from "@/integrations/supabase/client";

export interface Bank {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  created_at: string;
  updated_at: string;
}

export const bankService = {
  async getBanks(): Promise<Bank[]> {
    const { data, error } = await supabase
      .from('poupeja_banks')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async createBank(bank: Omit<Bank, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Bank> {
    const { data, error } = await supabase
      .from('poupeja_banks')
      .insert({
        name: bank.name,
        code: bank.code,
        user_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateBank(id: string, updates: Partial<Pick<Bank, 'name' | 'code'>>): Promise<Bank> {
    const { data, error } = await supabase
      .from('poupeja_banks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteBank(id: string): Promise<void> {
    const { error } = await supabase
      .from('poupeja_banks')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};