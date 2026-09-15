import { ScreenId } from '../types';

export type InterfaceCategory =
  | 'Core'
  | 'Tools'
  | 'Workspace'
  | 'Media'
  | 'System'
  | 'Utilities';

export interface InterfaceMetadata {
  id: string;
  name: string;
  route: ScreenId;
  category: InterfaceCategory;
  parent?: ScreenId;
  description: string;
  isAvailable: boolean;
  isScrollable: boolean;
  requiresState?: string;
  preferredDimensions: {
    width: number;
    height: number;
  };
  keywords: string[];
}

/**
 * Authoritative registry of actual AXON interfaces discovered in codebase.
 * Strictly mirrors real screens, routes, tools, and views without any invented placeholders.
 */
export const AXON_INTERFACES: InterfaceMetadata[] = [
  // 1. Core Interfaces
  {
    id: 'axon',
    name: 'AXON Chat',
    route: 'axon',
    category: 'Core',
    description: 'Main dual-pane interactive chat conversation and model selector bar',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['chat', 'conversation', 'axon', 'messages', 'home', 'main', 'assistant', 'prompt'],
  },

  // 2. Tools & Utilities Area
  {
    id: 'tools',
    name: 'Tools & Utilities',
    route: 'tools',
    category: 'Tools',
    description: 'Offline utility suites overview, category filter chips, and tool cards',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['tools', 'tools menu', 'utilities', 'tools and utilities', 'suite', 'offline tools'],
  },

  // 3. Workspace Interfaces
  {
    id: 'code',
    name: 'AXON Code',
    route: 'code',
    category: 'Workspace',
    description: 'Interactive code editor, sandbox execution runner, and traceback debugger',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['code', 'axon code', 'workspace code', 'editor', 'sandbox', 'developer', 'script'],
  },
  {
    id: 'automation',
    name: 'Automation & Run Code',
    route: 'automation',
    category: 'Workspace',
    description: 'Event-driven triggers, conditional rules engine, and live script layer',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['automation', 'run code', 'rules', 'triggers', 'scripts', 'automated'],
  },
  {
    id: 'notes',
    name: 'Library & Notes',
    route: 'notes',
    category: 'Workspace',
    description: 'Context notes, chat extractions, project specifications, and library documentation',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['library', 'notes', 'docs', 'context notes', 'extracts', 'project memory'],
  },

  // 4. Media Interfaces
  {
    id: 'video_editor',
    name: 'Video Editor',
    route: 'video_editor',
    category: 'Media',
    description: 'Multi-track video timeline editor, synthesizer waveform, and media canvas',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['video', 'video editor', 'timeline', 'waveform', 'media', 'synthesizer'],
  },

  // 5. System Interfaces
  {
    id: 'storage',
    name: 'Storage & Manifest',
    route: 'storage',
    category: 'System',
    description: 'Storage diagnostics, device budget bar, asset manifest table, and trim optimizer',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['storage', 'manifest', 'asset manifest', 'budget', 'diagnostics', 'trim', 'disk'],
  },
  {
    id: 'settings',
    name: 'Settings',
    route: 'settings',
    category: 'System',
    description: 'Appearance theme switcher, custom accent colors, icon presets, and preferences',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['settings', 'preferences', 'theme', 'dark mode', 'accent color', 'config'],
  },
  {
    id: 'account',
    name: 'AI Accounts',
    route: 'account',
    category: 'System',
    description: 'AI model provider credentials, API key settings, and cooldown monitors',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['account', 'ai accounts', 'api keys', 'credentials', 'gemini account', 'providers'],
  },
  {
    id: 'notifications',
    name: 'Notifications',
    route: 'notifications',
    category: 'System',
    description: 'System event log, timeline activity alerts, and storage warnings',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['notifications', 'alerts', 'activity', 'system log', 'events'],
  },

  // 6. Tools & Utilities Sub-screens (Parent: 'tools')
  {
    id: 'tool_text',
    name: 'Text Tools',
    route: 'tool_text',
    parent: 'tools',
    category: 'Utilities',
    description: 'Word & character counter, decorative fonts, line deduplicator, and case formatting',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['text', 'text tools', 'word counter', 'case converter', 'typography'],
  },
  {
    id: 'tool_calc',
    name: 'Calculation & Keypad',
    route: 'tool_calc',
    parent: 'tools',
    category: 'Utilities',
    description: 'Pocket calculator with tape memory, arithmetic history, and keypad input',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['calc', 'calculator', 'keypad', 'arithmetic', 'math tool'],
  },
  {
    id: 'tool_units',
    name: 'Unit Converters',
    route: 'tool_units',
    parent: 'tools',
    category: 'Utilities',
    description: 'Length, weight, temperature, and speed mobile unit conversions',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['units', 'unit converter', 'conversion', 'measurement', 'length', 'weight'],
  },
  {
    id: 'tool_colors',
    name: 'Color Tools',
    route: 'tool_colors',
    parent: 'tools',
    category: 'Utilities',
    description: 'Interactive spectrum picker, HEX/RGB/HSL inspector, and harmonic palette generator',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['color', 'color tools', 'palette', 'hex', 'rgb', 'picker', 'spectrum'],
  },
  {
    id: 'tool_images',
    name: 'Image Utilities',
    route: 'tool_images',
    parent: 'tools',
    category: 'Utilities',
    description: 'Format converter (PNG/JPG/WEBP), compressor, privacy blur, and collage grid combiner',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['image', 'image tools', 'image utilities', 'compressor', 'collage', 'blur filter'],
  },
  {
    id: 'tool_files',
    name: 'File Conversions',
    route: 'tool_files',
    parent: 'tools',
    category: 'Utilities',
    description: 'Image to PDF, PDF to text extractor, CSV ⇄ JSON formatter, and note exporter',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['file', 'file conversions', 'pdf converter', 'csv', 'json', 'pdf to text'],
  },
  {
    id: 'tool_speech_rate',
    name: 'Speech-Rate Analysis',
    route: 'tool_speech_rate',
    parent: 'tools',
    category: 'Utilities',
    description: 'Acoustic cadence meter, WPM benchmark, and speech syllables velocity tracker',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['speech', 'speech rate', 'wpm', 'cadence', 'acoustic', 'voice analyzer'],
  },
  {
    id: 'tool_bible',
    name: 'Offline Bible & Scriptures',
    route: 'tool_bible',
    parent: 'tools',
    category: 'Utilities',
    description: 'Local canonical scripture reader, instant concordance search, and verse bookmarks',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['bible', 'scriptures', 'offline bible', 'verses', 'concordance', 'reading'],
  },
  {
    id: 'tool_interface_capture',
    name: 'Interface Capture',
    route: 'tool_interface_capture',
    parent: 'tools',
    category: 'Utilities',
    description: 'Pixel-accurate DOM capture engine, long full-page stitching, and multi-page PDF exporter',
    isAvailable: true,
    isScrollable: true,
    preferredDimensions: { width: 430, height: 932 },
    keywords: ['capture', 'interface capture', 'screenshot', 'export ui', 'pdf export', 'ui capture'],
  },
];

