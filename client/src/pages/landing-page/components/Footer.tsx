import { Atom, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[oklch(79.2%_0.209_151.711)] rounded-lg flex items-center justify-center">
                <Atom className="w-6 h-6 text-gray-900" />
              </div>
              <span className="text-white">Quantumverse</span>
            </div>
            <p className="text-sm">
              Making quantum mechanics accessible through interactive simulations and proven learning techniques.
            </p>
          </div>

          <div>
            <h3 className="text-white mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Features</a></li>
              <li><a href="#simulations" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Simulations</a></li>
              <li><a href="#pricing" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Pricing</a></li>
              <li><a href="#roadmap" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Roadmap</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#docs" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Documentation</a></li>
              <li><a href="#tutorials" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Tutorials</a></li>
              <li><a href="#blog" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Blog</a></li>
              <li><a href="#support" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Support</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white mb-4">Connect</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[oklch(79.2%_0.209_151.711)] hover:text-gray-900 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[oklch(79.2%_0.209_151.711)] hover:text-gray-900 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[oklch(79.2%_0.209_151.711)] hover:text-gray-900 transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 Quantumverse. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Terms of Service</a>
            <a href="#cookies" className="hover:text-[oklch(79.2%_0.209_151.711)] transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}