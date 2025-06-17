'use client';

import Image from 'next/image';
import React from 'react';

const AboutUs = () => {
  return (
    <div className="bg-gray-50 min-h-screen px-6 py-12 flex flex-col items-center space-y-16">
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-900 text-center">About Ahaz Pharma</h1>

      {/* Row 1 - Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Product 1 */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Animal Antibiotic"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Animal Antibiotic</h2>
          <p className="text-gray-700 mt-2">
            Effective solution for treating bacterial infections in livestock and pets.
          </p>
        </div>

        {/* Product 2 */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Vitamin Supplement"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Vitamin Supplement</h2>
          <p className="text-gray-700 mt-2">
            Boosts immunity and improves the overall health of animals through rich nutrition.
          </p>
        </div>

        {/* Product 3 */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Deworming Medicine"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Deworming Medicine</h2>
          <p className="text-gray-700 mt-2">
            Trusted treatment for internal parasites in cattle, goats, and household pets.
          </p>
        </div>
      </div>

      {/* Row 2 - Ambition, Goal, Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Ambition */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Ambition"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Our Ambition</h2>
          <p className="text-gray-700 mt-2">
            To become the leading animal pharmaceutical brand trusted by veterinarians and farmers alike.
          </p>
        </div>

        {/* Goal */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Goal"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Our Goal</h2>
          <p className="text-gray-700 mt-2">
            Deliver safe, affordable, and effective solutions to support animal health nationwide.
          </p>
        </div>

        {/* Target */}
        <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center text-center">
          <Image
            src="/animal_antibiotic.avif"
            alt="Target"
            width={300}
            height={200}
            className="rounded-md mb-4 object-cover"
          />
          <h2 className="text-xl font-semibold text-blue-800">Our Target</h2>
          <p className="text-gray-700 mt-2">
            Expand across South Asia while staying committed to quality, ethics, and innovation.
          </p>
        </div>
      </div>

      {/* Row 3 - Owner Section */}
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col md:flex-row items-center text-center md:text-left">
          <Image
            src="/animal_antibiotic.avif"
            alt="Owner"
            width={250}
            height={250}
            className="rounded-full shadow-md mb-4 md:mb-0 md:mr-6 object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Founder: Dr. Ashraf Hossain</h2>
            <p className="text-gray-700">
              With over 15 years of experience in veterinary pharmaceuticals, Dr. Ashraf founded Ahaz Pharma to
              revolutionize animal health in Bangladesh. His passion for ethical innovation and care drives the company’s vision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
