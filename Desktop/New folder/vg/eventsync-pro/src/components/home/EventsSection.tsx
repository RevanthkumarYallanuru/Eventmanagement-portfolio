import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, ArrowRight, Play, X, ExternalLink } from 'lucide-react';
import { storage, PortfolioEvent } from '@/lib/storage';
import { format } from 'date-fns';

export function EventsSection() {
  const ref = useRef(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedEvent, setSelectedEvent] = useState<PortfolioEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const decorY = useTransform(scrollYProgress, [0, 1], [0, 100]);

  const portfolioEvents = storage.getPortfolioEvents();
  const categories = ['all', ...new Set(portfolioEvents.map(e => e.category))];

  const filteredEvents = filter === 'all' 
    ? portfolioEvents 
    : portfolioEvents.filter(e => e.category === filter);

  // Initialize horizontal ticker for events
  useEffect(() => {
    if (tickerRef.current) {
      const list = tickerRef.current.querySelector('.events-ticker__list');
      if (list && !tickerRef.current.dataset.duplicated) {
        const clone = list.cloneNode(true) as HTMLElement;
        clone.classList.add('events-ticker__list--clone');
        tickerRef.current.appendChild(clone);
        tickerRef.current.dataset.duplicated = '1';
      }
    }
  }, [filteredEvents]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section id="events" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />

      {/* Subtle spread gradient & blur overlay (dark #010101 → purple) */}
      <div className="absolute inset-0 pointer-events-none events-gradient-spread" />
      
      {/* Decorative Elements */}
      <motion.div
        style={{ y: decorY }}
        className="absolute top-20 right-10 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 border border-dashed border-primary/20 rounded-full hidden sm:block"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-40 left-10 w-16 h-16 sm:w-24 sm:h-24 border border-dashed border-purple-500/20 rounded-full hidden lg:block"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-block px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
          >
            Our Portfolio
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            <span className="text-foreground">Recent </span>
            <span className="block sm:inline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Events & Highlights
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Explore our showcase of successful events that have created lasting memories for our clients.
          </p>
        </motion.div>


        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category}
              onClick={() => setFilter(category)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 sm:px-5 py-2 rounded-full font-medium text-sm sm:text-base transition-all duration-300 ${
                filter === category
                  ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/25'
                  : 'bg-card border border-border hover:border-primary/50 text-foreground'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Horizontal Ticker for Events - Single Row */}
        <div 
          ref={tickerRef}
          className="events-ticker relative w-full overflow-hidden py-4"
        >
          {/* Left Gradient Overlay */}
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
          
          {/* Right Gradient Overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

          <div className="events-ticker__list flex gap-8 will-change-transform">
            {filteredEvents.map((event) => (
              <motion.div
                key={`${event.id}-event`}
                whileHover={{ scale: 1.08, y: -12 }}
                transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                className="group relative flex-shrink-0 w-96"
              >
                {/* Subtle background glow (reduced) */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.25 }}
                  transition={{ duration: 0.35 }}
                  className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 blur-md opacity-10 group-hover:opacity-25 -z-10 transition-all duration-350"
                />

                {/* Subtle glacier overlay */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.6 }}
                  transition={{ duration: 0.32 }}
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/8 to-white/3 backdrop-blur-xl border border-white/12 z-20 pointer-events-none"
                />

                {/* Event Card Content (simplified & clean) */}
                <div className="relative rounded-2xl overflow-hidden bg-card/95 border border-border/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  {/* Image Container */}
                  <div className="relative h-56 overflow-hidden">
                    <motion.img
                      src={event.coverImage}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.06 }}
                      transition={{ duration: 0.6 }}
                    />

                    {/* Image Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/40 transition-all duration-400" />

                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white group-hover:translate-y-0 translate-y-2 transition-all duration-300">
                      <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.date), 'MMM d, yyyy')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                        {event.guestCount && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {event.guestCount} guests
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {event.highlights.slice(0, 2).map((highlight, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                      {event.images.length > 0 && (
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 text-sm font-medium">📸 {event.images.length} photos</span>
                      )}
                      {event.videos.length > 0 && (
                        <span className="px-3 py-1 rounded-lg bg-red-500/10 text-red-600 text-sm font-medium">🎥 {event.videos.length} videos</span>
                      )}
                    </div>

                    {/* View Button (subtle) */}
                    <motion.button
                      onClick={() => setSelectedEvent(event)}
                      initial={{ opacity: 0.7 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm transition-all duration-200 cursor-pointer"
                    >
                      View Details
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.3, type: 'spring', stiffness: 280 }}
                        className="relative"
                      >
                        <ArrowRight className="w-4 h-4 transition-colors" />
                      </motion.div>
                    </motion.button>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 sm:py-16"
          >
            <p className="text-muted-foreground text-base sm:text-lg">No events found in this category.</p>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-10 sm:mt-12 lg:mt-16"
        >
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
          >
            Start Your Event Journey
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.a>
        </motion.div>

        {/* Event Detail Modal */}
        <AnimatePresence>
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-card rounded-xl sm:rounded-2xl shadow-2xl scrollbar-thin"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Cover Image */}
                <div className="relative h-48 sm:h-64 lg:h-80">
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8 -mt-12 sm:-mt-16 relative">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
                    {selectedEvent.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 sm:mb-4">{selectedEvent.title}</h3>
                  
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-muted-foreground text-sm mb-4 sm:mb-6">
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      {format(new Date(selectedEvent.date), 'MMMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1.5 sm:gap-2">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                      {selectedEvent.location}
                    </span>
                    {selectedEvent.guestCount && (
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                        {selectedEvent.guestCount} Guests
                      </span>
                    )}
                  </div>

                  <p className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base">{selectedEvent.description}</p>

                  {/* Highlights */}
                  <div className="mb-6 sm:mb-8">
                    <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Event Highlights</h4>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {selectedEvent.highlights.map((highlight, i) => (
                        <span
                          key={i}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Gallery */}
                  {selectedEvent.images.length > 0 && (
                    <div>
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Gallery</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        {selectedEvent.images.map((image, i) => (
                          <motion.img
                            key={i}
                            src={image}
                            alt={`${selectedEvent.title} - Image ${i + 1}`}
                            className="w-full h-24 sm:h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            whileHover={{ scale: 1.05 }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Videos */}
                  {selectedEvent.videos.length > 0 && (
                    <div className="mt-6 sm:mt-8">
                      <h4 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Videos</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {selectedEvent.videos.map((video, i) => (
                          <a
                            key={i}
                            href={video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 sm:p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                          >
                            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                            <span className="text-foreground font-medium text-sm sm:text-base">Watch Video {i + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}