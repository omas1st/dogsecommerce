import React from 'react';

interface FooterProps {
  onNavigate: (route: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#1E232A] text-gray-400 py-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#0E5E58] text-white flex items-center justify-center font-serif-brand font-bold text-sm">
              H&amp;H
            </div>
            <div>
              <span className="font-serif-brand text-base font-bold text-white tracking-tight">
                Hound &amp; Harbor
              </span>
              <p className="text-[11px] text-gray-400">
                Thoughtful canine nutrition, wellness, and companion essentials.
              </p>
            </div>
          </div>

          {/* Simple Navigation Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium">
            <button
              onClick={() => onNavigate('home')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={() => onNavigate('support')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Support
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Terms
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-gray-800 text-center text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} Hound &amp; Harbor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
