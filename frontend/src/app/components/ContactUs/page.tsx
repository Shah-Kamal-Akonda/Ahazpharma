"use client";

import React from "react";
import Image from "next/image";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-white px-4 md:px-16 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left: Image */}
        <div className="w-full h-full">
          <Image
            src="/contact_img.avif"
            alt="Contact Us"
            width={600}
            height={500}
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right: Contact Details */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Get in Touch</h2>
          <p className="text-gray-600">
            Reach out to us via WhatsApp, call, or email. We're here to help you 24/7.
          </p>

          <div className="space-y-4 text-gray-700 text-lg">
            <div className="flex items-center space-x-3">
              <FaWhatsapp className="text-green-500" />
              <span>+880 1234-567890</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaPhoneAlt className="text-blue-500" />
              <span>+880 1987-654321</span>
            </div>
            <div className="flex items-center space-x-3">
              <FaEnvelope className="text-red-500" />
              <span>support@elehealth.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
