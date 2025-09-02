
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Target, Calendar, PieChart, Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingFeatures = () => {
  const features = [
    {
      icon: Wallet,
      title: "Controle de Transações",
      description: "Registre receitas e despesas de forma rápida e organizada"
    },
    {
      icon: Target,
      title: "Metas Financeiras",
      description: "Defina objetivos e acompanhe seu progresso em tempo real"
    },
    {
      icon: BarChart3,
      title: "Relatórios Detalhados",
      description: "Visualize seus dados com gráficos intuitivos e relatórios completos"
    },
    {
      icon: Calendar,
      title: "Agendamento",
      description: "Programe pagamentos recorrentes e nunca esqueça uma conta"
    },
    {
      icon: PieChart,
      title: "Análise por Categoria",
      description: "Entenda onde seu dinheiro está sendo gasto"
    },
    {
      icon: TrendingUp,
      title: "Dashboard Inteligente",
      description: "Visão geral completa da sua situação financeira"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-muted/20 via-background to-muted/30 w-full relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="w-full px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para organizar suas finanças
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ferramentas poderosas e intuitivas para transformar a maneira como você lida com o dinheiro
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group"
            >
              <Card className="h-full bg-card/80 backdrop-blur-sm border-2 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 relative overflow-hidden">
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <CardContent className="p-6 text-center relative z-10">
                  {/* Icon with background circle */}
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-8 w-8 text-primary group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    {/* Pulse animation on hover */}
                    <div className="absolute inset-0 w-16 h-16 bg-primary/20 rounded-full mx-auto scale-0 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LandingFeatures;
