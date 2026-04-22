import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../sections/HeroSection';
import MenuSection from '../sections/MenuSection';
import AboutSection from '../sections/AboutSection';
import ReservationSection from '../sections/ReservationSection';
import ContactSection from '../sections/ContactSection';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <MenuSection />
        <AboutSection />
        <ReservationSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
