import React, { useEffect } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';

const TermsOfServicePage = () => {
  const { companyName } = useBrandingConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
      <LandingHeader />
      
      <main className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Termos de Uso</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p>
                Ao utilizar a plataforma {companyName}, você concorda com estes Termos de Uso. Se não concordar com algum termo, não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Descrição do Serviço</h2>
              <p>
                O {companyName} é uma plataforma digital de controle financeiro pessoal que permite aos usuários:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Gerenciar contas bancárias e cartões de crédito</li>
                <li>Registrar e categorizar transações financeiras</li>
                <li>Definir e acompanhar metas financeiras</li>
                <li>Gerar relatórios e análises financeiras</li>
                <li>Programar transações recorrentes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Elegibilidade</h2>
              <p>
                Para usar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Ter pelo menos 18 anos de idade</li>
                <li>Possuir capacidade legal para contratar</li>
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de sua conta</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Conta do Usuário</h2>
              <p>
                Você é responsável por:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Manter suas informações de login seguras</li>
                <li>Notificar sobre uso não autorizado de sua conta</li>
                <li>Manter seus dados atualizados</li>
                <li>Não compartilhar sua conta com terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Planos e Pagamentos</h2>
              <p>
                Oferecemos diferentes planos de assinatura:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Plano Gratuito com funcionalidades limitadas</li>
                <li>Planos pagos com recursos avançados</li>
                <li>Cobrança automática para planos recorrentes</li>
                <li>Cancelamento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Uso Aceitável</h2>
              <p>
                Você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Usar a plataforma para atividades ilegais</li>
                <li>Tentar acessar sistemas sem autorização</li>
                <li>Interferir no funcionamento da plataforma</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Transmitir conteúdo malicioso ou prejudicial</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Propriedade Intelectual</h2>
              <p>
                Todos os direitos de propriedade intelectual da plataforma pertencem ao {companyName}. Você recebe apenas uma licença limitada de uso.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Limitação de Responsabilidade</h2>
              <p>
                O {companyName} não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Decisões financeiras baseadas em informações da plataforma</li>
                <li>Perdas decorrentes de falhas técnicas</li>
                <li>Danos indiretos ou consequenciais</li>
                <li>Conteúdo de terceiros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Encerramento</h2>
              <p>
                Podemos encerrar ou suspender sua conta em caso de violação destes termos. Você pode cancelar sua conta a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">10. Modificações</h2>
              <p>
                Reservamos o direito de modificar estes termos a qualquer momento. Mudanças significativas serão comunicadas através da plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">11. Lei Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis brasileiras. Disputas serão resolvidas no foro da comarca onde está situada nossa sede.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">12. Contato</h2>
              <p>
                Para questões sobre estes Termos de Uso, entre em contato através dos canais disponíveis em nossa plataforma.
              </p>
            </section>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm">
                <strong>Data da última atualização:</strong> Janeiro de 2025
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfServicePage;