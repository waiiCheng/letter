import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StarfieldCanvasCylinder() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    camera.position.z = 0;
    camera.lookAt(0, 0, -1);

    const TOTAL = 2500;
    const positions  = new Float32Array(TOTAL * 3);
    const sizes      = new Float32Array(TOTAL);
    const opacities  = new Float32Array(TOTAL);
    const shapes     = new Float32Array(TOTAL);

    for (let i = 0; i < TOTAL; i++) {
      // 柱形分布
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 1200;
      positions[i * 3]     = radius * Math.cos(angle);
      positions[i * 3 + 1] = radius * Math.sin(angle);
      positions[i * 3 + 2] = -100.0 - Math.random() * 2000;

      sizes[i]     = Math.random() * 4.0 + 2.5;
      opacities[i] = Math.random() * 0.5 + 0.5;
      shapes[i]    = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity',  new THREE.BufferAttribute(opacities, 1));
    geometry.setAttribute('shape',    new THREE.BufferAttribute(shapes, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite:  false,
      uniforms: {
        uScroll: { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute float opacity;
        attribute float shape;
        varying float vOpacity;
        varying float vShape;
        uniform float uScroll;
        uniform float uVelocity;

        void main() {
          vOpacity = opacity;
          vShape   = shape;

          float depth = clamp(1.0 - (abs(position.z) / 2000.0), 0.1, 1.0);
          float parallax = depth * uScroll * 0.02;
          float dragY = uVelocity * depth * 0.003;
          float dragZ = abs(uVelocity) * depth * 0.01;

          vec3 pos = position;
          pos.y += parallax + dragY;
          pos.z += dragZ;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          float pointSize = size * (240.0 / -mvPosition.z);
          gl_PointSize = clamp(pointSize, 1.5, 4.5);

          gl_Position  = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying float vShape;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);

          float alpha = exp(-dist * dist * 12.0);
          vec3 color = vec3(1.0, 1.0, 1.0);

          gl_FragColor = vec4(color, alpha * vOpacity);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let scrollVelocity = 0;

    material.uniforms.uVelocity = { value: 0 };

    const onScroll = () => { targetScroll = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      const deltaScroll = targetScroll - currentScroll;
      currentScroll += deltaScroll * 0.08;
      scrollVelocity = scrollVelocity * 0.9 + deltaScroll * 0.1;

      material.uniforms.uScroll.value = currentScroll;
      material.uniforms.uVelocity.value = scrollVelocity;
      points.rotation.y += 0.00008;
      renderer.render(scene, camera);
    };
    animate();

    setTimeout(() => {
      if (mount) mount.style.opacity = '0.9';
    }, 150);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        background: 'transparent',
        opacity: 0,
        transition: 'opacity 0.5s ease-out',
      }}
    />
  );
}
