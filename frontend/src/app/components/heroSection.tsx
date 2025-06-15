'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative w-full h-[600px] overflow-hidden pt-3">
      {/* Background Image */}
      <Image
        src="/herosection_img_4.jpg"
        alt="Hero Background"
        fill
        className="object-cover object-center"
        priority
      />

      {/* Right Side Sky Blue Overlay */}
      <div className="absolute inset-y-0 right-0 w-full md:w-1/2  flex items-center justify-center p-6 md:p-12">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Your Trusted Pharmaceutical Partner
          </h1>
          <p className="text-white font-bold text-md md:text-lg leading-relaxed max-w-md drop-shadow-sm">
            We specialize in delivering safe, effective, and innovative medicines to improve global health.
            Our commitment to quality and research ensures that we serve hospitals, clinics, and patients with excellence.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
