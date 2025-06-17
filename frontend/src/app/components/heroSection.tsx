'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="w-full h-auto md:h-[600px] flex flex-col md:flex-row ">
      {/* Left Half - Image */}
      <div className="relative w-full md:w-1/2 h-[300px] md:h-auto ">
        <Image
          src="/herosection_img_8.jpg"
          alt="Hero"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Right Half - Text with White Background */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 border-y-2 border-gray-300 ">
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center md:text-left"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-4">
            Your Trusted Pharmaceutical Partner
          </h1>
          <p className="text-gray-600 text-md md:text-lg leading-relaxed max-w-md">
            We specialize in delivering safe, effective, and innovative medicines to improve global health.
            Our commitment to quality and research ensures that we serve hospitals, clinics, and patients with excellence.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
