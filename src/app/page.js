'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Figure8Particles = dynamic(() => import('../components/Figure8Particles'), { ssr: false });

export default function Home() {
  const [thickness, setThickness] = useState(0.5);

  return (
    <div className="min-h-screen relative">
      <Figure8Particles thickness={thickness} />
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 p-4 rounded-lg">
        <input
          type="range"
          min="0.1"
          max="5" // You can increase this value for even thicker shapes
          step="0.1"
          value={thickness}
          onChange={(e) => setThickness(parseFloat(e.target.value))}
          className="w-64"
        />
        <p className="text-white text-center mt-2">Thickness: {thickness.toFixed(1)}</p>
      </div>
    </div>
  );
}
