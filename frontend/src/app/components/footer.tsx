import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Logo and Links */}
        <div>
          <div className="flex items-center mb-4">
            <img src="/fotter-logo.png" alt="Elehealth Logo" className="w-6 h-6 mr-2" />
            <span className="font-semibold text-lg text-gray-800">elehealth</span>
          </div>
          <ul className="text-sm text-gray-700 space-y-2">
            <li>About Us</li>
            <li>Annual Checkup</li>
            <li>Blog</li>
            <li>Carers</li>
          </ul>
        </div>

        {/* Column 2: Middle Links */}
        <div>
          <ul className="text-sm text-gray-700 space-y-2 mt-8 md:mt-0">
            <li>Get A Diginosis</li>
            <li>How it works</li>
            <li>Privacy Policy</li>
            <li>Contact Us</li>
            <li>FAQ's</li>
          </ul>
        </div>

        {/* Column 3: Top Insurances */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Top insurances</h4>
          <div className="grid grid-cols-2 gap-x-4 text-sm text-gray-700">
            <div>
              <p>Aetna</p>
              <p>Health Plan</p>
              <p>Blue Shield</p>
              <p>Carers</p>
            </div>
            <div>
              <p>Health Net</p>
              <p>Health Smarth</p>
              <p>View More</p>
            </div>
          </div>
        </div>

        {/* Column 4: Social Links */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Follow Us</h4>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-blue-600">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Twitter" className="text-blue-400">
              <FaTwitter />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-blue-700">
              <FaLinkedinIn />
            </a>
            <a href="#" aria-label="Instagram" className="text-pink-500">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t mt-10 pt-6 text-sm text-gray-600 flex flex-col md:flex-row justify-between items-center">
        <p>All rights reserved by WPDeveloper 2020</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms & Conditions</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
