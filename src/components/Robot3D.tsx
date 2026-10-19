import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { prefersReducedMotion } from "../lib/hooks";

/* ═══════════════════════════════════════════════════════════════
   Robot3D — the hero machine. Built entirely from code (rounded
   boxes, capsules, extruded gears): no photos, no generated art.
   The head tracks the pointer; the whole body eases with scroll.
   ═══════════════════════════════════════════════════════════════ */

export const COLORS = {
  shell: "#EEF1FA",
  visor: "#0A0D1A",
  blue: "#4163F2",
  metal: "#9AA4C4",
  sun: "#FFC857",
  mint: "#4DE3C1",
};

/* ── Small building blocks ──────────────────────────────────── */
export function RBox({
  size,
  radius,
  children,
  ...props
}: {
  size: [number, number, number];
  radius: number;
  children?: React.ReactNode;
} & React.ComponentProps<"mesh">) {
  const [w, h, d] = size;
  const geo = useMemo(() => new RoundedBoxGeometry(w, h, d, 6, radius), [w, h, d, radius]);
  useEffect(() => () => geo.dispose(), [geo]);
  return (
    <mesh geometry={geo} {...props}>
      {children}
    </mesh>
  );
}

export const Shell = () => <meshPhysicalMaterial color={COLORS.shell} roughness={0.3} metalness={0.04} clearcoat={1} clearcoatRoughness={0.18} />;
export const Visor = () => <meshPhysicalMaterial color={COLORS.visor} roughness={0.1} metalness={0.7} clearcoat={1} clearcoatRoughness={0.05} />;
export const Blue = () => <meshPhysicalMaterial color={COLORS.blue} roughness={0.32} metalness={0.25} clearcoat={0.8} />;
export const Metal = () => <meshStandardMaterial color={COLORS.metal} roughness={0.28} metalness={1} />;
export const Glow = ({ color = COLORS.sun, intensity = 2.4 }: { color?: string; intensity?: number }) => (
  <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} toneMapped={false} />
);

/* ── Gear: extruded outline with teeth and a hub hole ───────── */
export function makeGearGeometry(teeth: number, outer: number, inner: number, hole: number, depth: number) {
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: [number, number][] = [
      [inner, a],
      [outer, a + step * 0.18],
      [outer, a + step * 0.5],
      [inner, a + step * 0.68],
    ];
    pts.forEach(([r, ang], k) => {
      const x = Math.cos(ang) * r;
      const y = Math.sin(ang) * r;
      if (i === 0 && k === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
  }
  shape.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(h);
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2 });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

function Gear({ position, scale = 1, speed = 0.5 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => makeGearGeometry(11, 0.5, 0.4, 0.14, 0.14), []);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => {
    if (ref.current && !prefersReducedMotion()) ref.current.rotation.z += dt * speed;
  });
  return (
    <mesh ref={ref} geometry={geo} position={position} scale={scale} rotation={[0.35, -0.5, 0]}>
      <Metal />
    </mesh>
  );
}

/* ── Microchip ──────────────────────────────────────────────── */
function Chip({ position }: { position: [number, number, number] }) {
  const pins = useMemo(() => {
    const out: { p: [number, number, number]; r: number }[] = [];
    for (let i = 0; i < 4; i++) {
      const o = -0.24 + i * 0.16;
      out.push({ p: [o, 0.42, 0], r: 0 }, { p: [o, -0.42, 0], r: 0 }, { p: [0.42, o, 0], r: 1 }, { p: [-0.42, o, 0], r: 1 });
    }
    return out;
  }, []);
  return (
    <group position={position} rotation={[0.5, 0.6, -0.2]} scale={0.95}>
      <RBox size={[0.74, 0.74, 0.14]} radius={0.05}>
        <Visor />
      </RBox>
      <RBox size={[0.34, 0.34, 0.02]} radius={0.04} position={[0, 0, 0.075]}>
        <Glow color={COLORS.mint} intensity={1.8} />
      </RBox>
      {pins.map((pin, i) => (
        <mesh key={i} position={pin.p} rotation={[0, 0, pin.r ? Math.PI / 2 : 0]}>
          <boxGeometry args={[0.07, 0.16, 0.04]} />
          <Metal />
        </mesh>
      ))}
    </group>
  );
}

