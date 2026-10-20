import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { hasWebGL, Studio, useShadowTexture } from "./Robot3D";

/* ═══════════════════════════════════════════════════════════════
   project-kit — shared materials, machine parts and stage for the
   Featured Projects models (Vajra, Mafiya, Rynox).

   The look: dark machined graphite, brushed steel, amber + cyan
   accents, studio lighting. No textures, no external assets.
   ═══════════════════════════════════════════════════════════════ */

export const M = {
  graphite: "#23262E",
  graphiteLight: "#333845",
  panel: "#15171D",
  deck: "#3B4152",
  steel: "#C7CDDB",
  darkSteel: "#767F92",
  rubber: "#0C0E12",
  amber: "#FFC857",
  cyan: "#4DE3C1",
  blue: "#4163F2",
};

/* ── materials ─────────────────────────────────────────────── */
export const Graphite = () => <meshStandardMaterial color={M.graphite} roughness={0.44} metalness={0.6} />;
export const GraphiteLight = () => <meshStandardMaterial color={M.graphiteLight} roughness={0.4} metalness={0.62} />;
export const Panel = () => <meshStandardMaterial color={M.panel} roughness={0.58} metalness={0.34} />;
export const Deck = () => <meshStandardMaterial color={M.deck} roughness={0.46} metalness={0.5} />;
export const Steel = () => <meshStandardMaterial color={M.steel} roughness={0.24} metalness={1} />;
export const DarkSteel = () => <meshStandardMaterial color={M.darkSteel} roughness={0.34} metalness={1} />;
export const Rubber = () => <meshStandardMaterial color={M.rubber} roughness={0.93} metalness={0.04} />;
export const Amber = ({ intensity = 2.4 }: { intensity?: number }) => (
  <meshStandardMaterial color={M.amber} emissive={M.amber} emissiveIntensity={intensity} toneMapped={false} />
);
export const Cyan = ({ intensity = 2.4 }: { intensity?: number }) => (
  <meshStandardMaterial color={M.cyan} emissive={M.cyan} emissiveIntensity={intensity} toneMapped={false} />
);
export const GlassLens = () => (
  <meshPhysicalMaterial color="#05070C" roughness={0.06} metalness={0.9} clearcoat={1} clearcoatRoughness={0.05} />
);

/* ── structural helpers ────────────────────────────────────── */

/** A cylinder spanning two points — suspension links, cage tubes, struts. */
export function Rod({
  a,
  b,
  r = 0.034,
  children,
}: {
  a: [number, number, number];
  b: [number, number, number];
  r?: number;
  children?: React.ReactNode;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const len = Math.max(dir.length(), 0.001);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { position: va.clone().add(vb).multiplyScalar(0.5), quaternion: q.toArray() as [number, number, number, number], length: len };
  }, [a[0], a[1], a[2], b[0], b[1], b[2]]);

  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[r, r, length, 12]} />
      {children ?? <Steel />}
    </mesh>
  );
}

/** Hex bolt head sitting on a surface. */
export function Bolt({
  position,
  rotation = [0, 0, 0],
  size = 0.026,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size?: number;
}) {
  return (
    <mesh position={position} rotation={rotation}>
      <cylinderGeometry args={[size, size, 0.022, 6]} />
      <DarkSteel />
    </mesh>
  );
}

/** Wide off-road wheel with tread lugs, steel hub and visible bolts. */
export function Wheel({
  position,
  radius = 0.33,
  width = 0.3,
  lugs = 16,
  spin,
}: {
  position: [number, number, number];
  radius?: number;
  width?: number;
  lugs?: number;
  spin?: React.RefObject<number>;
}) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <Spin spin={spin}>
        <mesh>
          <cylinderGeometry args={[radius, radius, width, 40]} />
          <Rubber />
        </mesh>
        {/* sidewall shoulders */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, (s * width) / 2 - s * 0.012, 0]}>
            <cylinderGeometry args={[radius * 0.96, radius * 0.86, 0.026, 32]} />
            <Rubber />
          </mesh>
        ))}
        {/* hub */}
        <mesh>
          <cylinderGeometry args={[radius * 0.5, radius * 0.5, width + 0.03, 24]} />
          <Steel />
        </mesh>
        <mesh>
          <cylinderGeometry args={[radius * 0.24, radius * 0.24, width + 0.06, 16]} />
          <DarkSteel />
        </mesh>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={`b${i}`}
              position={[Math.cos(a) * radius * 0.36, width / 2 + 0.024, Math.sin(a) * radius * 0.36]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.026, 0.026, 0.02, 6]} />
              <DarkSteel />
            </mesh>
          );
        })}
        {/* tread lugs */}
        {Array.from({ length: lugs }).map((_, i) => {
          const a = (i / lugs) * Math.PI * 2;
          return (
            <mesh key={`l${i}`} position={[Math.cos(a) * radius, 0, Math.sin(a) * radius]} rotation={[0, -a, 0]}>
              <boxGeometry args={[0.055, width * 0.94, 0.1]} />
              <meshStandardMaterial color="#191C24" roughness={0.9} metalness={0.1} />
            </mesh>
          );
        })}
      </Spin>
    </group>
  );
}

/** Rotates its children on Z when a spin ref is supplied (and motion is on). */
export function Spin({ spin, children }: { spin?: React.RefObject<number>; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const speed = spin?.current ?? 0;
  useEffect(() => {
    if (!ref.current || !speed || prefersReducedMotion()) return;
    let raf = 0;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = (t - last) / 1000;
      last = t;
      if (ref.current) ref.current.rotation.z -= dt * speed * 2.4;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return <group ref={ref}>{children}</group>;
}

/** Soft contact shadow under a model. */
export function Shadow({ y = -0.6, scale = [4.6, 2.9] }: { y?: number; scale?: [number, number] }) {
  const tex = useShadowTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  );
}

/* ── stage: canvas, lighting and camera for every project model ── */
export function Stage({
  className,
  children,
  camera = [2.95, 1.62, 4.35],
  target = [0, 0.16, 0],
}: {
  className?: string;
  children: React.ReactNode;
  camera?: [number, number, number];
  target?: [number, number, number];
}) {
  const [ok] = useState(hasWebGL);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "140px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      {ok && (
        <Canvas
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ position: camera, fov: 26 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ camera: cam }) => cam.lookAt(target[0], target[1], target[2])}
        >
          <Studio />
          <ambientLight intensity={0.5} />
          <hemisphereLight args={["#A6B8FF", "#0A0C14", 0.6]} />
          <directionalLight position={[4.5, 7, 4]} intensity={2.9} />
          <directionalLight position={[-4.5, 3.6, -4.6]} intensity={1.9} color="#8FA6FF" />
          <pointLight position={[-3.4, 1.4, 2.6]} intensity={26} color="#FFC857" />
          <pointLight position={[3.6, 0.9, -2.4]} intensity={30} color="#5B7CFF" />
          {children}
        </Canvas>
      )}
    </div>
  );
}
