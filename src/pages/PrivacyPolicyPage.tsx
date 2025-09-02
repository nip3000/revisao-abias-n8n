import React, { useEffect } from 'react';
import LandingHeader from '@/components/landing/LandingHeader';
import { useBrandingConfig } from '@/hooks/useBrandingConfig';

const PrivacyPolicyPage = () => {
  const { companyName } = useBrandingConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/20 to-background">
      <LandingHeader />
      
      <main className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-foreground mb-8">Política de Privacidade</h1>
          
          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">1. Informações Gerais</h2>
              <p>
                Esta Política de Privacidade descreve como o {companyName} coleta, usa e protege as informações pessoais dos usuários de nossa plataforma de controle financeiro pessoal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">2. Informações que Coletamos</h2>
              <p>Coletamos as seguintes categorias de informações:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Informações de identificação pessoal (nome, e-mail, telefone)</li>
                <li>Dados financeiros (transações, contas, metas financeiras)</li>
                <li>Informações de uso da plataforma</li>
                <li>Dados técnicos (endereço IP, tipo de navegador, dispositivo)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">3. Como Usamos suas Informações</h2>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar transações e pagamentos</li>
                <li>Comunicar atualizações e novidades</li>
                <li>Personalizar sua experiência</li>
                <li>Garantir a segurança da plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">4. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li>Quando necessário para prestação do serviço</li>
                <li>Por exigência legal ou judicial</li>
                <li>Para proteger nossos direitos e segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">5. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">6. Seus Direitos</h2>
              <p>Você tem o direito de:</p>
              <ul className="list-disc pl-6 mt-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Portabilidade dos dados</li>
                <li>Revogar consentimentos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pelo tempo necessário para cumprir as finalidades descritas nesta política ou conforme exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de nossa plataforma ou por e-mail.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-foreground mb-4">9. Contato</h2>
              <p>
                Para questões sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato conosco através dos canais disponíveis em nossa plataforma.
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

export default PrivacyPolicyPage;