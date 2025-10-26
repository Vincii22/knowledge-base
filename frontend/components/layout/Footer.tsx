import Link from 'next/link';
import { Github, Mail, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary-700 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-accent-400 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">KB</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Knowledge Base</h3>
                <p className="text-accent-300 text-sm">Your Success - Our World</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              A collaborative platform for the Computer Science and Information Technology community 
              to share knowledge, document projects, and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-accent-400">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Articles
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-accent-400 transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-accent-400 transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-accent-400">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-primary-700 transition-all"
              >
                <Github size={20} />
              </a>
                <a
                href="mailto:info@csit.edu"
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-primary-700 transition-all"
              >
                <Mail size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center hover:bg-accent-400 hover:text-primary-700 transition-all"
              >
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-primary-600 text-center text-sm text-gray-300">
          <p>&copy; {currentYear} Knowledge Base - CSIT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}