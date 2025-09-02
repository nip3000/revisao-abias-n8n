import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';

const LandingTestimonials = () => {
  const { companyName } = useBrandingConfig();
  
  const testimonials = [
    {
      name: "Maria Silva",
      role: "Empresária",
      company: "Loja da Maria",
      avatar: "MS",
      testimonial: `O ${companyName} transformou como gerencio as finanças da minha loja. Agora consigo acompanhar tudo pelo WhatsApp e os relatórios me ajudam a tomar decisões mais inteligentes.`
    },
    {
      name: "João Santos",
      role: "Freelancer",
      company: "Designer",
      avatar: "JS",
      testimonial: "Finalmente consegui organizar minha vida financeira! A integração com WhatsApp é perfeita para meu dia a dia corrido. Recomendo para todos os freelancers."
    },
    {
      name: "Ana Costa",
      role: "Gerente Financeira",
      company: "TechStart",
      avatar: "AC",
      testimonial: `Nossa startup economizou muito tempo com o ${companyName}. Os relatórios automáticos e o controle de fluxo de caixa facilitaram nossa gestão financeira.`
    }
  ];

  const stars = Array(5).fill(null);

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/10 to-background w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-primary/5 to-secondary/5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Mais de 4.000 pessoas já transformaram suas finanças com o {companyName}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-6 relative z-10">
                  {/* Stars */}
                  <div className="flex justify-center mb-4">
                    {stars.map((_, starIndex) => (
                      <motion.div
                        key={starIndex}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * starIndex }}
                        viewport={{ once: true }}
                      >
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Quote icon */}
                  <div className="flex justify-center mb-4">
                    <Quote className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  
                  {/* Testimonial text */}
                  <p className="text-muted-foreground text-center mb-6 leading-relaxed italic">
                    "{testimonial.testimonial}"
                  </p>
                  
                  {/* User info */}
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                      {testimonial.avatar}
                    </div>
                    <div className="text-center">
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingTestimonials;