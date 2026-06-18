import { useState, useEffect, useRef, Suspense, useMemo, Component, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

/* ─── WebGL error boundary ────────────────────────────────────────────────── */

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

/* ─── 3-D character ───────────────────────────────────────────────────────── */

const MODEL_URL = `${import.meta.env.BASE_URL}character/just_a_girl.glb`;
useGLTF.preload(MODEL_URL);

function Character({ mouseX }: { mouseX: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  const normalised = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return clone;
    const s = 2 / maxDim;
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -box.min.y * s, -center.z * s);
    return clone;
  }, [scene]);

  useFrame(() => {
    if (!groupRef.current) return;
    const target = (mouseX.current - 0.5) * Math.PI;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y, target, 0.08
    );
  });

  return (
    <group ref={groupRef} position={[0.8, -0.85, 0]}>
      <primitive object={normalised} />
    </group>
  );
}

function Scene({ mouseX }: { mouseX: React.MutableRefObject<number> }) {
  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[3, 8, 5]} intensity={2} />
      <directionalLight position={[-3, 4, -2]} intensity={0.8} />
      <pointLight position={[0, 4, 3]} intensity={1.2} />
      <Environment preset="studio" />
      <Suspense fallback={null}>
        <Character mouseX={mouseX} />
      </Suspense>
    </>
  );
}

/* ─── navbar ──────────────────────────────────────────────────────────────── */

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-20 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <span className="text-[21px] sm:text-[26px] tracking-tight text-white font-medium select-none drop-shadow-sm">
          Amit
        </span>
      </div>
      <a
        href="https://amitproject15.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:block text-[20px] text-white/90 underline underline-offset-2 hover:opacity-60 transition-opacity drop-shadow-sm"
      >
        About Me
      </a>
      <button
        className="md:hidden flex flex-col gap-[5px] justify-center items-center w-8 h-8 z-20 relative"
        onClick={() => setOpen(v => !v)}
        aria-label="Toggle menu"
      >
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block w-6 h-[2px] bg-white transition-all duration-300 ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
      </button>
      <div className={`md:hidden fixed inset-0 z-[9] bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="flex flex-col items-center justify-center h-full">
          <a
            href="https://amitproject15.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[32px] text-white underline underline-offset-2 hover:opacity-60 transition-opacity"
            onClick={() => setOpen(false)}
          >
            About Me
          </a>
        </div>
      </div>
    </header>
  );
}

/* ─── page ────────────────────────────────────────────────────────────────── */

const BG_VIDEO = `${import.meta.env.BASE_URL}bg-video.mp4`;

export default function Hero() {
  const mouseX = useRef(0.5);

  useEffect(() => {
    const h = (e: MouseEvent) => { mouseX.current = e.clientX / window.innerWidth; };
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  return (
    <div className="relative text-white font-sans antialiased w-screen h-screen bg-black" style={{ overflow: "clip" }}>
      {/* ── full-screen background video ── */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={BG_VIDEO}
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
      />

      {/* ── dark overlay so text/character read well ── */}
      <div className="absolute inset-0 bg-black/40" />

      <Navbar />

      {/* ── 3D character — far right ── */}
      <WebGLErrorBoundary>
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0.6, 2.2], fov: 52 }}
          className="absolute right-0 top-0 w-[44%] h-full pointer-events-none"
          style={{ background: "transparent" }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <Scene mouseX={mouseX} />
        </Canvas>
      </WebGLErrorBoundary>

      {/* ── frosted-glass text card — bottom-left ── */}
      <div className="absolute bottom-10 left-6 sm:left-10 z-10 max-w-sm sm:max-w-md">
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(3px) saturate(120%)",
            WebkitBackdropFilter: "blur(3px) saturate(120%)",
            border: "1px solid rgba(255,255,255,0.20)",
            borderRadius: "1.25rem",
            padding: "1.75rem 2rem",
          }}
        >
          <p className="text-white/60 text-xs tracking-widest uppercase mb-3 font-medium">
            Our Approach
          </p>
          <h2 className="text-white text-2xl sm:text-3xl font-semibold leading-snug tracking-tight">
            Always Ready For Collaboration
          </h2>
        </div>
      </div>
    </div>
  );
}
