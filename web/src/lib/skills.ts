import { siPytorch, siTensorflow, siOpencv, siMediapipe, siFlutter, siNextdotjs, siFlask, siReact } from "simple-icons";

export type SkillItem = {
  name: string;
  // Brand icon path/hex from simple-icons, when one exists for this tool.
  // A few niche tools (Fusion 360, MuJoCo) have no simple-icons entry —
  // those render as a plain colored label instead of guessing at a logo.
  path?: string;
  hex?: string;
};

export type SkillCategory = {
  id: string;
  labelEn: string;
  labelKo: string;
  // Primary stack gets brand-color icons/labels; any future secondary
  // group (e.g. a broader language list) would render in plain gray.
  primary: boolean;
  items: SkillItem[];
};

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "robotics",
    labelEn: "Robotics",
    labelKo: "로보틱스",
    primary: true,
    items: [
      { name: "Fusion 360" },
      { name: "MuJoCo" },
      { name: "PyTorch", path: siPytorch.path, hex: siPytorch.hex },
      { name: "TensorFlow", path: siTensorflow.path, hex: siTensorflow.hex },
      { name: "OpenCV", path: siOpencv.path, hex: siOpencv.hex },
      { name: "MediaPipe", path: siMediapipe.path, hex: siMediapipe.hex },
    ],
  },
  {
    id: "app",
    labelEn: "App Development",
    labelKo: "앱 개발",
    primary: true,
    items: [
      { name: "React Native", path: siReact.path, hex: siReact.hex },
      { name: "Flutter", path: siFlutter.path, hex: siFlutter.hex },
    ],
  },
  {
    id: "web",
    labelEn: "Web Development",
    labelKo: "웹 개발",
    primary: true,
    items: [
      { name: "Next.js", path: siNextdotjs.path, hex: siNextdotjs.hex },
      { name: "Flask", path: siFlask.path, hex: siFlask.hex },
    ],
  },
];
