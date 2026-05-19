import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function StarfieldCanvas() {
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
    // camera always faces -z direction — rock solid baseline
    camera.lookAt(0, 0, -1);

    const BASELINE_AREA = 1920 * 1080;
    const BASELINE_STARS = 10000;

    function calculateStarCount() {
      const currentArea = window.innerWidth * window.innerHeight;
      return Math.round(BASELINE_STARS * (currentArea / BASELINE_AREA));
    }

    const TOTAL = calculateStarCount();
    const positions  = new Float32Array(TOTAL * 3);
    const sizes      = new Float32Array(TOTAL);
    const opacities  = new Float32Array(TOTAL);
    const shapes     = new Float32Array(TOTAL);

    for (let i = 0; i < TOTAL; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
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

          // 视差同向映射：确保往下滚时星星统一向上偏移
          float depth = clamp(1.0 - (abs(position.z) / 2000.0), 0.1, 1.0);

          // 基础惯性视差
          float parallax = depth * uScroll * 0.02;

          // Liminal Drag: 当发生剧烈滚动(高 Velocity)时,
          // 星点会因为"惯性"被微弱地向反方向拉扯。
          // 停止滚动时,因为 Velocity 衰减,星点会像水滴一样弹回原位。
          float dragY = uVelocity * depth * 0.003;
          float dragZ = abs(uVelocity) * depth * 0.01;

          vec3 pos = position;
          pos.y += parallax + dragY;
          pos.z += dragZ;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

          // 光学钳制：最小 0.5，最大 2.5，拒绝大圆饼
          float pointSize = size * (240.0 / -mvPosition.z);
          gl_PointSize = clamp(pointSize, 0.8, 3.5);

          gl_Position  = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vOpacity;
        varying float vShape;

        void main() {
          vec2 uv = gl_PointCoord - vec2(0.5);
          float dist = length(uv);

          // 锐利衰减：系数 12.0，从软光晕变成冷光点
          float alpha = exp(-dist * dist * 12.0);
          vec3 color = vec3(1.0, 1.0, 1.0);

          gl_FragColor = vec4(color, alpha * vOpacity);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    const meteorGroup = new THREE.Group();
    scene.add(meteorGroup);

    const activeMeteors: Array<{
      line: THREE.Line
      material: THREE.LineBasicMaterial
      startTime: number
      duration: number
      startPos: THREE.Vector3
      endPos: THREE.Vector3
      maxAlpha: number
    }> = [];

    let nextSpawnTime = performance.now() + (-Math.log(Math.random()) * 90000);

    function spawnMeteor() {
      const goLeft = Math.random() < 0.5;
      const angleDeg = 15 + Math.random() * 20;
      const angleRad = (angleDeg * Math.PI) / 180;

      const z = -800 - Math.random() * 1000;
      const viewRadius = Math.abs(z) * 0.577;

      const edgeBias = Math.random() < 0.8;
      const xStart = edgeBias
        ? (goLeft ? viewRadius * 0.7 : -viewRadius * 0.7)
        : (Math.random() - 0.5) * viewRadius;
      const yStart = (Math.random() * 0.6 + 0.2) * viewRadius;

      const distance = (0.15 + Math.random() * 0.15) * viewRadius * 2;

      const xEnd = xStart + (goLeft ? -1 : 1) * distance * Math.cos(angleRad);
      const yEnd = yStart - distance * Math.sin(angleRad);

      const startPos = new THREE.Vector3(xStart, yStart, z);
      const endPos = new THREE.Vector3(xEnd, yEnd, z);

      const geometry = new THREE.BufferGeometry().setFromPoints([startPos, startPos]);

      const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });

      const line = new THREE.Line(geometry, material);
      meteorGroup.add(line);

      activeMeteors.push({
        line,
        material,
        startTime: performance.now(),
        duration: 700 + Math.random() * 700,
        startPos,
        endPos,
        maxAlpha: 0.12 + Math.random() * 0.06,
      });
    }

    function updateMeteors(now: number) {
      if (now >= nextSpawnTime && activeMeteors.length < 2) {
        spawnMeteor();
        nextSpawnTime = now + (-Math.log(Math.random()) * 90000);
      }

      for (let i = activeMeteors.length - 1; i >= 0; i--) {
        const m = activeMeteors[i];
        const elapsed = (now - m.startTime) / m.duration;

        if (elapsed >= 1.0) {
          meteorGroup.remove(m.line);
          m.line.geometry.dispose();
          m.material.dispose();
          activeMeteors.splice(i, 1);
          continue;
        }

        const alpha = m.maxAlpha * Math.exp(-5 * Math.pow(elapsed - 0.15, 2));
        m.material.opacity = alpha;

        const headT = elapsed;
        const tailT = Math.max(0, elapsed - 0.3);

        const headPos = new THREE.Vector3().lerpVectors(m.startPos, m.endPos, headT);
        const tailPos = new THREE.Vector3().lerpVectors(m.startPos, m.endPos, tailT);

        m.line.geometry.setFromPoints([tailPos, headPos]);
      }
    }

    // 物理引擎状态
    let targetScroll = window.scrollY;
    let currentScroll = window.scrollY;
    let scrollVelocity = 0;

    // Shader 注入新的物理量
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

      const now = performance.now();
      updateMeteors(now);

      // 黏滞系数 0.08:不是僵硬跟随,而是像在深水中滑动
      const deltaScroll = targetScroll - currentScroll;
      currentScroll += deltaScroll * 0.08;

      // 指数平滑计算真实瞬时速度,并衰减
      scrollVelocity = scrollVelocity * 0.9 + deltaScroll * 0.1;

      material.uniforms.uScroll.value = currentScroll;
      material.uniforms.uVelocity.value = scrollVelocity;

      // 手动旋转 + 粒子循环回收
      const rotSpeed = 0.00008;
      const cosR = Math.cos(rotSpeed);
      const sinR = Math.sin(rotSpeed);
      const positionsArray = geometry.attributes.position.array;

      for (let i = 0; i < TOTAL; i++) {
        const x = positionsArray[i * 3];
        const z = positionsArray[i * 3 + 2];

        // 绕 y 轴旋转
        positionsArray[i * 3]     = x * cosR - z * sinR;
        positionsArray[i * 3 + 2] = x * sinR + z * cosR;

        // 循环回收:转到相机背后(z > 100)→ 传送到最远处
        if (positionsArray[i * 3 + 2] > 100) {
          positionsArray[i * 3]     = (Math.random() - 0.5) * 2000;
          positionsArray[i * 3 + 2] = -2100;
        }
      }
      geometry.attributes.position.needsUpdate = true;

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
