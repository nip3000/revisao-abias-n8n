import React, { useCallback } from 'react';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';
import { Facebook, Instagram, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
const LandingFooter = () => {
  const {
    companyName,
    logoUrl,
    logoAltText
  } = useBrandingConfig();
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, []);
  const scrollToPlans = () => scrollToSection('planos');
  const scrollToFeatures = () => scrollToSection('funcionalidades');
  const scrollToTestimonials = () => scrollToSection('depoimentos');
  return <footer className="bg-background border-t py-16 w-full">
      <div className="w-full px-4 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Logo e Descrição */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-3 mb-4">
              <img src={logoUrl} alt={logoAltText} className="h-8 w-8" />
              <span className="text-xl font-bold text-foreground">{companyName}</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-md">
              Transforme sua vida financeira com o melhor sistema de controle financeiro pessoal do Brasil.
            </p>
          </div>

          {/* Menu Produto */}
          <div className="flex flex-col items-center">
            <h4 className="text-sm font-semibold text-foreground mb-4">Produto</h4>
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <button onClick={scrollToFeatures} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Funcionalidades
                </button>
              </li>
              <li>
                <button onClick={scrollToPlans} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Planos e Preços
                </button>
              </li>
              <li>
                <button onClick={scrollToTestimonials} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Depoimentos
                </button>
              </li>
              <li>
                <button onClick={scrollToPlans} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Estou pronto para economizar
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-12 pt-8 flex flex-col items-center text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 {companyName} - Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>;
};
export default LandingFooter;