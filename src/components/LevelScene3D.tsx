import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { COLORS, Glow, hasWebGL, makeGearGeometry, Metal, RBox, Studio, Visor } from "./Robot3D";
import { Rover } from "./Rover3D";

/* ═══════════════════════════════════════════════════════════════
   LevelScene3D — one floating hero object per KPX Jr level.
     1 gears · 2 microcontroller board · 3 Wi-Fi signal · 4 rover
   Everything is built from primitives in the level's colour.
   ═══════════════════════════════════════════════════════════════ */

/* Whole-scene float + gentle lean toward the pointer. */
function Floater({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame(({ clock }, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = prefersReducedMotion() ? 0 : clock.elapsedTime;
    const k = 1 - Math.pow(0.002, dt);
    g.position.y = Math.sin(t * 1.2) * 0.16;
    g.rotation.y += (pointer.current.x * 0.5 - g.rotation.y) * k;
    g.rotation.x += (pointer.current.y * 0.25 - g.rotation.x) * k;
  });
  return <group ref={ref}>{children}</group>;
}

const Accent = ({ color, rough = 0.3 }: { color: string; rough?: number }) => (
  <meshPhysicalMaterial color={color} roughness={rough} metalness={0.35} clearcoat={0.9} clearcoatRoughness={0.2} />
);

/* ── Level 1: three meshing gears ───────────────────────────── */
function SpinGear({ pos, scale, speed, color }: { pos: [number, number, number]; scale: number; speed: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeGearGeometry(12, 0.5, 0.4, 0.14, 0.2), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => {
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} geometry={geo} position={pos} scale={scale}>
      <Accent color={color} />
    </mesh>
  );
}
function Gears({ color }: { color: string }) {
  return (
    <group rotation={[0.2, -0.35, 0]}>
      <SpinGear pos={[0, 0, 0]} scale={2.1} speed={0.3} color={color} />
      <SpinGear pos={[1.55, 0.95, 0.05]} scale={1.1} speed={-0.55} color="#EEF1FA" />
      <SpinGear pos={[-1.35, -1.15, 0.05]} scale={0.95} speed={-0.63} color={COLORS.sun} />
    </group>
  );
}

/* ── Level 2: microcontroller board ─────────────────────────── */
function Board({ color }: { color: string }) {
  const pins = useMemo(() => Array.from({ length: 12 }, (_, i) => -1.3 + i * 0.236), []);
  return (
    <group rotation={[0.85, -0.55, 0.12]} scale={1.05}>
      <RBox size={[3.4, 0.12, 2.2]} radius={0.05}>
        <meshPhysicalMaterial color="#0d2e55" roughness={0.4} metalness={0.3} clearcoat={0.8} />
      </RBox>
      {/* accent traces */}
      {[-0.55, 0, 0.55].map((z) => (
        <mesh key={z} position={[0.2, 0.07, z]}>
          <boxGeometry args={[1.6, 0.012, 0.03]} />
          <Glow color={color} intensity={1.4} />
        </mesh>
      ))}
      {/* main chip */}
      <RBox size={[0.95, 0.14, 0.95]} radius={0.05} position={[0.35, 0.13, 0]}>
        <Visor />
      </RBox>
      <mesh position={[0.35, 0.215, 0]}>
        <boxGeometry args={[0.3, 0.012, 0.3]} />
        <Glow color={color} intensity={1.8} />
      </mesh>
      {/* USB port */}
      <RBox size={[0.7, 0.46, 0.62]} radius={0.04} position={[-1.45, 0.28, -0.4]}>
        <Metal />
      </RBox>
      {/* header pins */}
      {pins.map((x) => (
        <group key={x}>
          <mesh position={[x, 0.17, 1.0]}>
            <boxGeometry args={[0.1, 0.22, 0.1]} />
            <meshStandardMaterial color="#10142a" />
          </mesh>
          <mesh position={[x, 0.17, -1.0]}>
            <boxGeometry args={[0.1, 0.22, 0.1]} />
            <meshStandardMaterial color="#10142a" />
          </mesh>
        </group>
      ))}
      {/* status LEDs */}
      {[color, COLORS.sun, COLORS.mint].map((c, i) => (
        <mesh key={c} position={[-0.7 + i * 0.28, 0.1, 0.62]}>
          <boxGeometry args={[0.16, 0.06, 0.1]} />
          <Glow color={c} intensity={2.6} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Level 3: a 3D Wi-Fi signal ─────────────────────────────── */
function Arc({ radius, delay, color }: { radius: number; delay: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = prefersReducedMotion() ? 99 : clock.elapsedTime;
    const m = ref.current.material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = 0.7 + Math.max(0, Math.sin(t * 2.4 - delay * 2.2)) * 3;
  });
  return (
    <mesh ref={ref} rotation={[0, 0, Math.PI / 4]}>
      <torusGeometry args={[radius, 0.11, 24, 64, Math.PI / 2]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} toneMapped={false} />
    </mesh>
  );
}
function Wifi({ color }: { color: string }) {
  return (
    <group position={[0, -0.9, 0]} rotation={[0.1, -0.3, 0]}>
      <mesh>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      <Arc radius={0.85} delay={0} color={color} />
      <Arc radius={1.5} delay={1} color={color} />
      <Arc radius={2.15} delay={2} color={color} />
    </group>
  );
}

/* ── Level 4: finished rover surrounded by build modules ────── */
function Modules({ color }: { color: string }) {
  const refs = [useRef<THREE.Group>(null), useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const cols = [color, COLORS.sun, COLORS.mint];
  useFrame(({ clock }) => {
    const t = prefersReducedMotion() ? 0 : clock.elapsedTime;
    refs.forEach((r, i) => {
      if (!r.current) return;
      const a = t * 0.5 + (i * Math.PI * 2) / 3;
      r.current.position.set(Math.cos(a) * 1.75, 1.0 + Math.sin(t * 1.4 + i) * 0.25, Math.sin(a) * 0.8 - 0.4);
      r.current.rotation.set(t * 0.6 + i, t * 0.4, 0);
    });
  });
  return (
    <>
      {refs.map((r, i) => (
        <group key={i} ref={r}>
          <RBox size={[0.5, 0.5, 0.5]} radius={0.1}>
            <Accent color={cols[i]} />
          </RBox>
        </group>
      ))}
    </>
  );
}

function Scene({ level, color }: { level: number; color: string }) {
  return (
    <Floater>
      {level === 1 && <Gears color={color} />}
      {level === 2 && <Board color={color} />}
      {level === 3 && <Wifi color={color} />}
      {level === 4 && (
        <group scale={1.25} position={[0, -0.2, 0]}>
          <Rover kind="mafiya" still />
          <Modules color={color} />
        </group>
      )}
    </Floater>
  );
}

export default function LevelScene3D({ level, color, className }: { level: number; color: string; className?: string }) {
  const [ok] = useState(hasWebGL);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      {ok && (
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 0.4, 7.2], fov: 32 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Studio />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3.5, 4.5, 4]} intensity={2.2} />
          <pointLight position={[-4, 1.5, -2]} intensity={55} color={color} />
          <pointLight position={[3.5, -1.5, 3]} intensity={12} color="#FFC857" />
          <Scene key={level} level={level} color={color} />
        </Canvas>
      )}
    </div>
  );
}
