import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { storage } from '@/lib/storage';

export function ReviewsSection() {
  const ref = useRef(null);
  const tickerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const testimonials = storage.getTestimonials();

  useEffect(() => {
    // Initialize vertical ticker
    if (tickerRef.current) {
      const list = tickerRef.current.querySelector('.vertical-ticker__list');
      if (list && !tickerRef.current.dataset.duplicated) {
        const clone = list.cloneNode(true);
        clone.classList.add('vertical-ticker__list--clone');
        tickerRef.current.appendChild(clone);
        tickerRef.current.dataset.duplicated = '1';
      }
    }
  }, [testimonials]);

  return (
    <section id="reviews" className="py-24 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-foreground">What Our </span>
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Clients Say
            </span>
          </h2>
          <p className="text-muted-foreground">Scroll to see more reviews</p>
        </motion.div>

        {/* Vertical Ticker */}
        <div ref={tickerRef} className="vertical-ticker max-w-2xl mx-auto">
          <div className="vertical-ticker__list space-y-6">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                }}
                className="relative p-8 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-primary/30 cursor-pointer transition-all duration-300 group min-h-48"
              >
                {/* Glacier effect background */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/10 group-hover:text-primary/20 transition-colors duration-300" />
                
                <div className="relative z-10">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Star
                          className={`w-5 h-5 transition-all ${
                            i < testimonial.rating
                              ? 'fill-yellow-500 text-yellow-500'
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="flex items-center gap-3">
                    {testimonial.clientImage ? (
                      <img
                        src={testimonial.clientImage}
                        alt={testimonial.clientName}
                        className="w-12 h-12 rounded-full object-cover border border-border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-semibold">
                        {testimonial.clientName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.clientName}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.clientTitle}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
