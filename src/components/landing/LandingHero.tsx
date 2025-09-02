import React, { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Smartphone, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';
import { useLandingVideo } from '@/hooks/useLandingVideo';
const LandingHero = () => {
  const {
    companyName
  } = useBrandingConfig();
  const {
    videoUrl,
    isLoading
  } = useLandingVideo();
  const [hasInteracted, setHasInteracted] = useState(false);
  console.log('🎬 [LandingHero] Estado do vídeo:', {
    videoUrl,
    isLoading
  });
  const scrollToPlans = useCallback(() => {
    const section = document.getElementById('planos');
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, []);
  const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };
  const getYouTubeEmbedUrl = (url: string, withSound: boolean = false): string => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return '';
    const params = new URLSearchParams({
      autoplay: '1',
      mute: withSound ? '0' : '1',
      controls: '1',
      rel: '0',
      showinfo: '0',
      modestbranding: '1',
      enablejsapi: '1',
      origin: window.location.origin,
      playsinline: '1'
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };
  const handleVideoClick = () => {
    setHasInteracted(true);
    // Aguardar um momento e recarregar o iframe com som
    setTimeout(() => {
      const iframe = document.querySelector('#landing-video') as HTMLIFrameElement;
      if (iframe && videoUrl) {
        iframe.src = getYouTubeEmbedUrl(videoUrl, true);
      }
    }, 100);
  };
  return <section className="py-20 md:py-32 w-full">
      <div className="w-full px-4">
        <div className={`${videoUrl && !isLoading ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' : 'text-center'} max-w-7xl mx-auto`}>
          {/* Conteúdo à esquerda */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className={videoUrl && !isLoading ? 'text-left' : 'text-center'}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Transforme sua vida financeira com o </span>
              <span className="text-secondary">{companyName}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A ferramenta completa para controlar suas finanças, definir metas e 
              alcançar a liberdade financeira que você sempre sonhou.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-16">
              <Button size="lg" className="text-xs sm:text-sm md:text-base px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6" onClick={scrollToPlans}>
                Estou pronto para economizar
              </Button>
              <Button size="lg" variant="outline" className="text-xs sm:text-sm md:text-base px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6" asChild>
                <Link to="/login">Já tenho conta</Link>
              </Button>
            </div>
          </motion.div>

          {/* Vídeo à direita */}
          {videoUrl && !isLoading && <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="relative">
              <div className="aspect-video w-full rounded-lg overflow-hidden shadow-2xl relative">
                <div className="relative cursor-pointer group h-full" onClick={handleVideoClick}>
                  <iframe id="landing-video" src={getYouTubeEmbedUrl(videoUrl, false)} className="w-full h-full absolute inset-0 border-0" allowFullScreen title="Vídeo demonstrativo" style={{
                aspectRatio: '16/9'
              }} />
                  {!hasInteracted && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 rounded-full p-4 group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-primary ml-1" />
                      </div>
                    </div>}
                </div>
              </div>
            </motion.div>}
        </div>
        
        {/* Features Section */}
        
      </div>
    </section>;
};
export default LandingHero;