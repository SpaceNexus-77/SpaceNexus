import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>SpaceNexus - Web3 Space Innovation Platform</title>
        <meta name="description" content="Web3 Innovation Platform Connecting Earth and Space" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>SpaceNexus</h1>
        <p className={styles.description}>Web3 Innovation Platform Connecting Earth and Space</p>
        
        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>Space Experiments</h2>
            <p>Launch space experiments via SpaceX rockets</p>
          </div>
          <div className={styles.card}>
            <h2>Space Postcards</h2>
            <p>Send your postcards to space and back to Earth</p>
          </div>
          <div className={styles.card}>
            <h2>Space Mining</h2>
            <p>Invest in asteroid mining robots</p>
          </div>
          <div className={styles.card}>
            <h2>NFT Marketplace</h2>
            <p>Trade space-related NFT assets</p>
          </div>
        </div>
        
        <button className={styles.button}>Buy $SPACE Tokens</button>
      </main>

      <footer className={styles.footer}>
        <p>SpaceNexus &copy; {new Date().getFullYear()} - Science Without Boundaries, Exploring the Universe</p>
      </footer>
    </div>
  )
} 