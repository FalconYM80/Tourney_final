
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import Navigation from "./Navigation";
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
const navigate = useNavigate();

  return (

    


    <section className="relative min-h-screen bg-black flex items-center justify-center text-white overflow-hidden">
      {/* Background Image with Overlay */}
      
      <Navigation/>
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-black/55"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-8">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in">
            FEEL THE RUSH, LIVE THE ACTION
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Sports Like Never Before
          </p>
          
          {/* CTA Text */}
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-white/80">
              Want To Organize Your Own Events? 
              <span className="text-red-500 ml-2 font-semibold cursor-pointer" onClick={()=>{navigate('/signup/organizer')}}>Click Here →</span>
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link to="/tournaments">
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-4 text-lg cursor-pointer">
                  Explore Tournaments
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Pagination Dots */}
          {/* <div className="flex justify-center space-x-3 mt-12">
            <div className="w-3 h-3 bg-white rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
            <div className="w-3 h-3 bg-white/50 rounded-full"></div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
