// Machine-readable catalogue of the UI library. The /design page renders it, and AI agents
// should read it before building UI. Add an entry here whenever a component is added to components/ui.

export const UI_GROUPS = ["Actions", "Inputs", "Display", "Feedback", "Motion", "Layout"] as const;

export type RegistryEntry = {
  name: string;
  file: string;
  group: (typeof UI_GROUPS)[number];
  description: string;
  props: string;
  example: string;
};

export const UI_REGISTRY: RegistryEntry[] = [];
