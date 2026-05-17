'use client';

import { useEffect, useState } from 'react';

import styles from './landing.module.css';

import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import HowItWorks from './HowItWorks';
import Pricing from './Pricing';
import CTA from './CTA';
import Footer from './Footer';
import MobileLanding from './MobileLanding';

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!mounted) {
        return <div className={styles.loadingScreen} />;
    }

    return (
        <>
            {/* DESKTOP */}
            <div className={styles.desktopOnly}>
                <main className={styles.lp}>
                    <div className={styles.gridBg} />
                    <div className={styles.glowTopLeft} />

                    <Navbar
                        scrolled={scrolled}
                        menuOpen={menuOpen}
                        setMenuOpen={setMenuOpen}
                    />

                    <Hero />
                    <Features />
                    <HowItWorks />
                    <Pricing />
                    <CTA />
                    <Footer />
                </main>
            </div>

            {/* MOBILE APP EXPERIENCE */}
            <div className={styles.mobileOnly}>
                <MobileLanding />
            </div>
        </>
    );
}