/* ═══════════════════════════════════════════════════════════════
   KProjectXX — ALL SITE CONTENT LIVES IN THIS FILE
   Edit text here; every section reads from these objects.
   ═══════════════════════════════════════════════════════════════ */

export const BRAND = {
  name: "KProject",
  suffix: "XX",
  tagline: "Engineering Tomorrow. Building What's Next.",
  subline: "Robotics | Research & Development | Intelligent Systems",
};

export const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "Technology", href: "#technology" },
  { label: "Projects", href: "#projects" },
  { label: "KPX Jr", href: "#kpxjr" },
];

export const HERO = {
  headlineA: "Engineering Tomorrow.",
  headlineB: "Building What's Next.",
  subline: BRAND.subline,
  counters: [
    { value: 1000, suffix: "+", label: "B.Tech students trained" },
    { value: 4, suffix: "+", label: "Hands-on robotics workshops" },
  ],
  chips: [
    { label: "Sreenidhi Institute", detail: "3+ workshops" },
    { label: "VBIT", detail: "1 workshop" },
  ],
  ctaPrimary: "Explore KPX Jr",
  ctaSecondary: "Our Work",
  scrollHint: "SCROLL // SENSOR ACTIVE",
};

export const ABOUT = {
  kicker: "// 01 — Who We Are",
  title: "Who We Are",
  titleAccent: "— Turning ideas into engineered solutions.",
  body: "KProjectXX is a technology-focused engineering venture working across robotics, mechatronics, embedded electronics, autonomous systems and product development. We bring together mechanical design, electronics, programming and practical prototyping to develop solutions for real-world challenges.",
  mission: {
    title: "Our Mission",
    text: "To make advanced engineering practical, accessible and useful through innovation, experimentation and hands-on learning.",
  },
  vision: {
    title: "Our Vision",
    text: "To build an engineering ecosystem where young innovators, institutions and businesses can move from concepts to functional technology.",
  },
};

export const ECOSYSTEM = {
  kicker: "// 02 — Capabilities",
  title: "Our Technology Ecosystem",
  sub: "Seven disciplines. One integrated engineering stack.",
  items: [
    {
      title: "Robotics & Mechatronics",
      desc: "Mobile robots, mechanisms, drivetrain integration and robotic prototypes.",
    },
    {
      title: "Drones & Aerospace Engineering",
      desc: "RC aircraft, UAV prototypes, flight-control integration and autonomous systems.",
    },
    {
      title: "Embedded Systems",
      desc: "Microcontrollers, sensor systems, connected devices and telemetry.",
    },
    {
      title: "Automation & Control",
      desc: "Motor control, sensing, monitoring and automated processes.",
    },
    {
      title: "Custom Product Development",
      desc: "Mechanical, electronic and software integration for application-specific products.",
    },
    {
      title: "Research & Development",
      desc: "Concept development, feasibility studies, experimentation and proof-of-concept builds.",
    },
    {
      title: "STEM Education",
      desc: "KPX Jr — a four-level, project-based robotics pathway for young innovators.",
      highlight: true,
    },
  ],
};

export const PROJECTS = {
  kicker: "// 03 — Field Units",
  title: "Featured Projects",
  sub: "Real machines, built to solve real problems.",
  items: [
    {
      code: "UNIT-01",
      name: "Vajra",
      desc: "Autonomous dairy-farm dung-removal rover concept.",
      tags: ["Autonomous", "Agri-Robotics", "Rover"],
      /** Set `image` to your photo path (e.g. "/images/vajra.jpg") to replace the placeholder slot. */
      image: "",
    },
    {
      code: "UNIT-02",
      name: "Mafiya",
      desc: "Rocker-bogie rover developed for a robotics challenge.",
      tags: ["Rocker-Bogie", "Mobility", "Challenge Build"],
      image: "",
    },
  ],
  process: {
    title: "How we build",
    steps: [
      { n: "01", title: "Understand the problem" },
      { n: "02", title: "Evaluate feasibility" },
      { n: "03", title: "Develop architecture" },
      { n: "04", title: "Build & integrate prototype" },
      { n: "05", title: "Test & refine" },
    ],
  },
};

