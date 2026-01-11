import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Target, Heart, Award, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react';
import { storage } from '@/lib/storage';

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const settings = storage.getSiteSettings();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const values = [
    {
      icon: Target,
      title: 'Precision Planning',
      description: 'Every detail meticulously crafted for flawless execution.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Heart,
      title: 'Passion Driven',
      description: 'We pour our heart into creating meaningful experiences.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Award,
      title: 'Excellence First',
      description: 'Award-winning service that exceeds expectations.',
      color: 'from-primary to-purple-600',
    },
    {
      icon: Lightbulb,
      title: 'Creative Innovation',
      description: 'Fresh ideas that make your event truly unique.',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  const features = [
    'Full-service event planning and management',
    'Vendor coordination and negotiation',
    'Custom theme design and décor',
    'Guest management and RSVP tracking',
    'Real-time event coordination',
    'Post-event analysis and reporting',
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="about" className="py-16 sm:py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      {/* Background Elements with Parallax */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-1/4 -left-32 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-1/4 -right-32 w-48 sm:w-72 lg:w-96 h-48 sm:h-72 lg:h-96 bg-purple-600/10 rounded-full blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-10 sm:mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-block px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4"
          >
            About Us
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            <span className="text-foreground">We Bring Your </span>
            <span className="block sm:inline bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Vision to Life
            </span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            With over a decade of experience, we've mastered the art of creating extraordinary events 
            that leave lasting impressions on every guest.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left - Image Collage */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400"
                  alt="Event Planning"
                  className="w-full h-32 sm:h-48 lg:h-64 object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl mt-4 sm:mt-8"
              >
                <img
                  src="https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400"
                  alt="Team Working"
                  className="w-full h-32 sm:h-48 lg:h-64 object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl -mt-4 sm:-mt-8"
              >
                <img
                  src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400"
                  alt="Conference"
                  className="w-full h-32 sm:h-48 lg:h-64 object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl sm:rounded-2xl overflow-hidden shadow-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400"
                  alt="Celebration"
                  className="w-full h-32 sm:h-48 lg:h-64 object-cover"
                />
              </motion.div>
            </div>

            {/* Experience Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5, type: "spring" }}
              whileHover={{ scale: 1.1 }}
              className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:-right-6 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-primary to-purple-600 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-white shadow-xl"
            >
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold">10+</span>
              <span className="text-xs sm:text-sm">Years</span>
            </motion.div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="order-1 lg:order-2"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6"
            >
              Your Trusted Partner in Event Excellence
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-muted-foreground mb-6 sm:mb-8 text-sm sm:text-base"
            >
              At {settings.companyName}, we believe every event tells a story. Our dedicated team of 
              professionals works tirelessly to ensure your story is told in the most magnificent way possible. 
              From intimate gatherings to grand celebrations, we handle it all with the same level of 
              commitment and attention to detail.
            </motion.p>

            {/* Feature List */}
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-foreground">{feature}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.a
              variants={itemVariants}
              href="#contact"
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 text-sm sm:text-base"
            >
              Let's Work Together
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.a>
          </motion.div>
        </div>

        {/* Values Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-16 sm:mt-20 lg:mt-24 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group p-4 sm:p-5 lg:p-6 rounded-xl sm:rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">{value.title}</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}