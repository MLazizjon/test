import { Globe, Monitor, BookOpen, Palette, Calculator, Atom, BookText, Code, Puzzle, Building2 } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  globe: Globe,
  monitor: Monitor,
  'book-open': BookOpen,
  palette: Palette,
  calculator: Calculator,
  atom: Atom,
  'book-text': BookText,
  code: Code,
  puzzle: Puzzle,
  building: Building2,
};

export function GroupIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] || BookOpen;
  return <Icon className={className} />;
}
