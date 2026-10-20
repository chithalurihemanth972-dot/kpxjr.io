import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { RBox } from "./Robot3D";
import { Amber, Bolt, Cyan, DarkSteel, Deck, Graphite, GraphiteLight, Panel, Rod, Shadow, Stage, Steel, Wheel } from "./project-kit";

/* ═══════════════════════════════════════════════════════════════
   WarBot3D — "Rynox", the 15 kg war bot.

   Low armoured hull, exposed drive wheels, hardened front wedge with
   teeth and a front-mounted horizontal bar spinner on a machined hub.
   ═══════════════════════════════════════════════════════════════ */

const WEDGE_TILT = 0.34;

/** Horizontal bar spinner, front mounted. */
function Spinner({ spin }: { spin: React.RefObject<number> }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current && spin.current && !prefersReducedMotion()) ref.current.rotation.y += dt * spin.current * 5;
  });

  return (
    <group position={[1.18, 0.34, 0]}>
      {/* hub */}
      <mesh>
        <cylinderGeometry args={[0.14, 0.16, 0.24, 24]} />
        <Steel />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 0.055, 20]} />
        <DarkSteel />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.12, 0.13, Math.sin(a) * 0.12]}>
            <cylinderGeometry args={[0.018, 0.018, 0.035, 6]} />
            <DarkSteel />
          </mesh>
        );
      })}
      <group ref={ref}>
        {/* bar */}
        <mesh>
          <boxGeometry args={[0.19, 0.14, 1.72]} />
          <meshStandardMaterial color="#E4E9F2" roughness={0.16} metalness={1} />
        </mesh>
        {/* centre reinforcement */}
        <mesh>
          <boxGeometry args={[0.22, 0.16, 0.4]} />
          <meshStandardMaterial color="#8C95A8" roughness={0.3} metalness={1} />
        </mesh>
        {/* hardened tips */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[0, 0, s * 0.82]}>
            <boxGeometry args={[0.22, 0.14, 0.24]} />
            <meshStandardMaterial color="#7C8598" roughness={0.14} metalness={1} />
          </mesh>
        ))}
        {/* bolt-on weights */}
        {[-1, 1].map((s) => (
          <mesh key={`w${s}`} position={[0, 0.075, s * 0.5]}>
            <boxGeometry args={[0.18, 0.035, 0.18]} />
            <DarkSteel />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export function WarBot({ animate = false }: { animate?: boolean }) {
  const spin = useRef(animate ? 1 : 0);

  return (
    <group>
      <Shadow y={-0.46} scale={[4.3, 2.8]} />

      {/* ── hull ── */}
      <RBox size={[1.5, 0.32, 0.9]} radius={0.05} position={[0.06, 0, 0]}>
        <Graphite />
      </RBox>
      {/* lower skid plate */}
      <RBox size={[1.54, 0.05, 0.94]} radius={0.02} position={[0.06, -0.17, 0]}>
        <Panel />
      </RBox>
      {/* top armour */}
      <RBox size={[1.32, 0.06, 0.82]} radius={0.02} position={[0.02, 0.19, 0]} rotation={[0, 0, -0.05]}>
        <GraphiteLight />
      </RBox>
      {/* rear deck */}
      <RBox size={[0.46, 0.05, 0.76]} radius={0.02} position={[-0.62, 0.23, 0]}>
        <Deck />
      </RBox>

      {/* ── front wedge ── */}
      <group position={[0.88, -0.03, 0]} rotation={[0, 0, -WEDGE_TILT]}>
        <RBox size={[0.52, 0.07, 0.96]} radius={0.02}>
          <meshStandardMaterial color="#313744" roughness={0.48} metalness={0.6} />
        </RBox>
        {/* amber warning strip behind the leading edge */}
        <mesh position={[0.14, 0.042, 0]}>
          <boxGeometry args={[0.05, 0.012, 0.9]} />
          <Amber intensity={1.5} />
        </mesh>
        {/* teeth along the leading edge */}
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} position={[0.28, -0.06, -0.36 + i * 0.12]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.13, 0.09, 0.08]} />
            <Steel />
          </mesh>
        ))}
      </group>
      {/* wedge gussets */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0.74, -0.06, s * 0.42]} rotation={[0, 0, -WEDGE_TILT]}>
          <boxGeometry args={[0.5, 0.2, 0.05]} />
          <Panel />
        </mesh>
      ))}

      {/* ── exposed drive wheels ── */}
      {[
        [-0.45, -1],
        [-0.45, 1],
        [0.44, -1],
        [0.44, 1],
      ].map(([x, z]) => (
        <group key={`${x}-${z}`}>
          <Wheel position={[x, -0.16, z * 0.53]} radius={0.3} width={0.24} lugs={14} />
          {/* axle hub cover */}
          <mesh position={[x, -0.16, z * 0.665]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.045, 16]} />
            <DarkSteel />
          </mesh>
        </group>
      ))}

      {/* ── side armour rails ── */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <RBox size={[1.34, 0.16, 0.045]} radius={0.02} position={[0.02, 0.09, s * 0.47]}>
            <GraphiteLight />
          </RBox>
          <mesh position={[0.06, 0.12, s * 0.497]}>
            <boxGeometry args={[0.72, 0.026, 0.012]} />
            <Amber intensity={2.2} />
          </mesh>
          {[-0.5, 0.5].map((x) => (
            <Bolt key={x} position={[x, 0.09, s * 0.5]} rotation={[Math.PI / 2, 0, 0]} />
          ))}
        </group>
      ))}

      {/* top plate bolts */}
      {[
        [-0.5, -0.3],
        [-0.5, 0.3],
        [0.5, -0.3],
        [0.5, 0.3],
      ].map(([x, z], i) => (
        <Bolt key={i} position={[x, 0.225, z]} size={0.028} />
      ))}

      {/* ── weapon boom + front spinner ── */}
      <RBox size={[0.2, 0.26, 0.24]} radius={0.03} position={[1.18, 0.2, 0]}>
        <Panel />
      </RBox>
      <Rod a={[0.8, 0.16, 0]} b={[1.16, 0.3, 0]} r={0.05}>
        <Steel />
      </Rod>
      {/* drive motor */}
      <RBox size={[0.28, 0.22, 0.34]} radius={0.04} position={[0.56, 0.15, 0]}>
        <DarkSteel />
      </RBox>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0.46 + i * 0.05, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.115, 0.115, 0.012, 18]} />
          <GraphiteLight />
        </mesh>
      ))}
      <Spinner spin={spin} />

      {/* ── top plate detailing ── */}
      <RBox size={[0.36, 0.08, 0.52]} radius={0.03} position={[-0.2, 0.26, 0]}>
        <GraphiteLight />
      </RBox>
      <mesh position={[-0.2, 0.303, 0]}>
        <boxGeometry args={[0.22, 0.01, 0.04]} />
        <Cyan intensity={1.8} />
      </mesh>
      {[-0.16, 0.16].map((z) => (
        <mesh key={z} position={[-0.12, 0.228, z]}>
          <boxGeometry args={[0.74, 0.014, 0.06]} />
          <Panel />
        </mesh>
      ))}
      {[-0.34, 0.34].map((z) => (
        <mesh key={`e${z}`} position={[0.34, 0.228, z]}>
          <boxGeometry args={[0.3, 0.012, 0.05]} />
          <DarkSteel />
        </mesh>
      ))}

      {/* ── rear self-righting wing ── */}
      <group position={[-0.7, 0.3, 0]} rotation={[0, 0, 0.55]}>
        <RBox size={[0.36, 0.05, 0.8]} radius={0.02}>
          <GraphiteLight />
        </RBox>
        <mesh position={[-0.16, 0.012, 0]}>
          <boxGeometry args={[0.03, 0.04, 0.8]} />
          <Amber intensity={2} />
        </mesh>
      </group>

      {/* ── power, receiver, status ── */}
      <RBox size={[0.36, 0.18, 0.52]} radius={0.03} position={[-0.66, 0.34, 0]}>
        <Panel />
      </RBox>
      <mesh position={[-0.66, 0.435, 0.13]}>
        <boxGeometry args={[0.24, 0.012, 0.035]} />
        <Amber intensity={2.6} />
      </mesh>
      <mesh position={[-0.66, 0.435, -0.06]}>
        <boxGeometry args={[0.24, 0.012, 0.035]} />
        <Cyan intensity={2.4} />
      </mesh>
      {/* power switch */}
      <mesh position={[-0.66, 0.435, 0.28]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.045, 0.03, 12]} />
        <Steel />
      </mesh>
      <Rod a={[-0.78, 0.42, -0.18]} b={[-0.92, 0.92, -0.24]} r={0.01}>
        <DarkSteel />
      </Rod>

      {/* rear bumper + number plate */}
      <mesh position={[-0.87, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.62, 0.12]} />
        <meshStandardMaterial color="#E8C170" roughness={0.55} metalness={0.15} />
      </mesh>
      <mesh position={[-0.88, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.88, 12]} />
        <DarkSteel />
      </mesh>
    </group>
  );
}

export default function WarBot3D({ className }: { className?: string }) {
  return (
    <Stage className={className} camera={[2.9, 1.12, 3.8]} target={[0.18, 0.14, 0]}>
      <group rotation={[0, -0.24, 0]}>
        <WarBot />
      </group>
    </Stage>
  );
}
