
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Palette, CreditCard, DollarSign, Phone, Database, Video, Code } from 'lucide-react';
import BrandingConfigManager from './BrandingConfigManager';
import StripeConfigManager from './StripeConfigManager';
import PlanPricingManager from './PlanPricingManager';
import ContactConfigManager from './ContactConfigManager';
import SystemConfigManager from './SystemConfigManager';
import LandingVideoManager from './LandingVideoManager';
import { PWAManifestGenerator } from './PWAManifestGenerator';

const AdminSectionTabs: React.FC = () => {
  return (
    <Tabs defaultValue="system" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1">
        <TabsTrigger value="system" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <Database className="h-4 w-4" />
          <span className="hidden sm:inline">Sistema</span>
        </TabsTrigger>
        <TabsTrigger value="branding" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Branding</span>
        </TabsTrigger>
        <TabsTrigger value="stripe" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">Stripe</span>
        </TabsTrigger>
        <TabsTrigger value="pricing" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Planos</span>
        </TabsTrigger>
        <TabsTrigger value="contact" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Contato</span>
        </TabsTrigger>
        <TabsTrigger value="landing-video" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <Video className="h-4 w-4" />
          <span className="hidden sm:inline">Vídeo L.P.</span>
        </TabsTrigger>
        <TabsTrigger value="pwa" className="flex items-center gap-1 text-xs lg:text-sm px-2 py-2">
          <Code className="h-4 w-4" />
          <span className="hidden sm:inline">PWA</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="system" className="mt-6">
        <SystemConfigManager />
      </TabsContent>

      <TabsContent value="branding" className="mt-6">
        <BrandingConfigManager />
      </TabsContent>

      <TabsContent value="stripe" className="mt-6">
        <StripeConfigManager />
      </TabsContent>

      <TabsContent value="pricing" className="mt-6">
        <PlanPricingManager />
      </TabsContent>

      <TabsContent value="contact" className="mt-6">
        <ContactConfigManager />
      </TabsContent>

      <TabsContent value="landing-video" className="mt-6">
        <LandingVideoManager />
      </TabsContent>
      <TabsContent value="pwa" className="mt-6">
        <PWAManifestGenerator />
      </TabsContent>
    </Tabs>
  );
};

export default AdminSectionTabs;
