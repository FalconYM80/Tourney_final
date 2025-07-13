import React, { useEffect } from 'react'

import HeroSection from '../Components/HeroSection'


import { AppContext } from '../Contexts/AppContext/AppContext'
import { useContext } from 'react'
import { toast } from 'react-toastify'


import HomeTournamentsSection from './HomeTournamentsSection'
import Footer from "@/components/Footer";


const Home = () => {

  const { updateTournamentStatus } = useContext(AppContext);



  useEffect(() => {
    updateTournamentStatus();
  }, []);


  return (
    <>
      <HeroSection/>
      <HomeTournamentsSection/>
      <Footer/>
    </>
  )
}

export default Home