export const GATEWAY = {
  kicker: "// Education Division",
  headline: "KPX Jr — Build robots. Program ideas. Connect the world.",
  sub: "A four-level project pathway for young innovators.",
  cta: "Explore KPX Jr",
};

/* ── The KPX Jr program (revealed after the lead form) ───────── */

export type LevelColor = "jr1" | "jr2" | "jr3" | "jr4";

export interface JrProject {
  code: string;
  name: string;
  kit: string;
  icon: string;
}

export interface JrLevel {
  id: LevelColor;
  index: string;
  name: string;
  title: string;
  tagline?: string;
  focus: string[];
  description?: string;
  objective?: string;
  projectNote?: string;
  projects: JrProject[];
}

export const KPX = {
  kicker: "// KPX Jr — Program Decoded",
  sectionTitle: "KPX Jr — Full Program",
  lockedTitle: "KPX Jr — Program Encrypted",
  lockedSub: "Four levels. Twenty-four project kits. Unlock the full pathway.",
  lockedCta: "Unlock KPX Jr",

  intro: {
    title: "Learning that becomes something real.",
    sub: "Every level follows the same engineered loop:",
    flow: [
      { label: "BUILD", icon: "Hammer" },
      { label: "PROGRAM", icon: "Code2" },
      { label: "CONNECT", icon: "Wifi" },
      { label: "CREATE", icon: "Sparkles" },
    ],
  },

  why: {
    title: "Why KPX Jr.",
    items: [
      { icon: "Wrench", text: "Hands-on learning with real projects" },
      { icon: "Layers", text: "Structured progression across four levels" },
      { icon: "Users", text: "Creativity, confidence and teamwork" },
      { icon: "Rocket", text: "Future-ready STEM skills" },
      { icon: "CalendarRange", text: "24 sessions per level" },
      { icon: "Timer", text: "36 hours per level" },
      { icon: "Backpack", text: "Individual take-home learning" },
      { icon: "Package", text: "Personal project kits" },
    ],
  },

  levelsTitle: "The Four Levels",
  levelsSub: "One journey. Four engineering levels. Each level adds a new layer of independence.",

  levels: [
    {
      id: "jr1",
      index: "LVL 01",
      name: "KPX Jr 1",
      title: "Robotics Fundamentals",
      tagline: "Foundations through motion.",
      focus: ["Mechanics", "Electronics", "Motors", "Sensors", "Robot Basics"],
      description:
        "Students discover how real machines move, sense and respond — before programming enters the picture.",
      objective:
        "Understand how robots are physically constructed and how their mechanical and electrical systems work.",
      projects: [
        { code: "P1", name: "Mechanical Explorer Vehicle", kit: "Kit 01", icon: "Car" },
        { code: "P2", name: "Gear-Driven Vehicle", kit: "Kit 02", icon: "Cog" },
        { code: "P3", name: "Security Alarm", kit: "Kit 03", icon: "Siren" },
        { code: "P4", name: "Smart Night Lamp", kit: "Kit 04", icon: "Lightbulb" },
        { code: "P5", name: "Mechanical Gripper", kit: "Kit 05", icon: "Grip" },
        { code: "P6", name: "Mini Explorer Rover", kit: "Kit 06", icon: "Bot" },
      ],
    },
    {
      id: "jr2",
      index: "LVL 02",
      name: "KPX Jr 2",
      title: "Arduino & Embedded Robotics",
      focus: ["Programming", "Arduino", "Sensors", "Motor Control", "Basic Autonomy"],
      description:
        "Robots stop being toys and start making decisions: students write the code that reads sensors and drives motors.",
      objective:
        "Students move from physically building robots to programming robots and electronic systems — digital & analog I/O, sensor interfacing, motor control, PWM and sensor-driven behavior.",
      projects: [
        { code: "P1", name: "Programmable LED System", kit: "Kit 01", icon: "Lightbulb" },
        { code: "P2", name: "Smart Traffic Controller", kit: "Kit 02", icon: "TrafficCone" },
        { code: "P3", name: "Touchless Smart Dustbin", kit: "Kit 03", icon: "Trash2" },
        { code: "P4", name: "Smart Security Station", kit: "Kit 04", icon: "ShieldCheck" },
        { code: "P5", name: "Autonomous Line Follower", kit: "Kit 05", icon: "Route" },
        { code: "P6", name: "Smart Explorer Rover", kit: "Kit 06", icon: "Bot" },
      ],
    },
    {
      id: "jr3",
      index: "LVL 03",
      name: "KPX Jr 3",
      title: "IoT & Connected Robotics",
      tagline: "Devices become systems — linked by data, automation and remote control.",
      focus: ["ESP32", "Wi-Fi", "IoT", "Smart Automation", "Remote Monitoring", "Connected Devices"],
      description:
        "Builds leave the desk: every project talks to the network, so students can watch, control and automate it from anywhere.",
      objective:
        "Students connect their projects to Wi-Fi with the ESP32 — sending sensor data, monitoring systems remotely and automating devices through the internet.",
      projects: [
        { code: "P1", name: "Wi-Fi Smart Light", kit: "Kit 01", icon: "Wifi" },
        { code: "P2", name: "Smart Home Controller", kit: "Kit 02", icon: "HousePlus" },
        { code: "P3", name: "IoT Weather Station", kit: "Kit 03", icon: "CloudSun" },
        { code: "P4", name: "Smart Irrigation System", kit: "Kit 04", icon: "Droplets" },
        { code: "P5", name: "Environment Monitor", kit: "Kit 05", icon: "Thermometer" },
        { code: "P6", name: "IoT Security Station", kit: "Kit 06", icon: "Cctv" },
      ],
    },
    {
      id: "jr4",
      index: "LVL 04",
      name: "KPX Jr 4",
      title: "Robotics Project Lab",
      focus: ["Advanced Projects", "Complete Kits", "Engineering Challenges", "Innovation"],
      description:
        "No long theory modules. Students use everything learned in Levels 1–3 to build complete projects. The “build something impressive” level.",
      objective:
        "Students plan, build, test and present a complete robotics project of their own — combining mechanics, electronics, programming and connectivity from Levels 1–3.",
      projectNote:
        "Each project is a separate project kit — students can complete projects individually or choose a project pathway.",
      projects: [
        { code: "P1", name: "Project Kit 01", kit: "Kit 01", icon: "Puzzle" },
        { code: "P2", name: "Project Kit 02", kit: "Kit 02", icon: "Rocket" },
        { code: "P3", name: "Project Kit 03", kit: "Kit 03", icon: "Radar" },
        { code: "P4", name: "Project Kit 04", kit: "Kit 04", icon: "Cpu" },
        { code: "P5", name: "Project Kit 05", kit: "Kit 05", icon: "Zap" },
        { code: "P6", name: "Project Kit 06", kit: "Kit 06", icon: "Bot" },
      ],
    },
  ] as JrLevel[],

  kits: {
    title: "Core Kit + Project Kit",
    sub: "Every box moves from curiosity to capability.",
    core: {
      name: "Core Kit",
      desc: "Reusable base hardware that travels with the student across the level.",
      icon: "Box",
    },
    project: {
      name: "Project Kit",
      desc: "Mission-specific components for each build — one kit per project.",
      icon: "PackageOpen",
    },
    extras: ["Build Guide", "Experiment Card", "Challenge Card", "Troubleshooting Card", "Journal", "Badge"],
  },

  partners: {
    schools: {
      title: "Why Schools Partner",
      items: [
        { icon: "Layers", title: "Structured Progression", desc: "A level-by-level pathway that maps to real engineering skills." },
        { icon: "Eye", title: "Visible Student Work", desc: "Every session ends in something students can show and demonstrate." },
        { icon: "Hand", title: "Hands-on Engagement", desc: "Kits, tools and builds — not slides and lectures." },
        { icon: "Handshake", title: "Partnership Ready", desc: "A program designed to run inside schools, with schools." },
      ],
    },
    parents: {
      title: "Why Parents Choose KPX Jr.",
      tagline: "Because confidence grows when ideas become visible.",
      items: [
        { icon: "Brain", verb: "THINK", desc: "Break a challenge into workable steps" },
        { icon: "Hammer", verb: "MAKE", desc: "Turn imagination into a functioning build" },
        { icon: "Repeat", verb: "PERSIST", desc: "Test, debug, try a better approach" },
        { icon: "MessagesSquare", verb: "EXPLAIN", desc: "Share how a system works and why" },
      ],
    },
  },

  finalCta: {
    title: "Interested? Let's talk.",
    sub: "Our team will contact you on your mobile number shortly.",
    callback: "Request a Callback",
    whatsapp: "Chat on WhatsApp",
  },
};

