import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { prefersReducedMotion } from "../lib/hooks";
import { RBox } from "./Robot3D";

/* ═══════════════════════════════════════════════════════════════
   ArduinoUno3D — a realistic Arduino Uno R3 for the KPX Jr 2 scene.

   Everything is built from code (no textures, no model files): a teal
   PCB, a silkscreen layer drawn on a canvas, and the real components
   — ATmega328P in DIP-28, the 16U2 USB-serial chip, the barrel jack,
   USB-B port, pin headers, crystal, regulator, capacitors, resistors
   and the four status LEDs.

   Board proportions follow the real thing (68.6 × 53.4 mm), and the
   component placement mirrors an actual Uno R3 top view.
   ═══════════════════════════════════════════════════════════════ */

/* ── Board metrics ───────────────────────────────────────────── */
const W = 3.6; // board width  (x)
const D = 2.8; // board depth  (z)
const T = 0.09; // PCB thickness
const PIN_PITCH = 0.135; // 2.54 mm at this scale
const PIN_SIZE = 0.042;

const PCB_COLOR = "#00726f"; // official Arduino Uno teal, a touch deeper

/* ── Shared materials (created once, disposed on unmount) ────── */
function useBoardMaterials() {
  const mats = useMemo(
    () => ({
      pcb: new THREE.MeshStandardMaterial({ color: PCB_COLOR, roughness: 0.66, metalness: 0.06 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#141619", roughness: 0.6, metalness: 0.05 }),
      darkPlastic: new THREE.MeshStandardMaterial({ color: "#0a0b0e", roughness: 0.72, metalness: 0.03 }),
      metal: new THREE.MeshStandardMaterial({ color: "#b9bfcb", roughness: 0.34, metalness: 1 }),
      gold: new THREE.MeshStandardMaterial({ color: "#cfa343", roughness: 0.38, metalness: 0.9 }),
      beige: new THREE.MeshStandardMaterial({ color: "#d3c8a0", roughness: 0.74, metalness: 0.04 }),
      blue: new THREE.MeshStandardMaterial({ color: "#2a63b8", roughness: 0.5, metalness: 0.05 }),
    }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose());
    },
    [mats],
  );
  return mats;
}

/* ── Instanced pins / parts (one draw call each) ─────────────── */
function InstancedBoxes({
  positions,
  size,
  material,
}: {
  positions: [number, number, number][];
  size: [number, number, number];
  material: THREE.Material;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    positions.forEach((p, i) => {
      m.makeTranslation(p[0], p[1], p[2]);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} material={material}>
      <boxGeometry args={size} />
    </instancedMesh>
  );
}

/* ── A pin header: black plastic strip + gold square pins ───── */
function Header({
  center,
  count,
  material,
}: {
  center: [number, number];
  count: number;
  material: { plastic: THREE.Material; gold: THREE.Material };
}) {
  const span = (count - 1) * PIN_PITCH;
  const pins = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
      out.push([center[0] - span / 2 + i * PIN_PITCH, 0.1, center[1]]);
    }
    return out;
  }, [center, count, span]);

  return (
    <group>
      <RBox size={[span + 0.14, 0.11, 0.22]} radius={0.022} position={[center[0], 0.055, center[1]]}>
        <primitive object={material.plastic} attach="material" />
      </RBox>
      <InstancedBoxes positions={pins} size={[PIN_SIZE, 0.2, PIN_SIZE]} material={material.gold} />
    </group>
  );
}

