import React from 'react';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from 'react-router-dom';

export default function Score() {
  const navigate = useNavigate();
  return (
    
    <div id="webcrumbs"> 
    <Navigation />
      <div className="mt-20 w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-4xl w-full text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6">
              Choose Your Role
            </h1>
            <p className="text-xl text-slate-600 mb-12">
              Select whether you're organizing events or participating as a player
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
            <button 
              className="group relative bg-gradient-to-br from-pink-900 to-red-500 hover:from-red-900 hover:to-black text-white rounded-3xl p-8 md:p-12 w-full h-48 md:h-56 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              onClick={() => navigate('/player/score-tournaments')}

            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {/* <div className="bg-white/20 rounded-full p-4 mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <span className="material-symbols-outlined text-4xl">sports_esports</span>
                </div> */}
                <span className="text-2xl md:text-3xl font-bold">Player</span>
                <span className="text-green-100 mt-2 text-sm md:text-base">Join & compete in events</span>
              </div>
            </button>

            <button 
              className="group relative bg-gradient-to-br from-orange-500 to-red-500 hover:from-yellow-600 hover:to-black text-white rounded-3xl p-8 md:p-12 w-full h-48 md:h-56 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
              onClick={() => {window.location.href = '/player/organizations'}}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                {/* <div className="bg-white/20 rounded-full p-4 mb-4 group-hover:bg-white/30 transition-all duration-300">
                  <span className="material-symbols-outlined text-4xl">event_available</span>
                </div> */}
                <span className="text-2xl md:text-3xl font-bold">Organizer</span>
                <span className="text-blue-100 mt-2 text-sm md:text-base">Manage events</span>
              </div>
            </button>

            
          </div>

          <div className="mt-16 text-center">
            <p className="text-slate-500 mb-4">Need help deciding?</p>
            <button className="text-primary-500 hover:text-primary-600 font-medium underline underline-offset-4 transition-colors">
              Learn more about roles
            </button>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-30 -z-10"></div>
      </div> 
      <Footer />
    </div>
  );
}