/* ── Lead-capture modal copy ─────────────────────────────────── */

export const LEAD_FORM = {
  title: "Unlock KPX Jr",
  sub: "Tell us a little about you and we'll show you the full program.",
  nameLabel: "Full Name",
  namePlaceholder: "e.g. Ananya Sharma",
  mobileLabel: "Mobile Number",
  mobilePlaceholder: "10-digit mobile number",
  roleLabel: "I am a…",
  roles: ["Parent", "Guide", "School"] as const,
  schoolLabel: "School Name (optional)",
  schoolPlaceholder: "Which school should we coordinate with?",
  consent: "I agree to be contacted by KProjectXX on this mobile number via call/WhatsApp.",
  submit: "Unlock KPX Jr",
  successTitle: "Access Granted",
  successSub: "Welcome to KPX Jr — decrypting the program…",
  errors: {
    name: "Please enter your full name.",
    mobile: "Enter a valid 10-digit Indian mobile number.",
    role: "Please tell us who you are.",
    consent: "We need your consent to contact you.",
    submit: "Transmission failed — please check your connection and retry.",
  },
};

export const FOOTER = {
  tagline: BRAND.tagline,
  kpxNote: "KPX Jr — an initiative by KProjectXX",
  copyright: `© ${new Date().getFullYear()} KProjectXX. All rights reserved.`,
};

