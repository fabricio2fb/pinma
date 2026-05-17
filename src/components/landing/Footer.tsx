import Link from 'next/link';
import Image from 'next/image';

import styles from './landing.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <Link href="/" className={styles.footerLogo}>
                <Image src="/logob.png" alt="AlertLoc" width={32} height={32} />
                <span>AlertLoc</span>
            </Link>

            <p>© {new Date().getFullYear()} AlertLoc. Todos os direitos reservados.</p>
        </footer>
    );
}