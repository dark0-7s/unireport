import { CustomTemplate } from "../types";

const CUSTOM_TEMPLATES_KEY = "unireport_custom_templates_v3";
const TEMPLATE_USAGE_KEY = "unireport_template_usage_v3";

export function getCustomTemplates(): CustomTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // fallback
  }
  return [];
}

export function saveCustomTemplate(template: CustomTemplate): void {
  const list = getCustomTemplates();
  const idx = list.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    list[idx] = template;
  } else {
    list.unshift(template);
  }
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save custom template:", e);
  }
}

export function deleteCustomTemplate(id: string): void {
  const list = getCustomTemplates().filter((t) => t.id !== id);
  try {
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to delete custom template:", e);
  }
}

export function incrementTemplateUsage(templateId: string): void {
  try {
    const raw = localStorage.getItem(TEMPLATE_USAGE_KEY) || "{}";
    const counts = JSON.parse(raw);
    counts[templateId] = (counts[templateId] || 0) + 1;
    localStorage.setItem(TEMPLATE_USAGE_KEY, JSON.stringify(counts));
  } catch {
    // ignore
  }
}
