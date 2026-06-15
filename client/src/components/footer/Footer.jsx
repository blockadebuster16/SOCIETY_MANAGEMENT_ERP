import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Clock, ArrowRight, Facebook, Instagram, Youtube } from 'lucide-react';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'About Us', to: '/about' },
  { label: 'Notices', to: '/notices' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'Contact', to: '/contact' },
];

const portalLinks = [
  { label: 'Resident Portal', to: '/resident/dashboard' },
  { label: 'Committee Portal', to: '/admin/dashboard' },
  { label: 'Security Portal', to: '/security/dashboard' },
  { label: 'Member Login', to: '/login' },
];

export function Footer() {
  return (
    <footer className="bg-[#060F1C] text-white">
      {/* Top Golden Divider */}
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-40" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Column 1 – Branding */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center flex-shrink-0">
                <span className="font-black text-sm text-[#0A1628]">SP</span>
              </div>
              <div className="leading-none">
                <div className="font-black text-sm tracking-widest text-white">SUYASH PRIDE</div>
                <div className="text-[8px] tracking-[0.25em] text-[#D4AF37] uppercase mt-0.5">Housing Society Ltd.</div>
              </div>
            </div>
            <p className="text-white/40 text-xs leading-relaxed mb-6">
              A landmark residential community in Ulwe, Navi Mumbai, blending premium living with transparent governance and modern amenities.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center border border-white/10 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white/40 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 – Quick Links */}
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-xs text-white/45 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-3 h-[1px] bg-white/20 group-hover:bg-[#D4AF37] group-hover:w-5 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 – Resident Portal */}
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Resident Portal</h4>
            <ul className="space-y-3">
              {portalLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group flex items-center gap-2 text-xs text-white/45 hover:text-white transition-colors duration-200"
                  >
                    <span className="w-3 h-[1px] bg-white/20 group-hover:bg-[#D4AF37] group-hover:w-5 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase border-b border-[#D4AF37]/30 hover:border-[#D4AF37] pb-1 transition-all"
              >
                Access Portal
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Column 4 – Contact */}
          <div>
            <h4 className="text-[10px] font-black tracking-[0.3em] uppercase text-[#D4AF37] mb-6">Contact</h4>
            <ul className="space-y-5">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/45 leading-relaxed">Plot-1, Sector-5, Ulwe Node, Wahal, Navi Mumbai, Maharashtra 410206</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/45">Sat &amp; Sun: 10:00 AM – 1:00 PM</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <a href="mailto:support@suyashpride.org" className="text-xs text-white/45 hover:text-[#D4AF37] transition-colors">
                  support@suyashpride.org
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                <span className="text-xs text-white/45">+91 98765 43210 (Security)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-white/25 tracking-wide">
            © {new Date().getFullYear()} Suyash Pride Housing Society Ltd. All rights reserved.
          </p>
          <p className="text-[10px] text-white/20">
            Sector 18, Ulwe, Navi Mumbai · RERA Compliant
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
