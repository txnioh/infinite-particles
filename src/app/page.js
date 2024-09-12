'use client'

import dynamic from 'next/dynamic';
import styles from './page.module.css';

const Figure8Particles = dynamic(() => import('../components/Figure8Particles'), { ssr: false });

export default function Home() {
  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
        <p className={styles.subText}>allow yourself to be infinite.</p>
      </div>
      <client-only>
        <Figure8Particles thickness={1.6} />
      </client-only>
    </div>
  );
}
