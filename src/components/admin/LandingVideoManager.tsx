import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Video, Save, RefreshCw } from 'lucide-react';

interface VideoSettings {
  landing_video_url?: string;
}

const LandingVideoManager: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVideoSettings();
  }, []);

  const loadVideoSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-admin-settings', {
        body: { category: 'landing' }
      });

      if (error) throw error;

      if (data?.success && data?.settings) {
        // A estrutura é { settings: { category: { key: { value: ... } } } }
        const landingSettings = data.settings.landing || {};
        setVideoUrl(landingSettings.landing_video_url?.value || '');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de vídeo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de vídeo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    if (!url) return true; // Allow empty URL
    return extractYouTubeId(url) !== null;
  };

  const handleSave = async () => {
    if (!validateYouTubeUrl(videoUrl)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do YouTube.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-admin-settings', {
        body: {
          category: 'landing',
          updates: {
            landing_video_url: videoUrl
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Sucesso",
          description: "Configurações de vídeo salvas com sucesso!",
        });
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Vídeo da Landing Page
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">URL do Vídeo do YouTube</Label>
            <Input
              id="video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground">
              Cole o link completo de um vídeo do YouTube que será exibido na landing page
            </p>
          </div>

          {videoUrl && validateYouTubeUrl(videoUrl) && (
            <div className="space-y-2">
              <Label>Preview do Vídeo</Label>
              <div className="aspect-video w-full max-w-md">
                <iframe
                  src={getYouTubeEmbedUrl(videoUrl)}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title="Preview do vídeo"
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadVideoSettings}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LandingVideoManager;