/* ── Hex bolt ───────────────────────────────────────────────── */
function Bolt({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[1.1, 0.3, 0.4]}>
      <mesh>
        <cylinderGeometry args={[0.24, 0.24, 0.16, 6]} />
        <Blue />
      </mesh>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.42, 20]} />
        <Metal />
      </mesh>
    </group>
  );
}

/* ── Orbiting parts: each drifts on its own ellipse ─────────── */
function Orbiter({ phase, radius, height, speed, children }: { phase: number; radius: number; height: number; speed: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = prefersReducedMotion() ? phase : clock.elapsedTime * speed + phase;
    ref.current.position.set(Math.cos(t) * radius, height + Math.sin(t * 1.7) * 0.18, Math.sin(t) * radius * 0.55 - 0.4);
  });
  return <group ref={ref}>{children}</group>;
}

/* ── Image-based lighting from a procedural studio room ─────── */
export function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = 0.85;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

/* ── Soft contact shadow ────────────────────────────────────── */
export function useShadowTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(0,0,0,0.65)");
    grad.addColorStop(0.6, "rgba(0,0,0,0.18)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/* ── The robot ──────────────────────────────────────────────── */
function Robot() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);
  const thruster = useRef<THREE.Mesh>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowTex = useShadowTexture();
  const pointer = useRef({ x: 0, y: 0 });
  const scroll = useRef(0);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => (scroll.current = window.scrollY);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useFrame(({ clock }, dt) => {
    const calm = prefersReducedMotion();
    const t = calm ? 0 : clock.elapsedTime;
    const k = 1 - Math.pow(0.0015, dt); // frame-rate independent easing
    const { x, y } = pointer.current;
    const bob = Math.sin(t * 1.3) * 0.09;

    if (root.current) root.current.position.y = bob;
    if (body.current) {
      const targetY = -0.35 + x * 0.35 + Math.min(scroll.current, 900) * 0.0016;
      body.current.rotation.y += (targetY - body.current.rotation.y) * k;
    }
    if (head.current) {
      head.current.rotation.y += (x * 0.55 - head.current.rotation.y) * k;
      head.current.rotation.x += (y * 0.3 - head.current.rotation.x) * k;
      head.current.rotation.z = Math.sin(t * 0.9) * 0.02;
    }
    if (armL.current) armL.current.rotation.z = -0.2 + Math.sin(t * 1.3 + 1) * 0.05;
    if (armR.current) armR.current.rotation.z = 0.2 - Math.sin(t * 1.3) * 0.05;
    if (thruster.current) {
      const m = thruster.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 2.2 + Math.sin(t * 3) * 0.6;
    }
    if (shadow.current) {
      const s = 2.4 - bob * 2.2;
      shadow.current.scale.set(s, s, 1);
    }
  });

  return (
    <>
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.15, 0]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      <group ref={root}>
        <group ref={body} rotation={[0, -0.35, 0]}>
          {/* torso */}
          <RBox size={[1.5, 1.45, 1.0]} radius={0.4} position={[0, -0.05, 0]}>
            <Shell />
          </RBox>
          {/* chest panel + status lights */}
          <RBox size={[0.92, 0.5, 0.06]} radius={0.09} position={[0, 0.05, 0.5]}>
            <Visor />
          </RBox>
          {[
            { x: -0.28, c: COLORS.sun },
            { x: 0, c: COLORS.blue },
            { x: 0.28, c: COLORS.mint },
          ].map((l) => (
            <RBox key={l.x} size={[0.16, 0.16, 0.03]} radius={0.05} position={[l.x, 0.05, 0.545]}>
              <Glow color={l.c} intensity={l.c === COLORS.blue ? 3 : 2} />
            </RBox>
          ))}

          {/* hover base */}
          <mesh position={[0, -0.95, 0]}>
            <cylinderGeometry args={[0.5, 0.36, 0.28, 40]} />
            <Metal />
          </mesh>
          <mesh ref={thruster} position={[0, -1.12, 0]} rotation={[Math.PI, 0, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 40]} />
            <meshStandardMaterial color={COLORS.blue} emissive={COLORS.blue} emissiveIntensity={2.4} toneMapped={false} />
          </mesh>

          {/* arms */}
          <group ref={armL} position={[-0.98, 0.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.2, 32, 32]} />
              <Blue />
            </mesh>
            <mesh position={[-0.06, -0.42, 0]}>
              <capsuleGeometry args={[0.13, 0.46, 12, 24]} />
              <Shell />
            </mesh>
            <mesh position={[-0.08, -0.86, 0]}>
              <sphereGeometry args={[0.17, 32, 32]} />
              <Visor />
            </mesh>
          </group>
          <group ref={armR} position={[0.98, 0.3, 0]}>
            <mesh>
              <sphereGeometry args={[0.2, 32, 32]} />
              <Blue />
            </mesh>
            <mesh position={[0.06, -0.42, 0]}>
              <capsuleGeometry args={[0.13, 0.46, 12, 24]} />
              <Shell />
            </mesh>
            <mesh position={[0.08, -0.86, 0]}>
              <sphereGeometry args={[0.17, 32, 32]} />
              <Visor />
            </mesh>
          </group>

          {/* neck + head */}
          <mesh position={[0, 0.74, 0]}>
            <cylinderGeometry args={[0.22, 0.26, 0.2, 24]} />
            <Metal />
          </mesh>
          <group ref={head} position={[0, 1.42, 0]}>
            <RBox size={[1.55, 1.12, 1.15]} radius={0.44}>
              <Shell />
            </RBox>
            <RBox size={[1.22, 0.68, 0.1]} radius={0.27} position={[0, 0.02, 0.56]}>
              <Visor />
            </RBox>
            {[-0.29, 0.29].map((x) => (
              <RBox key={x} size={[0.24, 0.3, 0.04]} radius={0.1} position={[x, 0.04, 0.62]}>
                <Glow />
              </RBox>
            ))}
            {[-0.84, 0.84].map((x) => (
              <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.22, 0.22, 0.14, 32]} />
                <Blue />
              </mesh>
            ))}
            <mesh position={[0.3, 0.78, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.34, 12]} />
              <Metal />
            </mesh>
            <mesh position={[0.3, 1.0, 0]}>
              <sphereGeometry args={[0.1, 24, 24]} />
              <Glow color={COLORS.mint} intensity={3} />
            </mesh>
          </group>
        </group>

        {/* floating parts */}
        <Orbiter phase={0.4} radius={1.85} height={0.9} speed={0.28}>
          <Gear position={[0, 0, 0]} scale={0.95} speed={0.7} />
        </Orbiter>
        <Orbiter phase={2.5} radius={1.75} height={-0.3} speed={0.24}>
          <Chip position={[0, 0, 0]} />
        </Orbiter>
        <Orbiter phase={4.6} radius={1.9} height={1.7} speed={0.2}>
          <Bolt position={[0, 0, 0]} />
          <Gear position={[0.9, -0.5, 0.2]} scale={0.5} speed={-1.1} />
        </Orbiter>
      </group>
    </>
  );
}

/* ── WebGL capability check (so a missing GPU never breaks the page) ── */
export function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function Robot3D({ className }: { className?: string }) {
  const [ok] = useState(hasWebGL);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!ok) return null;

  return (
    <div ref={wrap} className={className} aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0.35, 8.4], fov: 32 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Studio />
        <ambientLight intensity={0.25} />
        <directionalLight position={[3.5, 4.5, 4]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-4, 1.5, -2]} intensity={60} color="#5B7CFF" />
        <pointLight position={[3.5, -1.5, 3]} intensity={14} color="#FFC857" />
        <Robot />
      </Canvas>
    </div>
  );
}
