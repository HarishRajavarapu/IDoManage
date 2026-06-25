import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, Cpu, Shield, Database } from "lucide-react";

export default function ThreeDCore() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTask, setActiveTask] = useState<string>("Initializing Core...");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040c, 0.04);

    // --- CAMERA SETUP ---
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    // --- RENDERER ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // --- LIGHTS ---
    const ambientLight = new THREE.AmbientLight(0x1e1b4b, 1.2);
    scene.add(ambientLight);

    const pointLightPurple = new THREE.PointLight(0xa855f7, 4, 30);
    pointLightPurple.position.set(-4, 3, 2);
    scene.add(pointLightPurple);

    const pointLightBlue = new THREE.PointLight(0x3b82f6, 4, 30);
    pointLightBlue.position.set(4, -3, 2);
    scene.add(pointLightBlue);

    const centerGlowLight = new THREE.PointLight(0xffffff, 3, 10);
    centerGlowLight.position.set(0, 0, 0);
    scene.add(centerGlowLight);

    // --- CENTRAL AI CORE ---
    // 1. Inner Core (Glowing Sphere)
    const innerCoreGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const innerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    scene.add(innerCore);

    // 2. Middle Pulsing Shield
    const middleCoreGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const middleCoreMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      emissive: 0xa855f7,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.9,
      ior: 1.5,
    });
    const middleCore = new THREE.Mesh(middleCoreGeo, middleCoreMat);
    scene.add(middleCore);

    // 3. Outer Morphing Geometric Wireframe Shell
    const outerCoreGeo = new THREE.IcosahedronGeometry(1.85, 2);
    // Keep a copy of original positions for mathematical morphing
    const originalPositions = outerCoreGeo.attributes.position.clone();
    const outerCoreMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const outerCore = new THREE.Mesh(outerCoreGeo, outerCoreMat);
    scene.add(outerCore);

    // 4. Gimbal Rings
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const ringGeo1 = new THREE.TorusGeometry(2.3, 0.015, 8, 64);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.012, 8, 64);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);

    // --- SWIRLING COSMIC PARTICLES (VORTEX) ---
    const particleCount = 1400;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    const colorsList = [
      new THREE.Color(0x7c3aed), // purple
      new THREE.Color(0x3b82f6), // blue
      new THREE.Color(0xa855f7), // light purple
      new THREE.Color(0xffffff), // white
    ];

    // Array of particle metadata for orbital math
    const particlesData: {
      angle: number;
      speed: number;
      distance: number;
      verticalDrift: number;
    }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 5.5 + 2.2;
      const speed = (0.002 + Math.random() * 0.006) * (Math.random() > 0.5 ? 1 : -1);
      const verticalDrift = (Math.random() - 0.5) * 1.5;

      particlesData.push({ angle, speed, distance, verticalDrift });

      const x = Math.cos(angle) * distance;
      const y = verticalDrift;
      const z = Math.sin(angle) * distance;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const randomColor = colorsList[Math.floor(Math.random() * colorsList.length)];
      particleColors[i * 3] = randomColor.r;
      particleColors[i * 3 + 1] = randomColor.g;
      particleColors[i * 3 + 2] = randomColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    // Simple procedural circular particle map
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 16;
    pCanvas.height = 16;
    const pCtx = pCanvas.getContext("2d");
    if (pCtx) {
      const grad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.3, "rgba(255,255,255,0.8)");
      grad.addColorStop(1, "rgba(255,255,255,0)");
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.065,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- ORBITING WEBGL TASK CARDS ---
    const taskTitles = [
      "Decompose Strategy Goal",
      "Trigger AI Recovery Mode",
      "Process Syllabus Material",
      "Sync Google Workspace",
      "Predict Deadline Risks",
    ];

    const cardGroup = new THREE.Group();
    scene.add(cardGroup);

    const cards: {
      mesh: THREE.Mesh;
      angle: number;
      speed: number;
      radius: number;
      height: number;
    }[] = [];

    // Helper to generate a text texture for floating card
    const createCardTexture = (text: string) => {
      const cardCanvas = document.createElement("canvas");
      cardCanvas.width = 256;
      cardCanvas.height = 96;
      const ctx = cardCanvas.getContext("2d");
      if (ctx) {
        // Transparent back with beautiful sleek glass border
        ctx.fillStyle = "rgba(12, 16, 36, 0.85)";
        ctx.roundRect ? ctx.roundRect(4, 4, 248, 88, 12) : ctx.rect(4, 4, 248, 88);
        ctx.fill();

        ctx.strokeStyle = "rgba(124, 58, 237, 0.4)";
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner left visual strip
        ctx.fillStyle = "#a855f7";
        ctx.roundRect ? ctx.roundRect(10, 12, 6, 72, 3) : ctx.rect(10, 12, 6, 72);
        ctx.fill();

        // Title text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px system-ui, sans-serif";
        ctx.fillText(text, 26, 38);

        // Subtext / metadata
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.font = "9px system-ui, monospace";
        ctx.fillText("LIFEOS AI AGENT BLOCK", 26, 56);
        ctx.fillStyle = "rgba(59, 130, 246, 0.9)";
        ctx.fillText("● SYSTEM ONLINE", 26, 72);
      }
      const texture = new THREE.CanvasTexture(cardCanvas);
      return texture;
    };

    // Instantiate orbiting card planes
    taskTitles.forEach((title, index) => {
      const cardTex = createCardTexture(title);
      const cardMat = new THREE.MeshBasicMaterial({
        map: cardTex,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide,
      });
      // 2.2 : 0.85 aspect ratio
      const cardGeo = new THREE.PlaneGeometry(1.9, 0.7);
      const cardMesh = new THREE.Mesh(cardGeo, cardMat);
      
      const angle = (index / taskTitles.length) * Math.PI * 2;
      const radius = 4.2;
      const height = (index % 2 === 0 ? 0.8 : -0.8) + (Math.random() - 0.5) * 0.3;
      const speed = 0.0035;

      cards.push({ mesh: cardMesh, angle, speed, radius, height });
      cardGroup.add(cardMesh);
    });

    // --- MOUSE PARALLAX EFFECT ---
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      targetMouseY = -(((event.clientY - rect.top) / container.clientHeight) * 2 - 1);
    };
    container.addEventListener("mousemove", handleMouseMove);

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- ANIMATION LOOP ---
    let clock = new THREE.Clock();
    let animationFrameId: number;

    // Local array to cycle active task state on floating overlay
    const statusCycle = [
      "Analyzing performance vectors...",
      "Synthesizing workflow targets...",
      "Connecting Gmail action items...",
      "Triggering Deep Work blocks...",
      "Ready to Deconstruct Goals",
    ];
    let statusIndex = 0;
    let lastStatusChange = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const time = clock.getElapsedTime();

      // 1. Cycle status text on UI overlay periodically
      if (time - lastStatusChange > 4) {
        statusIndex = (statusIndex + 1) % statusCycle.length;
        setActiveTask(statusCycle[statusIndex]);
        lastStatusChange = time;
      }

      // 2. Animate central AI core
      innerCore.rotation.y = time * 0.25;
      middleCore.rotation.z = -time * 0.15;
      middleCore.scale.setScalar(1 + Math.sin(time * 3) * 0.04); // subtle pulse

      // 3. Mathematical morphing outer core (sine wave distortion)
      const positions = outerCoreGeo.attributes.position;
      const original = originalPositions;
      
      for (let i = 0; i < positions.count; i++) {
        const x = original.getX(i);
        const y = original.getY(i);
        const z = original.getZ(i);

        // Apply 3D wave-noise distortion to wireframe vertices
        const wave = Math.sin(x * 1.5 + time * 1.8) * 
                     Math.cos(y * 1.5 + time * 1.5) * 
                     Math.sin(z * 1.5 + time * 2) * 0.14;

        positions.setXYZ(
          i,
          x + (x * wave),
          y + (y * wave),
          z + (z * wave)
        );
      }
      positions.needsUpdate = true;
      outerCore.rotation.y = time * 0.4;
      outerCore.rotation.x = time * 0.2;

      // 4. Gimbal rings
      ring1.rotation.z = time * 0.15;
      ring2.rotation.x = time * 0.12;

      // 5. Orbiting particles (vortex)
      const particlePosAttr = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        const pData = particlesData[i];
        pData.angle += pData.speed;

        // Wave orbit distortion
        const currentDistance = pData.distance + Math.sin(time * 1.2 + pData.distance) * 0.12;
        const x = Math.cos(pData.angle) * currentDistance;
        const z = Math.sin(pData.angle) * currentDistance;
        const y = pData.verticalDrift + Math.sin(time * 0.8 + pData.angle) * 0.25;

        particlePosAttr.setXYZ(i, x, y, z);
      }
      particlePosAttr.needsUpdate = true;
      particleSystem.rotation.y = time * 0.04;

      // 6. Orbiting task cards
      cards.forEach((card) => {
        card.angle += card.speed;

        const cardX = Math.cos(card.angle) * card.radius;
        const cardZ = Math.sin(card.angle) * card.radius;
        const cardY = card.height + Math.sin(time + card.angle) * 0.2;

        card.mesh.position.set(cardX, cardY, cardZ);
        
        // Make cards billboard / face the camera
        card.mesh.lookAt(camera.position);

        // Subtly fade out cards when they are behind the central core
        if (cardZ < -0.5) {
          (card.mesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
            (card.mesh.material as THREE.MeshBasicMaterial).opacity,
            0.35,
            0.1
          );
        } else {
          (card.mesh.material as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
            (card.mesh.material as THREE.MeshBasicMaterial).opacity,
            0.95,
            0.1
          );
        }
      });

      // 7. Smooth Mouse Parallax camera tracking
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;

      camera.position.x = currentMouseX * 1.8;
      camera.position.y = currentMouseY * 1.5;
      camera.lookAt(0, 0, 0);

      // Render scene
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#02040c]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      
      {/* Visual Ambient Depth Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050816] via-transparent to-[#050816]/70 pointer-events-none" />

      {/* Glassmorphic AI Status overlay in top corners */}
      <div className="absolute top-4 left-4 z-10 hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md animate-pulse">
        <Cpu className="w-3.5 h-3.5 text-[#3b82f6]" />
        <span className="text-[10px] font-mono tracking-wider text-white/75 uppercase">{activeTask}</span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 hidden md:flex items-center gap-3.5 px-3 py-1.5 bg-black/40 border border-white/5 rounded-xl backdrop-blur-md text-[10px] text-white/50 font-mono">
        <div className="flex items-center gap-1">
          <Database className="w-3 h-3 text-[#7c3aed]" />
          <span>Core: active</span>
        </div>
        <div className="flex items-center gap-1">
          <Shield className="w-3 h-3 text-green-400" />
          <span>Sandboxed</span>
        </div>
      </div>
    </div>
  );
}

