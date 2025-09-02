
import React from 'react';
import { Shield, TrendingUp, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingBenefits = () => {
  const benefits = [
    {
      icon: TrendingUp,
      title: "Controle Total",
      description: "Acompanhe cada centavo e veja seu dinheiro crescer",
      iconColor: "text-primary",
      bgColor: "from-primary/10 to-primary/20",
      hoverBg: "group-hover:bg-primary/5"
    },
    {
      icon: Shield,
      title: "100% Seguro",
      description: "Seus dados protegidos com a melhor tecnologia",
      iconColor: "text-green-500",
      bgColor: "from-green-500/10 to-green-500/20",
      hoverBg: "group-hover:bg-green-500/5"
    },
    {
      icon: Smartphone,
      title: "Sempre Disponível",
      description: "Acesse de qualquer lugar, a qualquer momento",
      iconColor: "text-green-500",
      bgColor: "from-green-500/10 to-green-500/20",
      hoverBg: "group-hover:bg-green-500/5"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/10 to-background w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-4 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
            Por que escolher o Saldo Positivo?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Mais do que uma ferramenta, é o seu parceiro na jornada rumo à liberdade financeira
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.15 }}
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div className={`
                relative p-8 rounded-3xl bg-card border border-border/50 
                hover:border-border transition-all duration-500 shadow-sm hover:shadow-xl
                ${benefit.hoverBg}
                backdrop-blur-sm
              `}>
                {/* Modern glass effect overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-background/60 to-background/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon container */}
                <div className="relative z-10 mb-6">
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16 
                    bg-gradient-to-br ${benefit.bgColor} rounded-2xl
                    group-hover:scale-110 transition-all duration-300
                    shadow-lg group-hover:shadow-xl
                  `}>
                    <benefit.icon className={`h-8 w-8 ${benefit.iconColor} transition-all duration-300`} />
                  </div>
                  
                  {/* Pulse animation on hover */}
                  <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 animate-pulse"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10 text-center">
                  <h3 className="text-xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-base">
                    {benefit.description}
                  </p>
                </div>
                
                {/* Bottom accent line */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.bgColor}
                  rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 
                  transition-transform duration-500 origin-center
                `}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingBenefits;
