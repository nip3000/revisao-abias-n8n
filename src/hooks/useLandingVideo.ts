import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LandingVideoConfig {
  videoUrl: string;
  isLoading: boolean;
  error: string | null;
}

export const useLandingVideo = (): LandingVideoConfig => {
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVideoConfig();
  }, []);

  const loadVideoConfig = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎥 [useLandingVideo] Carregando configuração do vídeo...');
      const { data, error } = await supabase.functions.invoke('get-public-settings', {
        body: { category: 'landing' }
      });

      if (error) throw error;

      console.log('🎥 [useLandingVideo] Resposta da API:', data);

      if (data?.success && data?.settings) {
        // A estrutura é { settings: { category: { key: { value: ... } } } }
        const landingSettings = data.settings.landing || {};
        console.log('🎥 [useLandingVideo] Configurações landing encontradas:', landingSettings);
        const videoUrlValue = landingSettings.landing_video_url?.value || '';
        console.log('🎥 [useLandingVideo] URL do vídeo encontrada:', videoUrlValue);
        setVideoUrl(videoUrlValue);
      } else {
        console.log('🎥 [useLandingVideo] Nenhuma configuração encontrada');
      }
    } catch (err) {
      console.error('🎥 [useLandingVideo] Erro ao carregar configurações de vídeo:', err);
      setError('Erro ao carregar vídeo');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    videoUrl,
    isLoading,
    error
  };
};