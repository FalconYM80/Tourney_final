import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo and Contact */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold">TOURNEY 24</span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Get in Touch</h3>

              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs">📍</span>
                  </div>
                  <div>
                    <p className="text-sm">8819 Ohio St, South Gate,</p>
                    <p className="text-sm">CA 90280</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs">✉️</span>
                  </div>
                  <p className="text-sm">Outeach@india.com</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center">
                    <span className="text-xs">📞</span>
                  </div>
                  <p className="text-sm">+1-286-468-5755</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <div className="flex space-x-4">
              {["∞", "in", "📷", "🐦"].map((icon, idx) => (
                <div
                  key={idx}
                  className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <span className="text-lg">{icon}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-white/80">Follow Us On Social Media</p>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Get Updates On Your Email</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-2">Your Email</label>
                <Input
                  placeholder="Enter Your Email"
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/60"
                />
              </div>
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