/* ═══════════════════════════════════════════════════════════════
   MULTI-PAGE LAYER
   Home stays one page. KPX Jr and its four levels are routed pages.
   ═══════════════════════════════════════════════════════════════ */

export const PAGES = {
  /** /kpx-jr */
  program: {
    kicker: "// KPX Jr — Program Overview",
    title: "A four-level pathway for young innovators.",
    sub: "Explore the pathway below, then open any level for its projects, core objective and kit details.",
    levelsTitle: "Choose a level",
    levelsSub: "One journey. Four engineering levels. Each level adds a new layer of independence.",
    openLevel: "Open level",
    gatewayNote: "Part of the KProjectXX technology ecosystem",
    kitTitle: "Every level runs on the Core Kit + Project Kit system",
    kitLink: "See how the kits work",
    lockedTitle: "KPX Jr — Program Encrypted",
    lockedSub: "Unlock the program to open all four levels, 24 projects and kit details.",
    lockedCta: "Unlock KPX Jr",
  },

  /** /kpx-jr/level-1 … /level-4 */
  level: {
    breadcrumbHome: "Home",
    breadcrumbProgram: "KPX Jr",
    projectsTitle: "Projects in this level",
    objectiveTitle: "Core objective",
    formatTitle: "Level format",
    formatSessions: "24 sessions per level",
    formatHours: "36 hours per level",
    formatTakeHome: "Individual take-home learning",
    kitTitle: "Built on the Core Kit + Project Kit system",
    kitLink: "Explore the full program",
    prev: "Previous level",
    next: "Next level",
    finalCta: "Interested? Let's talk.",
    lockedTitle: "This level is encrypted",
    lockedSub: "Unlock KPX Jr to view the projects, objectives and kit details for this level.",
    lockedCta: "Unlock this level",
    backToProgram: "All levels",
  },

  notFound: {
    code: "ERR 404 // SIGNAL LOST",
    title: "This route is off the grid.",
    sub: "The page you're looking for isn't part of the KProjectXX network.",
    cta: "Return home",
  },
};