/* ── The silkscreen: white board printing, drawn on a canvas ─── */
function useSilkscreen() {
  const { gl } = useThree();

  const texture = useMemo(() => {
    const cw = 1024;
    const ch = Math.round((cw * D) / W);
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const g = canvas.getContext("2d");
    if (!g) return new THREE.CanvasTexture(canvas);

    const S = cw / W; // pixels per world unit
    const px = (x: number) => (x + W / 2) * S;
    const py = (z: number) => (z + D / 2) * S;

    const label = (
      text: string,
      x: number,
      z: number,
      h: number,
      align: CanvasTextAlign = "left",
      alpha = 0.8,
    ) => {
      g.save();
      g.fillStyle = `rgba(255,255,255,${alpha})`;
      g.font = `700 ${h * S}px "Segoe UI", Inter, Arial, sans-serif`;
      g.textAlign = align;
      g.textBaseline = "middle";
      g.fillText(text, px(x), py(z));
      g.restore();
    };

    /* Brand block, bottom-left — Arduino logo + wordmark + model */
    label("∞", -1.64, 0.0, 0.32, "left", 0.72);
    label("ARDUINO", -1.66, 0.3, 0.155);
    label("UNO", -1.66, 0.58, 0.115);

    /* Header captions (inner side of the strips, where they stay readable) */
    label("DIGITAL (PWM~)", 0.12, -0.94, 0.042, "center");
    label("ANALOG IN", 1.0, 0.94, 0.042, "center");
    label("ICSP", -1.5, 0.72, 0.036, "center");
    label("ICSP2", 1.45, 0.32, 0.036, "center");
    label("RESET", -0.42, -0.34, 0.036, "center");
    label("ON", -0.62, -0.32, 0.032, "right");
    label("L", 0.95, -0.02, 0.032, "center");
    label("TX", 1.15, -0.02, 0.032, "center");
    label("RX", 1.35, -0.02, 0.032, "center");
    label("16MHz", 1.3, -0.56, 0.032, "center");
    label("R3", 1.62, -1.05, 0.045, "right", 0.55);

    /* Digital header A — AREF, GND, 13, 12, ~11, ~10, ~9, 8 */
    ["AREF", "GND", "13", "12", "~11", "~10", "~9", "8"].forEach((t, i) =>
      label(t, 0.12 + (i - 3.5) * PIN_PITCH, -1.31, 0.033, "center"),
    );
    /* Digital header B — 7, ~6, ~5, 4, ~3, 2, TX1, RX0 */
    ["7", "~6", "~5", "4", "~3", "2", "TX1", "RX0"].forEach((t, i) =>
      label(t, 1.18 + (i - 3.5) * PIN_PITCH, -1.31, 0.033, "center"),
    );
    /* Power header — VIN, GND */
    label("VIN", -0.66 - PIN_PITCH / 2, -1.31, 0.033, "center");
    label("GND", -0.66 + PIN_PITCH / 2, -1.31, 0.033, "center");
    /* Analog header — A0 … A5 */
    ["A0", "A1", "A2", "A3", "A4", "A5"].forEach((t, i) =>
      label(t, 1.0 + (i - 2.5) * PIN_PITCH, 1.31, 0.033, "center"),
    );

    /* Pin-1 marker for the DIP chip sits on the package itself. */

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return tex;
  }, [gl]);

  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/* ── A blinking status LED (the "L" pin on a real Uno) ───────── */
function BlinkLed({
  position,
  material,
}: {
  position: [number, number, number];
  material: THREE.MeshStandardMaterial;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const mesh = ref.current;
    if (!mesh) return;
    const on = prefersReducedMotion() ? 0.85 : Math.sin(clock.elapsedTime * 3.4) > 0.2 ? 1 : 0.08;
    material.emissiveIntensity = 0.6 + on * 4;
  });
  return (
    <mesh ref={ref} position={position} material={material}>
      <boxGeometry args={[0.12, 0.07, 0.085]} />
    </mesh>
  );
}

/* ═══════════════════════════════════════════════════════════════
   The board
   ═══════════════════════════════════════════════════════════════ */
