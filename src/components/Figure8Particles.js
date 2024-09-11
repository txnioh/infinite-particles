'use client'

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PARTICLE_COUNT = 8000; // Increased for better volume

const Figure8Particles = ({ thickness }) => {
  const containerRef = useRef();

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const curve = new THREE.Curve();
    curve.getPoint = (t) => {
      const a = 2.5;
      const b = 5;
      const x = (a + b * Math.cos(2 * Math.PI * t)) * Math.cos(2 * Math.PI * t);
      const y = (a + b * Math.cos(2 * Math.PI * t)) * Math.sin(2 * Math.PI * t);
      const z = b * Math.sin(2 * Math.PI * t);
      return new THREE.Vector3(x, y, z).multiplyScalar(0.7);
    };

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const initialOffsets = new Float32Array(PARTICLE_COUNT);
    const radialOffsets = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / PARTICLE_COUNT;
      const point = curve.getPoint(t);
      const radialOffset = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      
      positions[i * 3] = point.x;
      positions[i * 3 + 1] = point.y;
      positions[i * 3 + 2] = point.z;
      initialOffsets[i] = Math.random();
      radialOffsets[i * 3] = radialOffset.x;
      radialOffsets[i * 3 + 1] = radialOffset.y;
      radialOffsets[i * 3 + 2] = radialOffset.z;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('initialOffset', new THREE.BufferAttribute(initialOffsets, 1));
    geometry.setAttribute('radialOffset', new THREE.BufferAttribute(radialOffsets, 3));

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.02,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.5,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 14;

    const animate = () => {
      requestAnimationFrame(animate);

      const time = Date.now() * 0.00001;
      const positions = geometry.attributes.position.array;
      const initialOffsets = geometry.attributes.initialOffset.array;
      const radialOffsets = geometry.attributes.radialOffset.array;

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const i3 = i * 3;
        const t = ((initialOffsets[i] + time) % 1 + 1) % 1;
        const point = curve.getPoint(t);
        const radialOffset = new THREE.Vector3(
          radialOffsets[i3],
          radialOffsets[i3 + 1],
          radialOffsets[i3 + 2]
        ).multiplyScalar(thickness);
        
        positions[i3] = point.x + radialOffset.x;
        positions[i3 + 1] = point.y + radialOffset.y;
        positions[i3 + 2] = point.z + radialOffset.z;
      }

      geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current.removeChild(renderer.domElement);
      controls.dispose();
    };
  }, [thickness]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default Figure8Particles;