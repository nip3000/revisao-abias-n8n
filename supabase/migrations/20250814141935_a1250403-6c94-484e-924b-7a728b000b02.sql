-- Criar tabela para bancos
CREATE TABLE public.poupeja_banks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  code TEXT, -- código do banco (ex: 001, 033, etc)
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de bancos
ALTER TABLE public.poupeja_banks ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para bancos
CREATE POLICY "Users can manage own banks" 
ON public.poupeja_banks 
FOR ALL 
USING (user_id = auth.uid());

-- Adicionar novos campos à tabela de contas
ALTER TABLE public.poupeja_accounts 
ADD COLUMN account_number TEXT,
ADD COLUMN agency TEXT,
ADD COLUMN bank_id UUID REFERENCES public.poupeja_banks(id);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_poupeja_banks_updated_at
BEFORE UPDATE ON public.poupeja_banks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns bancos padrão para facilitar o uso inicial
INSERT INTO public.poupeja_banks (user_id, name, code) 
SELECT 
  u.id as user_id,
  banco.name,
  banco.code
FROM (
  SELECT DISTINCT user_id as id FROM public.poupeja_accounts
) u
CROSS JOIN (
  VALUES 
    ('Banco do Brasil', '001'),
    ('Bradesco', '237'),
    ('Caixa Econômica Federal', '104'),
    ('Itaú Unibanco', '341'),
    ('Santander', '033'),
    ('Banco Inter', '077'),
    ('Nubank', '260'),
    ('C6 Bank', '336'),
    ('Banco Original', '212'),
    ('Banco Safra', '422')
) as banco(name, code)
ON CONFLICT DO NOTHING;