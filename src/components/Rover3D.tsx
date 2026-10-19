import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { Blue, COLORS, Glow, hasWebGL, Metal, RBox, Shell, Studio, useShadowTexture, Visor } from "./Robot3D";

/* ═══════════════════════════════════════════════════════════════
   Rover3D — procedural models for the two featured builds.
   "vajra"  : dairy-farm rover with a front scraper blade
   "mafiya" : rocker-bogie chassis with a camera mast
   ═══════════════════════════════════════════════════════════════ */
export type RoverKind = "vajra" | "mafiya";

function Wheel({ position, spin }: { position: [number, number, number]; spin: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.z -= dt * (spin.current ?? 1) * 2.2;
  });
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <group ref={ref}>
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 0.34, 40]} />
          <meshStandardMaterial color="#10142a" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          <Metal />
        </mesh>
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 32]} />
          <Metal />
        </mesh>
        {/* tread blocks give the tyre a visible turn */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.07, 0.36, 0.12]} />
              <meshStandardMaterial color="#1c2246" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export function Rover({ kind, still = true }: { kind: RoverKind; still?: boolean }) {
  const shadowTex = useShadowTexture();
  const spin = useRef(still ? 0 : 1);

  const bogie = kind === "mafiya";
  const wheelX = [-1.0, 0, 1.0];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.82, 0]} scale={[4.2, 2.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      <group rotation={[0, -0.6, 0]} position={[0, 0.1, 0]}>
        {/* chassis */}
        <RBox size={[2.3, 0.5, 1.15]} radius={0.16} position={[0, 0.12, 0]}>
          <Shell />
        </RBox>
        <RBox size={[1.5, 0.22, 0.85]} radius={0.1} position={[-0.1, 0.46, 0]}>
          <Blue />
        </RBox>

        {/* wheels + suspension arms */}
        {[-1, 1].map((side) =>
          wheelX.map((x, i) => (
            <group key={`${side}-${x}`}>
              <Wheel position={[x, -0.42, side * 0.86]} spin={spin} />
              <mesh position={[x * 0.9, bogie ? -0.12 + (i === 1 ? 0.12 : 0) : -0.18, side * 0.7]} rotation={[0, 0, bogie ? (i === 0 ? 0.5 : i === 2 ? -0.5 : 0.1) : 0]}>
                <boxGeometry args={[bogie ? 0.9 : 0.14, 0.09, 0.09]} />
                <Metal />
              </mesh>
            </group>
          ))
        )}

        {bogie ? (
          <>
            {/* camera mast */}
            <mesh position={[0.55, 0.95, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.9, 16]} />
              <Metal />
            </mesh>
            <RBox size={[0.34, 0.24, 0.3]} radius={0.07} position={[0.55, 1.45, 0]}>
              <Visor />
            </RBox>
            <mesh position={[0.74, 1.45, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 24]} />
              <Glow color={COLORS.mint} intensity={3} />
            </mesh>
            {/* solar panel */}
            <RBox size={[0.9, 0.04, 0.7]} radius={0.02} position={[-0.55, 0.62, 0]}>
              <meshPhysicalMaterial color="#14214f" roughness={0.2} metalness={0.8} clearcoat={1} />
            </RBox>
          </>
        ) : (
          <>
            {/* scraper blade */}
            <group position={[1.38, -0.05, 0]} rotation={[0, 0, -0.2]}>
              <RBox size={[0.12, 0.5, 1.7]} radius={0.05}>
                <meshPhysicalMaterial color={COLORS.sun} roughness={0.35} metalness={0.2} clearcoat={0.8} />
              </RBox>
            </group>
            {[-0.5, 0.5].map((z) => (
              <mesh key={z} position={[1.2, 0.15, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
                <Metal />
              </mesh>
            ))}
            {/* beacon */}
            <mesh position={[-0.6, 0.72, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.22, 24]} />
              <Glow color={COLORS.sun} intensity={2.6} />
            </mesh>
            <RBox size={[0.6, 0.18, 0.5]} radius={0.06} position={[0.3, 0.68, 0]}>
              <Visor />
            </RBox>
          </>
        )}
      </group>
    </group>
  );
}

export default function Rover3D({ kind, className }: { kind: RoverKind; className?: string }) {
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
          camera={{ position: [0, 1.6, 6.4], fov: 30 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera }) => camera.lookAt(0, 0.1, 0)}
        >
          <Studio />
          <ambientLight intensity={0.25} />
          <directionalLight position={[3, 5, 4]} intensity={2.1} />
          <pointLight position={[-4, 1, -2]} intensity={45} color="#5B7CFF" />
          <pointLight position={[3, -1, 3]} intensity={10} color="#FFC857" />
          <Rover kind={kind} />
        </Canvas>
      )}
    </div>
  );
}
