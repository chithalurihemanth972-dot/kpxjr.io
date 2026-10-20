import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { COLORS, Glow, hasWebGL, Metal, RBox, Studio, useShadowTexture } from "./Robot3D";

/* ═══════════════════════════════════════════════════════════════
   WarBot3D — "Rynox", the 15 kg War Bot.

   A 15 kg combat robot: low hardened chassis, wedge front, two
   drum wheels and a full-width spinning weapon bar. Built from
   primitives like every other model on this site.
   ═══════════════════════════════════════════════════════════════ */

const SHELL = "#2b3040";
const SHELL_DARK = "#181c27";
const STEEL = "#aab2c4";

/** Drum wheel — a wide cylinder with visible tread teeth. */
function Drum({ position, spin }: { position: [number, number, number]; spin: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.z -= dt * (spin.current ?? 1) * 3;
  });
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.42, 0.42, 0.3, 32]} />
          <meshStandardMaterial color="#15171f" roughness={0.86} />
        </mesh>
        {/* drive hub */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.05, 24]} />
          <meshStandardMaterial color={STEEL} roughness={0.32} metalness={1} />
        </mesh>
        {/* tread teeth so the drum reads as it turns */}
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.41, 0, Math.sin(a) * 0.41]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.07, 0.32, 0.1]} />
              <meshStandardMaterial color="#23283a" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** The spinning weapon bar on top. */
function Weapon({ spin }: { spin: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.y += dt * (spin.current ?? 1) * 6;
  });
  return (
    <group ref={ref} position={[0.1, 0.62, 0]}>
      {/* hub */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.18, 0.22, 20]} />
        <meshStandardMaterial color={STEEL} roughness={0.3} metalness={1} />
      </mesh>
      {/* bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[1.5, 0.09, 0.16]} />
        <meshStandardMaterial color="#d7dce8" roughness={0.22} metalness={1} />
      </mesh>
      {/* hardened weapon tips */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.78, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.1, 0.2, 16]} />
          <meshStandardMaterial color="#8f97a8" roughness={0.18} metalness={1} />
        </mesh>
      ))}
      {/* spinner glow */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.34, 28]} />
        <Glow color={COLORS.sun} intensity={2.4} />
      </mesh>
    </group>
  );
}

export function WarBot({ still = true }: { still?: boolean }) {
  const shadowTex = useShadowTexture();
  const spin = useRef(still ? 0 : 1);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} scale={[3.6, 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      <group rotation={[0, -0.55, 0]} position={[0, 0, 0]}>
        {/* main chassis */}
        <RBox size={[2.1, 0.42, 1.25]} radius={0.12} position={[0, 0.05, 0]}>
          <meshStandardMaterial color={SHELL} roughness={0.45} metalness={0.55} />
        </RBox>
        {/* lower armour skirt */}
        <RBox size={[2.2, 0.16, 1.35]} radius={0.06} position={[0, -0.16, 0]}>
          <meshStandardMaterial color={SHELL_DARK} roughness={0.62} metalness={0.4} />
        </RBox>

        {/* wedge front — a tilted plate that rides up over the opponent */}
        <group position={[1.12, 0.16, 0]} rotation={[0, 0, -0.42]}>
          <RBox size={[0.9, 0.1, 1.18]} radius={0.04}>
            <meshStandardMaterial color={STEEL} roughness={0.24} metalness={1} />
          </RBox>
        </group>

        {/* drum wheels */}
        {[-1, 1].map((side) => (
          <Drum key={side} position={[-0.1, -0.3, side * 0.78]} spin={spin} />
        ))}

        {/* weapon assembly */}
        <Weapon spin={spin} />

        {/* electronics pod + status strip */}
        <RBox size={[0.62, 0.3, 0.62]} radius={0.07} position={[-0.72, 0.4, 0]}>
          <meshStandardMaterial color={SHELL_DARK} roughness={0.55} metalness={0.35} />
        </RBox>
        <mesh position={[-0.72, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.14, 20]} />
          <Glow color={COLORS.mint} intensity={2.2} />
        </mesh>

        {/* front bumper bar */}
        <mesh position={[1.02, -0.14, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 1.3, 14]} />
          <Metal />
        </mesh>
      </group>
    </group>
  );
}

export default function WarBot3D({ className }: { className?: string }) {
  const [ok] = useState(hasWebGL);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      {ok && (
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: [0, 1.7, 5.8], fov: 30 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
        >
          <Studio />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3, 5, 4]} intensity={2.1} />
          <pointLight position={[-4, 1, -2]} intensity={45} color="#5B7CFF" />
          <pointLight position={[3.5, -1, 3]} intensity={14} color="#FFC857" />
          <WarBot />
        </Canvas>
      )}
    </div>
  );
}
