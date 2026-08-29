import {
  Boxes,
  CircleDashed,
  Cloud,
  Code,
  Cpu,
  Database,
  Globe,
  Headphones,
  Layers,
  LineChart,
  Lock,
  Monitor,
  Network,
  Search,
  Server,
  Settings,
  Shield,
  Smartphone,
  Terminal,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { warnContent } from './content/warn';

const ICONS = {
  boxes: Boxes,
  cloud: Cloud,
  code: Code,
  cpu: Cpu,
  database: Database,
  globe: Globe,
  headphones: Headphones,
  layers: Layers,
  'line-chart': LineChart,
  lock: Lock,
  monitor: Monitor,
  network: Network,
  search: Search,
  server: Server,
  settings: Settings,
  shield: Shield,
  smartphone: Smartphone,
  terminal: Terminal,
  workflow: Workflow,
  wrench: Wrench,
} satisfies Record<string, LucideIcon>;

export const ICON_NAMES: readonly string[] = Object.keys(ICONS);

export function getIcon(name: string): LucideIcon {
  const icon = ICONS[name as keyof typeof ICONS];
  if (icon) return icon;
  warnContent('services.json', `unknown icon "${name}", using the fallback icon instead`);
  return CircleDashed;
}
