import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail, FiPhone } from 'react-icons/fi';
const Footer = () => {
  return <footer className="bg-slate-50 dark:bg-surface-950 text-slate-900 dark:text-white transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg flex items-center justify-center">
                <span className="text-slate-950 font-bold">G</span>
              </div>
              <span className="font-bold text-lg">Gene's InDrive</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Premium automobile marketplace and rental platform.
            </p>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/vehicles" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Rent a Car
                </Link>
              </li>
              <li>
                <Link to="/saved-vehicles" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Favorites
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  My Cart
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Company</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/about" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline text-slate-600 dark:text-slate-400">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {}
          <div>
            <h3 className="font-semibold mb-4 text-slate-900 dark:text-white">Get in Touch</h3>
            <div className="space-y-3">
              <a href="tel:+1234567890" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline">
                <FiPhone size={16} />
                ""
              </a>
              <a href="mailto:support@geneindrive.com" className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors no-underline">
                <FiMail size={16} />
                support@geneindrive.com
              </a>
            </div>
          </div>
        </div>

        {}
        <div className="border-t border-slate-200 dark:border-surface-700 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {}
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © {new Date().getFullYear()} Gene's InDrive. All rights reserved.
            </p>

            {}
            <div className="flex items-center gap-4">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-accent-400 transition-colors" aria-label="LinkedIn">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;