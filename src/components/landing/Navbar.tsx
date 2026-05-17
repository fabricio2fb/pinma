'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import styles from './landing.module.css';

type NavbarProps = {
    scrolled: boolean;
    menuOpen: boolean;
    setMenuOpen: Dispatch<SetStateAction<boolean>>;
};

export default function Navbar({
    scrolled,
    menuOpen,
    setMenuOpen,
}: NavbarProps) {
    const links = [
        { href: '#features', label: 'Recursos' },
        { href: '#how', label: 'Como Funciona' },
        { href: '#pricing', label: 'Preços' },
    ];

    return (
        <>
            <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
                <div className={styles.navInner}>
                    <Link href="/" className={styles.navLogo}>
                        <div className={styles.navLogoIcon}>
                            <Image
                                src="/logob.png"
                                alt="AlertLoc"
                                width={38}
                                height={38}
                                priority
                            />
                        </div>

                        <span className={styles.navLogoText}>AlertLoc</span>
                    </Link>

                    <div className={styles.navLinks}>
                        {links.map((link) => (
                            <a key={link.href} href={link.href} className={styles.navLink}>
                                {link.label}
                            </a>
                        ))}

                        <Link href="/login" className={styles.navLinkStrong}>
                            Entrar
                        </Link>

                        <Link href="/login" className={styles.navCta}>
                            Criar conta grátis
                        </Link>
                    </div>

                    <button
                        type="button"
                        className={styles.mobileToggle}
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-label="Abrir menu"
                    >
                        {menuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </nav>

            {menuOpen && (
                <div className={styles.mobileMenu}>
                    <button
                        type="button"
                        className={styles.mobileClose}
                        onClick={() => setMenuOpen(false)}
                        aria-label="Fechar menu"
                    >
                        <X size={30} />
                    </button>

                    {links.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className={styles.mobileMenuLink}
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </a>
                    ))}

                    <Link
                        href="/login"
                        className={styles.mobileMenuCta}
                        onClick={() => setMenuOpen(false)}
                    >
                        Começar agora
                    </Link>
                </div>
            )}
        </>
    );
}