
import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingCTA = () => {
  const scrollToPlans = useCallback(() => {
    const section = document.getElementById('planos');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <section className="py-0 w-full">
      <motion.div
        className="bg-gradient-to-r from-green-500 to-green-600 py-16 md:py-20 text-center text-white w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="w-full px-4 max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Comece sua jornada financeira hoje!
          </h2>
          
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90">
            Junte-se a milhares de pessoas que já transformaram suas vidas financeiras. 
            Sua liberdade financeira está a um clique de distância.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 font-semibold w-64 sm:w-auto mx-auto sm:mx-0 flex items-center justify-center gap-2 border-0"
              onClick={scrollToPlans}
            >
              <span>Estou pronto para economizar</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            </Button>
          </div>
          
          <div className="mt-8 text-sm opacity-75">
            ✓ Sem cartão de crédito necessário
            <span className="mx-2">•</span>
            ✓ Comece em menos de 2 minutos
            <span className="mx-2">•</span>
            ✓ Cancele quando quiser
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LandingCTA;
