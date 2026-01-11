import React, { useEffect } from 'react';
import { Navbar } from '@/components/home/Navbar';
import { HeroSection } from '@/components/home/HeroSection';
import { AboutSection } from '@/components/home/AboutSection';
import { EventsSection } from '@/components/home/EventsSection';
import { ServicesSection } from '@/components/home/ServicesSection';
import { ReviewsSection } from '@/components/home/ReviewsSection';
import { ContactSection } from '@/components/home/ContactSection';
import { storage } from '@/lib/storage';
import { Sparkles } from 'lucide-react';

const Index = () => {
  const settings = storage.getSiteSettings();
  
  // Initialize storage inside component
  useEffect(() => {
    storage.initializeDefaultData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <EventsSection />
      <ServicesSection />
      <ReviewsSection />
      <ContactSection />
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-foreground">{settings.companyName}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {settings.companyName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
