import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  Calendar, 
  Users, 
  Palette, 
  Music, 
  Camera, 
  Utensils, 
  Gift, 
  Building,
  ArrowRight
} from 'lucide-react';

const services = [
  {
    icon: Calendar,
    title: 'Event Planning',
    description: 'Comprehensive planning from concept to execution, ensuring every detail is perfect.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Guest Management',
    description: 'Seamless RSVP tracking, QR check-in, and personalized guest experiences.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Palette,
    title: 'Theme Design',
    description: 'Custom themes and décor that transform spaces into stunning environments.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Music,
    title: 'Entertainment',
    description: 'Top-tier entertainment from live bands to DJs and specialty performers.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Camera,
    title: 'Photography & Video',
    description: 'Professional coverage to capture every precious moment of your event.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Utensils,
    title: 'Catering Services',
    description: 'Gourmet cuisine and beverage services tailored to your preferences.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Gift,
    title: 'Corporate Events',
    description: 'Professional conferences, product launches, and team-building experiences.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Building,
    title: 'Venue Selection',
    description: 'Access to exclusive venues and expert guidance in choosing the perfect location.',
    color: 'from-teal-500 to-cyan-500',
  },
];

export function ServicesSection() {
  const ref = useRef(null);
  const tickerRef = useRef(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    // Keyboard support: left/right arrows to scroll the services list
    const onKey = (e: KeyboardEvent) => {
      if (!listRef.current) return;
      const step = Math.round(listRef.current.clientWidth * 0.7);
      if (e.key === 'ArrowRight') listRef.current.scrollBy({ left: step, behavior: 'smooth' });
      if (e.key === 'ArrowLeft') listRef.current.scrollBy({ left: -step, behavior: 'smooth' });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="services" className="py-24 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Our Services
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-foreground">Everything You Need for </span>
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Perfect Events
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From intimate gatherings to grand celebrations, we offer a complete suite of services 
            to make your event extraordinary.
          </p>
        </motion.div>

        {/* Horizontal Infinite Scroll Ticker - Single Row */}
        <div 
          ref={tickerRef}
          className="services-ticker relative w-full overflow-hidden py-4"
        >
          {/* Left Gradient Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
          
          {/* Right Gradient Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

          {/* Left Arrow */}
          <button
            aria-label="Scroll left"
            onClick={() => {
              const el = listRef.current;
              if (!el) return;
              const step = Math.round(el.clientWidth * 0.7);
              el.scrollBy({ left: -step, behavior: 'smooth' });
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>

          <div ref={listRef} className="services-ticker__list flex gap-8 will-change-transform overflow-x-auto scroll-smooth">
            {services.map((service) => (
              <motion.div
                key={`${service.title}-service`}
                whileHover={{ scale: 1.04, y: -8 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 220 }}
                className="group relative flex-shrink-0 w-80 scroll-ml-6 snap-start"
              >
                {/* Animated Background Glow */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ opacity: 1, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                  className={`absolute -inset-2 rounded-2xl bg-gradient-to-br ${service.color} blur-lg opacity-30 group-hover:opacity-50 -z-10 transition-all duration-500`}
                />

                {/* Glacier Effect Overlay */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-2xl border border-white/30 z-20 pointer-events-none"
                />

                {/* Service Card with Enhanced Effects */}
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-card/95 to-card/70 border border-border/50 group-hover:border-primary/70 transition-all duration-500 overflow-hidden shadow-xl group-hover:shadow-2xl shadow-primary/5 group-hover:shadow-primary/40 backdrop-blur-sm">
                  
                  {/* Dynamic Background Gradient   */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 0.12 }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-gradient-to-br ${service.color} transition-opacity duration-500`} 
                  />
                  
                  {/* Animated Accent Line */}
                  <motion.div 
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
                  />
                  
                  {/* Icon Container with Advanced Glow */}
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 6 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 250 }}
                    className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 shadow-2xl shadow-${service.color.split('-')[1]}-500/40 group-hover:shadow-${service.color.split('-')[1]}-500/70 transition-all duration-500 overflow-hidden`}
                  >
                    {/* Icon Shine Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <service.icon className="w-8 h-8 text-white relative z-10 group-hover:drop-shadow-lg transition-all duration-300" />
                  </motion.div>

                  {/* Content Section */}
                  <motion.div
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="relative text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {service.title}
                    </h3>
                    <p className="relative text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2 group-hover:text-muted-foreground/80 transition-colors duration-300">
                      {service.description}
                    </p>
                  </motion.div>

                  {/* CTA Link with Animated Arrow */}
                  <motion.div
                    initial={{ opacity: 0.6 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-300 cursor-pointer group/link"
                  >
                    <span className="relative">
                      Learn More
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.4 }}
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-primary origin-left"
                      />
                    </span>
                    <motion.div
                      initial={{ x: 0, scale: 1 }}
                      whileHover={{ x: 6, scale: 1.2 }}
                      transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
                      className="relative"
                    >
                      <ArrowRight className="w-4 h-4 group-hover/link:text-primary transition-colors" />
                    </motion.div>
                  </motion.div>

                  {/* Animated Border Effect */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary/50 via-purple-500/50 to-pink-500/50 bg-clip-border opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" 
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            aria-label="Scroll right"
            onClick={() => {
              const el = listRef.current;
              if (!el) return;
              const step = Math.round(el.clientWidth * 0.7);
              el.scrollBy({ left: step, behavior: 'smooth' });
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1"
          >
            Discuss Your Event
            <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