// Dynamic interface store for runtime discovery and future screens
const dynamicInterfacesMap = new Map<string, InterfaceMetadata>();

/**
 * Registers an interface dynamically at runtime.
 * Allows new screens, tools, modals, or views to be registered
 * without editing existing source files.
 */
export function registerInterface(item: InterfaceMetadata): void {
  dynamicInterfacesMap.set(item.id, item);
}

/**
 * Unregisters a dynamically added interface.
 */
export function unregisterInterface(id: string): void {
  dynamicInterfacesMap.delete(id);
}

/**
 * Dynamically discovers all currently available interfaces in AXON:
 * 1. Registered interfaces from authoritative registry
 * 2. Dynamically registered interfaces
 * 3. Screen containers currently mounted in the live DOM
 * 4. Open modals or overlays in the live DOM
 */
export function discoverAvailableInterfaces(): InterfaceMetadata[] {
  const map = new Map<string, InterfaceMetadata>();

  // 1. Authoritative base interfaces
  for (const item of AXON_INTERFACES) {
    map.set(item.id, item);
  }

  // 2. Dynamically registered interfaces
  for (const [id, item] of dynamicInterfacesMap.entries()) {
    map.set(id, item);
  }

  // 3. Runtime DOM inspection for newly added or mounted screen containers
  if (typeof document !== 'undefined') {
    try {
      const screenContainers = document.querySelectorAll('[id^="screen-container-"]');
      screenContainers.forEach((container) => {
        const idAttr = container.id;
        const screenKey = idAttr.replace('screen-container-', '');
        if (screenKey && !map.has(screenKey)) {
          // Found an active screen in the DOM not yet in registry!
          const title = screenKey
            .split('_')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          map.set(screenKey, {
            id: screenKey,
            name: title,
            route: screenKey as ScreenId,
            category: 'Utilities',
            description: `Dynamically detected interface (${screenKey})`,
            isAvailable: true,
            isScrollable: true,
            preferredDimensions: { width: 430, height: 932 },
            keywords: [screenKey.toLowerCase(), title.toLowerCase()],
          });
        }
      });

      // 4. Check for active modals or overlays in DOM
      const modalElements = [
        { id: 'hamburger-drawer', name: 'Navigation Menu', keywords: ['hamburger', 'menu', 'drawer'] },
        { id: 'project-switcher-modal', name: 'Project Switcher', keywords: ['project', 'switcher', 'projects'] },
        { id: 'storage-onboarding-modal', name: 'Storage Onboarding', keywords: ['storage', 'onboarding'] },
      ];

      for (const m of modalElements) {
        const el = document.getElementById(m.id);
        if (el && !map.has(m.id)) {
          map.set(m.id, {
            id: m.id,
            name: m.name,
            route: 'axon',
            category: 'System',
            description: `Active interface overlay: ${m.name}`,
            isAvailable: true,
            isScrollable: false,
            preferredDimensions: { width: 430, height: 932 },
            keywords: m.keywords,
          });
        }
      }
    } catch {
      // Non-fatal DOM read fallback
    }
  }

  return Array.from(map.values());
}

