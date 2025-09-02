import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SeedTestUserPage: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  const run = async () => {
    setStatus('running');
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('create-user-with-subscription', {
        body: {
          email: 'teste@repetiva.com.br',
          password: '##teste##',
          plan_type: 'annual',
        },
      });
      if (error) throw error;
      setStatus('success');
      setMessage(`Usuário criado/atualizado: ${data.email}`);
    } catch (err: any) {
      setStatus('error');
      setMessage(err?.message || 'Erro ao criar usuário');
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Criar usuário de teste</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'running' && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" /> {message}
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-4 w-4" /> {message}
              </AlertDescription>
            </Alert>
          )}

          <Button onClick={run} disabled={status === 'running'} className="w-full">
            Reexecutar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedTestUserPage;
