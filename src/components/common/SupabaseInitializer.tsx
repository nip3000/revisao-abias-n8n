
import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface SupabaseInitializerProps {
  children: React.ReactNode;
}

export const SupabaseInitializer: React.FC<SupabaseInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showConfigWarning, setShowConfigWarning] = useState(false);

  useEffect(() => {
    // Project is now properly configured with Supabase
    setIsInitialized(true);
  }, []);

  // Mostrar indicador de carregamento
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return children;
};

