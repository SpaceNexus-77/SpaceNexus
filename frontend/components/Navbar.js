import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styles from '../styles/Navbar.module.css'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  
  // Detect scrolling to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  
  const navbarClass = `${styles.navbar} ${isScrolled ? styles.scrolled : ''}`;
  
  return (
    <nav className={navbarClass}>
      <div className={styles.container}>
        <Link href="/">
          <div className={styles.logo}>
            <span className={styles.logoText}>SpaceNexus</span>
          </div>
        </Link>
        
        <div className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        <ul className={`${styles.navLinks} ${isMobileMenuOpen ? styles.active : ''}`}>
          <li className={router.pathname === '/' ? styles.active : ''}>
            <Link href="/">Home</Link>
          </li>
          <li className={router.pathname === '/experiments' ? styles.active : ''}>
            <Link href="/experiments">Space Experiments</Link>
          </li>
          <li className={router.pathname === '/postcard' ? styles.active : ''}>
            <Link href="/postcard">Space Postcards</Link>
          </li>
          <li className={router.pathname === '/mining' ? styles.active : ''}>
            <Link href="/mining">Space Mining</Link>
          </li>
          <li className={router.pathname === '/marketplace' ? styles.active : ''}>
            <Link href="/marketplace">NFT Marketplace</Link>
          </li>
          <li className={styles.wallet}>
            <button className={styles.walletButton}>Connect Wallet</button>
          </li>
        </ul>
      </div>
    </nav>
  );
} 