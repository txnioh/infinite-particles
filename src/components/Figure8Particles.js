'use client'

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const PARTICLE_COUNT = 3000;
const BACKGROUND_PARTICLE_COUNT = 1000;

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

    // Adjust camera position to be 90 degrees to the left
    camera.position.x = -80; // Set initial camera position farther away
    camera.position.y = 0;   // Keep vertical position centered
    camera.position.z = 0;   // Move camera forward in z-axis
    camera.lookAt(0, 0, 0);  // Make camera look at the center of the scene

    const targetCameraPosition = new THREE.Vector3(-40, 0, 0);
    let cameraAnimationComplete = false;

    const curve = new THREE.Curve();
    curve.getPoint = (t) => {
      const a = 3; // Increased from 2.5 to 3 for a rounder shape
      const b = 4.5; // Decreased from 5 to 4.5 for a thicker shape
      const x = (a + b * Math.cos(2 * Math.PI * t)) * Math.cos(2 * Math.PI * t);
      const y = (a + b * Math.cos(2 * Math.PI * t)) * Math.sin(2 * Math.PI * t);
      const z = b * Math.sin(2 * Math.PI * t);
      return new THREE.Vector3(x, y, z).multiplyScalar(1.8); // Slightly reduced from 2 to 1.8
    };

    // Main infinity shape particles
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const initialOffsets = new Float32Array(PARTICLE_COUNT);
    const radialOffsets = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = i / PARTICLE_COUNT;
      const point = curve.getPoint(t);
      const angle = Math.random() * Math.PI * 2;
      const radialOffset = new THREE.Vector3(
        Math.cos(angle),
        Math.sin(angle),
        0
      ).multiplyScalar(Math.random());

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
      size: 0.002, // Increased from 0.1 to 0.12 for slightly larger particles
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.7,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Background particles
    const bgGeometry = new THREE.BufferGeometry();
    const bgPositions = new Float32Array(BACKGROUND_PARTICLE_COUNT * 3);
    const bgColors = new Float32Array(BACKGROUND_PARTICLE_COUNT * 3);

    for (let i = 0; i < BACKGROUND_PARTICLE_COUNT; i++) {
      bgPositions[i * 3] = (Math.random() - 0.5) * 100;
      bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const color = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
      bgColors[i * 3] = color.r;
      bgColors[i * 3 + 1] = color.g;
      bgColors[i * 3 + 2] = color.b;
    }

    bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
    bgGeometry.setAttribute('color', new THREE.BufferAttribute(bgColors, 3));

    const bgMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      sizeAttenuation: true,
      opacity: 0.5,
    });

    const backgroundParticles = new THREE.Points(bgGeometry, bgMaterial);
    scene.add(backgroundParticles);

    const animate = () => {
      requestAnimationFrame(animate);

      // Camera animation
      if (!cameraAnimationComplete) {
        camera.position.lerp(targetCameraPosition, 0.02);
        if (camera.position.distanceTo(targetCameraPosition) < 0.1) {
          cameraAnimationComplete = true;
        }
      }

      const time = Date.now() * 0.00001; // Slowed down the animation speed
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
        ).multiplyScalar(thickness * 1.2); // Increased from thickness to thickness * 1.2
        
        positions[i3] = point.x + radialOffset.x;
        positions[i3 + 1] = point.y + radialOffset.y;
        positions[i3 + 2] = point.z + radialOffset.z;
      }

      geometry.attributes.position.needsUpdate = true;

      // Rotate background particles
      backgroundParticles.rotation.x += 0.0001;
      backgroundParticles.rotation.y += 0.0002;

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
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      controls.dispose();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      bgGeometry.dispose();
      bgMaterial.dispose();
    };
  }, [thickness]);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh', position: 'absolute', zIndex: 1 }} />;
};

export default Figure8Particles;