/**
 * Returns all available interfaces in deterministic navigation hierarchy order.
 */
export function getAllInterfaces(): InterfaceMetadata[] {
  return discoverAvailableInterfaces();
}

/**
 * Retrieves a specific interface by ID or Route.
 */
export function getInterfaceById(idOrRoute: string): InterfaceMetadata | undefined {
  const all = discoverAvailableInterfaces();
  return all.find((item) => item.id === idOrRoute || item.route === idOrRoute);
}

export interface InterfaceQueryResolution {
  match?: InterfaceMetadata;
  isAll?: boolean;
  isCurrent?: boolean;
  isLongImage?: boolean;
  isPdf?: boolean;
  isAmbiguous?: boolean;
  candidates?: InterfaceMetadata[];
  unrecognizedName?: string;
}

/**
 * Resolves a natural language query against registered interfaces.
 */
export function resolveInterfaceFromQuery(query: string, currentScreen?: ScreenId): InterfaceQueryResolution {
  const normalized = query.trim().toLowerCase();

  // Check for "All interfaces" intent
  if (
    normalized.includes('all interfaces') ||
    normalized.includes('every interface') ||
    normalized.includes('all of axon') ||
    normalized.includes('all screens') ||
    normalized.includes('every screen') ||
    normalized.includes('whole app')
  ) {
    return {
      isAll: true,
      isLongImage: normalized.includes('long image') || normalized.includes('one long image') || normalized.includes('stitch'),
      isPdf: normalized.includes('pdf') || normalized.includes('document'),
    };
  }

  const interfaces = discoverAvailableInterfaces();

  // Check for "Current interface" intent
  if (
    normalized.includes('current interface') ||
    normalized.includes('this interface') ||
    normalized.includes('current screen') ||
    normalized.includes('this screen') ||
    normalized.includes('where i am') ||
    normalized.includes('what i am looking at')
  ) {
    const currentMeta = currentScreen ? getInterfaceById(currentScreen) : interfaces[0];
    return {
      isCurrent: true,
      match: currentMeta,
      isLongImage: normalized.includes('long image'),
      isPdf: normalized.includes('pdf'),
    };
  }

  // Check exact ID or route
  const exact = interfaces.find(
    (item) => item.id.toLowerCase() === normalized || item.route.toLowerCase() === normalized
  );
  if (exact) {
    return {
      match: exact,
      isLongImage: normalized.includes('long image'),
      isPdf: normalized.includes('pdf'),
    };
  }

  // Score matches based on name and keywords
  const scores: Array<{ item: InterfaceMetadata; score: number }> = [];

  for (const item of interfaces) {
    const itemName = item.name.toLowerCase();
    let score = 0;

    // Direct name match or containment
    if (normalized.includes(itemName)) {
      score += 50 + itemName.length;
    } else if (itemName.includes(normalized)) {
      score += 30;
    }

    // Keyword match
    for (const kw of item.keywords) {
      if (normalized.includes(kw)) {
        score += 15 + kw.length;
      }
    }

    if (score > 0) {
      scores.push({ item, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  if (scores.length === 0) {
    // If user asked "show me X" or "capture X" and nothing matched
    const capturedNameMatch = normalized.match(/(?:capture|show\s+me|image\s+of)\s+(?:the\s+)?([^.?!,]+)/i);
    const candidateName = capturedNameMatch ? capturedNameMatch[1].trim() : normalized;
    return {
      isAmbiguous: true,
      candidates: interfaces.slice(0, 5),
      unrecognizedName: candidateName,
    };
  }

  // If top score is dominant, pick it
  const top = scores[0];
  const second = scores[1];
  if (second && second.score >= top.score * 0.9 && top.score < 40) {
    return {
      isAmbiguous: true,
      candidates: scores.slice(0, 4).map((s) => s.item),
    };
  }

  return {
    match: top.item,
    isLongImage: normalized.includes('long image'),
    isPdf: normalized.includes('pdf'),
  };
}

/**
 * Generates a clean, sanitized, standard filename for an interface capture.
 * Example: AXON_Settings.png, AXON_All_Interfaces.png, AXON_Interface_Documentation.pdf
 */
export function getSafeInterfaceFileName(
  interfaceName: string,
  format: 'png' | 'jpg' | 'pdf' = 'png',
  isLongImage: boolean = false
): string {
  if (interfaceName.toLowerCase().includes('all') && isLongImage) {
    return `AXON_All_Interfaces.${format}`;
  }
  if (format === 'pdf') {
    return `AXON_Interface_Documentation.pdf`;
  }

  const clean = interfaceName
    .trim()
    .replace(/[&]/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_');

  const base = clean.startsWith('AXON_') ? clean : `AXON_${clean}`;
  return `${base}.${format}`;
}