export default function ArduinoUno3D({
  color,
  rotation = [0.62, -0.42, 0.08],
}: {
  color: string;
  rotation?: [number, number, number];
}) {
  const m = useBoardMaterials();
  const silkscreen = useSilkscreen();

  /* Blinking "L" LED gets its own material so it can animate. */
  const lLedMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#8affc0",
        emissive: "#4ade80",
        emissiveIntensity: 2,
        toneMapped: false,
      }),
    [],
  );
  useEffect(() => () => lLedMat.dispose(), [lLedMat]);

  /* 14 pins per side on the DIP-28 package. */
  const dipPins = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let i = 0; i < 14; i++) {
      const x = 0.35 - 0.39 + i * 0.06;
      out.push([x, 0.028, 0.35]);
      out.push([x, 0.028, -0.11]);
    }
    return out;
  }, []);

  /* 2 × 3 ICSP headers. */
  const icspPins = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        out.push([-1.5 + (c - 1) * 0.1, 0.1, 0.95 + (r - 0.5) * 0.11]);
        out.push([1.45 + (c - 1) * 0.1, 0.1, 0.55 + (r - 0.5) * 0.11]);
      }
    }
    return out;
  }, []);

  const resistors = useMemo(
    () => Array.from({ length: 6 }, (_, i) => [-0.05 + i * 0.22, 0.03, -0.72] as [number, number, number]),
    [],
  );

  const ledGreen = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#3c9c62",
        emissive: "#4ade80",
        emissiveIntensity: 1.15,
        toneMapped: false,
      }),
    [],
  );
  const ledYellow = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#b8862c",
        emissive: "#ffc857",
        emissiveIntensity: 1.15,
        toneMapped: false,
      }),
    [],
  );
  const ledOrange = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#a85c1c",
        emissive: "#ff9f43",
        emissiveIntensity: 1.15,
        toneMapped: false,
      }),
    [],
  );
  const ledCyan = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1c7f97",
        emissive: color,
        emissiveIntensity: 1.2,
        toneMapped: false,
      }),
    [color],
  );
  useEffect(
    () => () => {
      ledGreen.dispose();
      ledYellow.dispose();
      ledOrange.dispose();
      ledCyan.dispose();
    },
    [ledGreen, ledYellow, ledOrange, ledCyan],
  );

  return (
    <group rotation={rotation} scale={0.98}>
      {/* ── PCB ── */}
      <RBox size={[W, T, D]} radius={0.03} position={[0, -T / 2, 0]}>
        <primitive object={m.pcb} attach="material" />
      </RBox>

      {/* ── Silkscreen printing ── */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W - 0.015, D - 0.015]} />
        <meshBasicMaterial map={silkscreen} transparent toneMapped={false} depthWrite={false} />
      </mesh>

      {/* ── Mounting holes ── */}
      {[
        [-1.55, -1.15],
        [1.55, -1.15],
        [-1.55, 1.15],
        [1.55, 1.15],
      ].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.065, 24]} />
          <meshStandardMaterial color="#03201f" roughness={0.9} />
        </mesh>
      ))}

      {/* ── DC barrel jack (top-left corner) ── */}
      <RBox size={[0.5, 0.4, 0.4]} radius={0.045} position={[-1.15, 0.2, -1.1]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>
      <mesh position={[-1.15, 0.4, -1.1]}>
        <cylinderGeometry args={[0.11, 0.11, 0.09, 24]} />
        <meshStandardMaterial color="#05060a" roughness={0.9} />
      </mesh>

      {/* ── USB-B port (left edge) ── */}
      <RBox size={[0.36, 0.29, 0.44]} radius={0.03} position={[-1.64, 0.145, -0.62]}>
        <primitive object={m.metal} attach="material" />
      </RBox>
      <RBox size={[0.07, 0.19, 0.28]} radius={0.02} position={[-1.82, 0.13, -0.62]}>
        <primitive object={m.darkPlastic} attach="material" />
      </RBox>

      {/* ── Voltage regulator (TO-252 + metal tab) ── */}
      <RBox size={[0.25, 0.21, 0.23]} radius={0.02} position={[-0.78, 0.105, -0.68]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>
      <RBox size={[0.25, 0.045, 0.1]} radius={0.01} position={[-0.78, 0.1, -0.53]}>
        <primitive object={m.metal} attach="material" />
      </RBox>

      {/* ── ATmega16U2 USB-serial chip ── */}
      <RBox size={[0.29, 0.09, 0.29]} radius={0.02} position={[-0.9, 0.045, -0.15]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>

      {/* ── ATmega328P in DIP-28 ── */}
      <RBox size={[0.92, 0.085, 0.42]} radius={0.018} position={[0.35, 0.043, 0.12]}>
        <primitive object={m.darkPlastic} attach="material" />
      </RBox>
      {/* pin-1 dot */}
      <mesh position={[-0.03, 0.086, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.026, 16]} />
        <meshStandardMaterial color="#4a4d55" roughness={0.5} metalness={0.2} />
      </mesh>
      <InstancedBoxes positions={dipPins} size={[0.034, 0.04, 0.13]} material={m.gold} />

      {/* ── Reset button ── */}
      <RBox size={[0.22, 0.12, 0.18]} radius={0.025} position={[-0.42, 0.06, -0.55]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>
      <RBox size={[0.15, 0.035, 0.12]} radius={0.012} position={[-0.42, 0.135, -0.55]}>
        <primitive object={m.metal} attach="material" />
      </RBox>

      {/* ── Crystal + ceramic resonator ── */}
      <RBox size={[0.3, 0.11, 0.13]} radius={0.042} position={[1.3, 0.055, -0.35]}>
        <primitive object={m.metal} attach="material" />
      </RBox>
      <mesh position={[0.95, 0.045, -0.6]} scale={[1, 0.55, 1]}>
        <cylinderGeometry args={[0.06, 0.06, 0.09, 16]} />
        <primitive object={m.blue} attach="material" />
      </mesh>

      {/* ── Electrolytic capacitors ── */}
      {[
        [-1.42, -0.15],
        [-1.25, -0.15],
      ].map(([x, z]) => (
        <mesh key={`cap-${x}`} position={[x, 0.095, z]}>
          <cylinderGeometry args={[0.085, 0.085, 0.19, 18]} />
          <primitive object={m.plastic} attach="material" />
        </mesh>
      ))}

      {/* ── Resistor row ── */}
      <InstancedBoxes positions={resistors} size={[0.19, 0.06, 0.08]} material={m.beige} />

      {/* ── ICSP headers ── */}
      <RBox size={[0.36, 0.11, 0.26]} radius={0.022} position={[-1.5, 0.055, 0.95]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>
      <RBox size={[0.36, 0.11, 0.26]} radius={0.022} position={[1.45, 0.055, 0.55]}>
        <primitive object={m.plastic} attach="material" />
      </RBox>
      <InstancedBoxes positions={icspPins} size={[0.04, 0.2, 0.04]} material={m.gold} />

      {/* ── Status LEDs ── */}
      <mesh position={[-0.66, 0.04, -0.32]} material={ledCyan}>
        <boxGeometry args={[0.12, 0.065, 0.08]} />
      </mesh>
      <BlinkLed position={[0.95, 0.04, -0.02]} material={lLedMat} />
      <mesh position={[1.15, 0.04, -0.02]} material={ledYellow}>
        <boxGeometry args={[0.12, 0.065, 0.08]} />
      </mesh>
      <mesh position={[1.35, 0.04, -0.02]} material={ledOrange}>
        <boxGeometry args={[0.12, 0.065, 0.08]} />
      </mesh>

      {/* ── Pin headers ── */}
      <Header center={[-0.66, -1.14]} count={2} material={m} />
      <Header center={[0.12, -1.14]} count={8} material={m} />
      <Header center={[1.18, -1.14]} count={8} material={m} />
      <Header center={[1.0, 1.14]} count={6} material={m} />
      <Header center={[-0.55, 1.14]} count={3} material={m} />
    </group>
  );
}
