import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { COLORS, hasWebGL, makeGearGeometry, RBox, Studio } from "./Robot3D";
import { Rover } from "./Rover3D";
import ArduinoUno3D from "./ArduinoUno3D";

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

/* ── Level 2: a realistic Arduino Uno ────────────────────────── */
function Board({ color }: { color: string }) {
  return <ArduinoUno3D color={color} />;
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
          {level === 2 ? (
            /* Level 2 shows a real Arduino board, so it gets neutral
               product lighting instead of the neon wash — the LEDs and
               the cyan rim keep the scene's identity. */
            <>
              <ambientLight intensity={0.5} />
              <directionalLight position={[3.5, 5, 4]} intensity={2.5} />
              <directionalLight position={[-4, 2, -3]} intensity={0.9} color="#BFD4FF" />
              <pointLight position={[3.5, -1.5, 3]} intensity={9} color="#FFC857" />
              <pointLight position={[-3, 1, 2]} intensity={14} color={color} />
            </>
          ) : (
            <>
              <ambientLight intensity={0.25} />
              <directionalLight position={[3.5, 4.5, 4]} intensity={2.2} />
              <pointLight position={[-4, 1.5, -2]} intensity={55} color={color} />
              <pointLight position={[3.5, -1.5, 3]} intensity={12} color="#FFC857" />
            </>
          )}
          <Scene key={level} level={level} color={color} />
        </Canvas>
      )}
    </div>
  );
}
