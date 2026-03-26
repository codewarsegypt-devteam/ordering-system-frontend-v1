import React from "react";

const Footer = () => {
  return (
    <div>
      {" "}
      <footer className="border-t border-slate-200 bg-white px-8 py-12 text-sm text-slate-600">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
          <div className="col-span-2">
            <p className="mb-3 text-xl font-bold text-slate-900">Qrixa</p>
            <p className="max-w-xs">
              The Precision Concierge Architecture for hospitality leaders.
            </p>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">Product</p>
            <ul className="space-y-2">
              <li>Features</li>
              <li>Pricing</li>
              <li>Integrations</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">Resources</p>
            <ul className="space-y-2">
              <li>Documentation</li>
              <li>Help Center</li>
              <li>Community</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">Company</p>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>Careers</li>
              <li>Contact</li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-slate-900">Legal</p>
            <ul className="space-y-2">
              <li>Privacy</li>
              <li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-200 pt-6 text-xs text-slate-500">
          © 2024 Qrixa. Precision Concierge Architecture.
        </div>
      </footer>
    </div>
  );
};

export default Footer;
