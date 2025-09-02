
import React, { useEffect, useState } from 'react';
import LandingHero from '@/components/landing/LandingHero';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingPricing from '@/components/landing/LandingPricing';
import LandingBenefits from '@/components/landing/LandingBenefits';
import LandingCTA from '@/components/landing/LandingCTA';
import LandingFooter from '@/components/landing/LandingFooter';
import LandingHeader from '@/components/landing/LandingHeader';
import { motion } from 'framer-motion';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';
import { useBranding } from '@/contexts/BrandingContext';
import { supabase } from '@/integrations/supabase/client';

const LandingPage = () => {
  const { companyName } = useBrandingConfig();
  const { isLoading: brandingLoading, lastUpdated } = useBranding();
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);
  const [forcedTheme, setForcedTheme] = useState<string | null>(null);

  // Aplicar tema antes mesmo do primeiro render
  useEffect(() => {
    const loadAndApplyLandingTheme = async () => {
      try {
        console.log('Carregando tema da landing page...');
        const { data, error } = await supabase.functions.invoke('get-public-settings', {
          body: { cacheBuster: Date.now() } // Cache-busting para o tema
        });
        
        if (!error && data?.success && data?.settings?.branding?.landing_theme) {
          const theme = data.settings.branding.landing_theme.value;
          setForcedTheme(theme);
          
          if (theme && theme !== 'system') {
            // Aplicar o tema imediatamente
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
            console.log('Tema aplicado:', theme);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar tema da landing:', err);
      } finally {
        setIsThemeLoaded(true);
      }
    };

    loadAndApplyLandingTheme();
    
    // Cleanup: restaurar tema do sistema quando sair da landing
    return () => {
      if (forcedTheme && forcedTheme !== 'system') {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        
        // Detectar preferência do sistema e aplicar
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const savedTheme = localStorage.getItem("metacash-ui-theme");
        
        if (savedTheme === "system" || !savedTheme) {
          root.classList.add(systemTheme);
        } else {
          root.classList.add(savedTheme);
        }
      }
    };
  }, [lastUpdated]); // Reagir a mudanças no branding

  // Mostrar um loading mínimo enquanto carrega o tema para evitar flash
  if (!isThemeLoaded || brandingLoading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
      <LandingHeader />
      <motion.main
        className="w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <LandingHero />
        <div id="funcionalidades">
          <LandingFeatures />
        </div>
        <div id="depoimentos">
          <LandingTestimonials />
        </div>
        <div id="planos">
          <LandingPricing />
        </div>
        <LandingBenefits />
        <LandingCTA />
      </motion.main>
      
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
