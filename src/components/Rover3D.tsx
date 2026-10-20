import * as THREE from "three";
import { RBox } from "./Robot3D";
import {
  Amber,
  Bolt,
  Cyan,
  DarkSteel,
  Deck,
  Graphite,
  GraphiteLight,
  M,
  Panel,
  Rod,
  Shadow,
  Stage,
  Steel,
  Wheel,
} from "./project-kit";

/* ═══════════════════════════════════════════════════════════════
   Rover3D — the two field rovers, rebuilt as detailed machines.

   "vajra"  : heavy agri rover — 6 wheels, coilovers, scraper blade,
              roll cage, sensor mast with stereo cameras + LiDAR.
   "mafiya" : rocker-bogie exploration rover — articulated booms,
              solar array, camera mast, hazard cams.
   ═══════════════════════════════════════════════════════════════ */
export type RoverKind = "vajra" | "mafiya";

/* ── Vajra ─────────────────────────────────────────────────── */
function Vajra() {
  const wheels: [number, number][] = [
    [-0.82, -1],
    [-0.82, 1],
    [0, -1],
    [0, 1],
    [0.82, -1],
    [0.82, 1],
  ];

  return (
    <group>
      <Shadow y={-0.58} scale={[4.7, 3.0]} />
      <group position={[0, 0.02, 0]}>
        {/* ── chassis ── */}
        <RBox size={[2.06, 0.07, 1.02]} radius={0.03} position={[0, 0.02, 0]}>
          <Panel />
        </RBox>
        <RBox size={[1.94, 0.4, 0.98]} radius={0.11} position={[0, 0.25, 0]}>
          <Graphite />
        </RBox>
        <RBox size={[1.62, 0.09, 0.84]} radius={0.035} position={[0.02, 0.49, 0]}>
          <Deck />
        </RBox>

        {/* side armour + amber signature strip */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <RBox size={[1.44, 0.24, 0.05]} radius={0.025} position={[0.02, 0.24, s * 0.5]}>
              <Panel />
            </RBox>
            <mesh position={[0.28, 0.28, s * 0.53]}>
              <boxGeometry args={[0.52, 0.032, 0.012]} />
              <Amber intensity={2.2} />
            </mesh>
            {[-0.6, 0.6].map((x) => (
              <Bolt key={x} position={[x, 0.25, s * 0.532]} rotation={[Math.PI / 2, 0, 0]} />
            ))}
          </group>
        ))}

        {/* deck vents */}
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[-0.34 + i * 0.11, 0.54, 0]}>
            <boxGeometry args={[0.045, 0.012, 0.56]} />
            <DarkSteel />
          </mesh>
        ))}
        {/* rear hatch */}
        <RBox size={[0.5, 0.06, 0.62]} radius={0.02} position={[-0.68, 0.54, 0]}>
          <Panel />
        </RBox>

        {/* ── wheels, fenders, suspension ── */}
        {wheels.map(([x, z]) => (
          <group key={`${x}-${z}`}>
            <Wheel position={[x, -0.2, z * 0.63]} radius={0.33} width={0.3} lugs={16} />
            {/* mudguard: half-pipe shell over the tyre */}
            <mesh position={[x, -0.2, z * 0.63]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.4, 0.4, 0.38, 24, 1, true, Math.PI / 2, Math.PI]} />
              <meshStandardMaterial color={M.graphiteLight} roughness={0.45} metalness={0.55} side={THREE.DoubleSide} />
            </mesh>
            {/* trailing mud flap */}
            <mesh position={[x - 0.4, -0.26, z * 0.63]} rotation={[0, 0, 0.16]}>
              <boxGeometry args={[0.05, 0.26, 0.34]} />
              <Panel />
            </mesh>
            {/* suspension link + coilover */}
            <Rod a={[x, 0.16, z * 0.4]} b={[x, -0.2, z * 0.62]} r={0.036}>
              <DarkSteel />
            </Rod>
            <Rod a={[x - 0.2, 0.22, z * 0.44]} b={[x - 0.13, -0.11, z * 0.58]} r={0.052}>
              <Steel />
            </Rod>
          </group>
        ))}

        {/* ── front scraper blade ── */}
        <group position={[1.12, 0.02, 0]} rotation={[0, 0, 0.16]}>
          <RBox size={[0.07, 0.28, 1.44]} radius={0.02}>
            <meshStandardMaterial color="#5E6673" roughness={0.52} metalness={0.45} />
          </RBox>
          <mesh position={[0.035, -0.14, 0]}>
            <boxGeometry args={[0.07, 0.05, 1.46]} />
            <Amber intensity={2.1} />
          </mesh>
          {/* vertical stiffener ribs */}
          {[-0.48, -0.16, 0.16, 0.48].map((z) => (
            <mesh key={z} position={[0.045, 0.0, z]}>
              <boxGeometry args={[0.03, 0.26, 0.05]} />
              <DarkSteel />
            </mesh>
          ))}
          {/* top rail */}
          <mesh position={[0.04, 0.15, 0]}>
            <boxGeometry args={[0.06, 0.035, 1.46]} />
            <Steel />
          </mesh>
          {/* serrated leading edge teeth */}
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0.05, -0.18, -0.62 + i * 0.155]}>
              <boxGeometry args={[0.08, 0.06, 0.055]} />
              <Steel />
            </mesh>
          ))}
        </group>
        {[-0.44, 0.44].map((z) => (
          <group key={z}>
            <Rod a={[0.72, 0.3, z]} b={[1.12, 0.12, z]} r={0.038}>
              <DarkSteel />
            </Rod>
            <Rod a={[0.66, 0.05, z]} b={[1.08, -0.06, z]} r={0.03}>
              <Steel />
            </Rod>
          </group>
        ))}

        {/* ── rear roll cage ── */}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Rod a={[-0.66, 0.52, s * 0.34]} b={[-0.66, 0.94, s * 0.34]} r={0.028}>
              <DarkSteel />
            </Rod>
            <Rod a={[0.06, 0.52, s * 0.34]} b={[0.06, 0.94, s * 0.34]} r={0.028}>
              <DarkSteel />
            </Rod>
          </group>
        ))}
        {[-1, 1].map((s) => (
          <Rod key={`top${s}`} a={[-0.66, 0.94, s * 0.34]} b={[0.06, 0.94, s * 0.34]} r={0.028}>
            <DarkSteel />
          </Rod>
        ))}
        <Rod a={[-0.66, 0.94, -0.34]} b={[-0.66, 0.94, 0.34]} r={0.028}>
          <DarkSteel />
        </Rod>

        {/* ── sensor mast: stereo cameras + LiDAR ── */}
        <mesh position={[0.44, 0.55, 0]}>
          <cylinderGeometry args={[0.075, 0.09, 0.12, 20]} />
          <DarkSteel />
        </mesh>
        <Rod a={[0.44, 0.58, 0]} b={[0.44, 1.12, 0]} r={0.042}>
          <Steel />
        </Rod>
        <RBox size={[0.32, 0.22, 0.38]} radius={0.05} position={[0.45, 1.2, 0]}>
          <Panel />
        </RBox>
        <RBox size={[0.26, 0.13, 0.32]} radius={0.03} position={[0.52, 1.2, 0]}>
          <GraphiteLight />
        </RBox>
        {[-0.09, 0.09].map((z) => (
          <group key={z}>
            <mesh position={[0.6, 1.21, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.056, 0.056, 0.05, 20]} />
              <DarkSteel />
            </mesh>
            <mesh position={[0.63, 1.21, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.036, 0.036, 0.012, 20]} />
              <meshStandardMaterial color="#050A12" roughness={0.12} metalness={0.8} />
            </mesh>
            <mesh position={[0.635, 1.21, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.016, 0.016, 0.008, 16]} />
              <Cyan intensity={2.8} />
            </mesh>
          </group>
        ))}
        {/* LiDAR puck */}
        <mesh position={[0.45, 1.38, 0]}>
          <cylinderGeometry args={[0.095, 0.1, 0.09, 24]} />
          <Panel />
        </mesh>
        <mesh position={[0.45, 1.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.082, 0.011, 8, 22]} />
          <Cyan intensity={2.2} />
        </mesh>
        {/* sun hood over the cameras */}
        <RBox size={[0.2, 0.02, 0.46]} radius={0.01} position={[0.56, 1.32, 0]} rotation={[0, 0, -0.12]}>
          <Panel />
        </RBox>

        {/* ── beacon + antenna ── */}
        <mesh position={[-0.62, 0.62, -0.24]}>
          <cylinderGeometry args={[0.07, 0.075, 0.05, 18]} />
          <DarkSteel />
        </mesh>
        <mesh position={[-0.62, 0.69, -0.24]}>
          <cylinderGeometry args={[0.06, 0.06, 0.1, 18]} />
          <Amber intensity={2.6} />
        </mesh>
        <Rod a={[-0.8, 0.5, 0.3]} b={[-0.96, 1.26, 0.34]} r={0.012}>
          <DarkSteel />
        </Rod>
        <mesh position={[-0.96, 1.28, 0.34]}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <Amber intensity={2.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ── Mafiya ────────────────────────────────────────────────── */
function Mafiya() {
  const wheels: [number, number][] = [
    [-0.98, -1],
    [-0.98, 1],
    [0, -1],
    [0, 1],
    [0.98, -1],
    [0.98, 1],
  ];

  return (
    <group>
      <Shadow y={-0.62} scale={[4.9, 3.1]} />
      <group position={[0, 0.02, 0]}>
        {/* ── body ── */}
        <RBox size={[1.5, 0.5, 0.9]} radius={0.1} position={[0, 0.24, 0]}>
          <Graphite />
        </RBox>
        <RBox size={[1.2, 0.11, 0.74]} radius={0.03} position={[0, 0.53, 0]}>
          <Deck />
        </RBox>
        <RBox size={[0.9, 0.05, 0.62]} radius={0.02} position={[-0.1, 0.42, 0]}>
          <Panel />
        </RBox>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[0.18, 0.3, s * 0.458]}>
              <boxGeometry args={[0.56, 0.03, 0.012]} />
              <Amber intensity={2.2} />
            </mesh>
            {[-0.5, 0.5].map((x) => (
              <Bolt key={x} position={[x, 0.28, s * 0.46]} rotation={[Math.PI / 2, 0, 0]} />
            ))}
          </group>
        ))}

        {/* ── wheels + rocker-bogie linkage ── */}
        {wheels.map(([x, z]) => (
          <group key={`${x}-${z}`}>
            <Wheel position={[x, -0.24, z * 0.67]} radius={0.36} width={0.26} lugs={14} />
            {/* grouser plates read as a rover wheel */}
            <mesh position={[x, -0.24, z * 0.67]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.365, 0.365, 0.24, 28, 1, true]} />
              <meshStandardMaterial color="#22262F" roughness={0.55} metalness={0.7} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        {[-1, 1].map((s) => {
          const z = s * 0.62;
          const pivot: [number, number, number] = [0.06, 0.2, z];
          const bogie: [number, number, number] = [0.52, 0.04, z];
          const rear: [number, number, number] = [-0.98, -0.24, z + s * 0.05];
          const mid: [number, number, number] = [0, -0.24, z + s * 0.05];
          const front: [number, number, number] = [0.98, -0.24, z + s * 0.05];
          return (
            <group key={s}>
              <Rod a={rear} b={pivot} r={0.05}>
                <DarkSteel />
              </Rod>
              <Rod a={pivot} b={bogie} r={0.05}>
                <DarkSteel />
              </Rod>
              <Rod a={bogie} b={mid} r={0.042}>
                <DarkSteel />
              </Rod>
              <Rod a={bogie} b={front} r={0.042}>
                <DarkSteel />
              </Rod>
              {/* pivots */}
              {[pivot, bogie].map((p, i) => (
                <mesh key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.075, 0.075, 0.1, 16]} />
                  <Steel />
                </mesh>
              ))}
              {/* damper */}
              <Rod a={[pivot[0] - 0.1, 0.34, z]} b={[bogie[0] - 0.16, 0.12, z]} r={0.042}>
                <Steel />
              </Rod>
            </group>
          );
        })}

        {/* ── solar array ── */}
        <RBox size={[1.28, 0.05, 0.96]} radius={0.02} position={[0, 0.64, 0]}>
          <Deck />
        </RBox>
        <mesh position={[0, 0.672, 0]}>
          <boxGeometry args={[1.16, 0.014, 0.84]} />
          <meshStandardMaterial color="#0E1836" roughness={0.16} metalness={0.85} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`gx${i}`} position={[-0.435 + i * 0.29, 0.681, 0]}>
            <boxGeometry args={[0.009, 0.012, 0.84]} />
            <DarkSteel />
          </mesh>
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={`gz${i}`} position={[0, 0.681, -0.35 + i * 0.14]}>
            <boxGeometry args={[1.16, 0.012, 0.009]} />
            <DarkSteel />
          </mesh>
        ))}
        {[
          [-0.58, -0.42],
          [-0.58, 0.42],
          [0.58, -0.42],
          [0.58, 0.42],
        ].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.6, z]}>
            <cylinderGeometry args={[0.024, 0.024, 0.09, 10]} />
            <Steel />
          </mesh>
        ))}

        {/* ── camera mast ── */}
        <mesh position={[0.34, 0.6, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 0.1, 20]} />
          <DarkSteel />
        </mesh>
        <Rod a={[0.34, 0.62, 0]} b={[0.34, 1.34, 0]} r={0.045}>
          <Steel />
        </Rod>
        <RBox size={[0.13, 0.13, 0.52]} radius={0.03} position={[0.38, 1.4, 0]}>
          <Panel />
        </RBox>
        {[-0.16, 0, 0.16].map((z) => (
          <group key={z}>
            <mesh position={[0.45, 1.4, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.045, 0.045, 0.05, 18]} />
              <DarkSteel />
            </mesh>
            <mesh position={[0.48, 1.4, z]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.028, 0.028, 0.012, 18]} />
              <Cyan intensity={2.5} />
            </mesh>
          </group>
        ))}
        <RBox size={[0.16, 0.02, 0.58]} radius={0.01} position={[0.44, 1.48, 0]} rotation={[0, 0, -0.1]}>
          <Panel />
        </RBox>

        {/* ── hazard cams front + rear ── */}
        {[1, -1].map((s) => (
          <group key={s}>
            <RBox size={[0.12, 0.12, 0.34]} radius={0.025} position={[s * 0.76, 0.13, 0]}>
              <Panel />
            </RBox>
            {[-0.09, 0.09].map((z) => (
              <mesh key={z} position={[s * 0.83, 0.13, z]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.03, 0.03, 0.012, 16]} />
                <Cyan intensity={2} />
              </mesh>
            ))}
          </group>
        ))}

        {/* ── antennas + status light ── */}
        <Rod a={[-0.55, 0.62, -0.3]} b={[-0.72, 1.28, -0.36]} r={0.013}>
          <DarkSteel />
        </Rod>
        <mesh position={[-0.72, 1.3, -0.36]}>
          <sphereGeometry args={[0.026, 10, 10]} />
          <Amber intensity={2.2} />
        </mesh>
        <mesh position={[-0.72, 1.5, 0.02]}>
          <sphereGeometry args={[0.05, 14, 14]} />
          <Steel />
        </mesh>
        <Rod a={[-0.7, 0.62, 0.05]} b={[-0.72, 1.46, 0.02]} r={0.018}>
          <Steel />
        </Rod>
        <mesh position={[-0.6, 0.6, 0.26]}>
          <cylinderGeometry args={[0.045, 0.045, 0.035, 14]} />
          <Amber intensity={2.4} />
        </mesh>
      </group>
    </group>
  );
}

export function Rover({ kind }: { kind: RoverKind; still?: boolean }) {
  return <group rotation={[0, -0.18, 0]}>{kind === "mafiya" ? <Mafiya /> : <Vajra />}</group>;
}

export default function Rover3D({ kind, className }: { kind: RoverKind; className?: string }) {
  const camera: [number, number, number] = kind === "mafiya" ? [3.35, 1.88, 4.95] : [3.1, 1.7, 4.55];
  return (
    <Stage className={className} camera={camera} target={[0, 0.12, 0]}>
      <Rover kind={kind} />
    </Stage>
  );
}
