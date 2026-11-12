// A stand-in for Home Assistant's ha-form and helpers to open the editor with it, shared by the editor tests of the
// advanced pickers and the colour rows.
import type { EcogeoCardEditor } from '../../src/editor/ecogeo-card-editor';
import type { FormSchema } from '../../src/editor/schema';
import type { CardConfig } from '../../src/lib/config';

/**
 * Stands in for Home Assistant's ha-form: keeps what the editor passes and can emit value-changed. Adapted from the
 * stand-in in hrv-ventilation test/editor/hrv-card-editor.test.ts.
 */
export class StubForm extends HTMLElement {
  schema: FormSchema = [];
  data: Record<string, unknown> = {};
  computeLabel?: (item: { name: string; type?: string; title?: string; schema?: unknown[] }) => string;

  change(value: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent('value-changed', { detail: { value }, bubbles: true, composed: true }));
  }
}

export interface Opened {
  editor: EcogeoCardEditor;
  /** The form of the fields. */
  form: StubForm;
  /** The form of the "Advanced settings" switch. */
  toggle: StubForm;
  /** The configs the editor reports through config-changed. */
  saved: CardConfig[];
}

export async function openEditor(config: CardConfig): Promise<Opened> {
  const editor = document.createElement('ecogeo-card-editor');
  editor.setConfig(config);
  document.body.append(editor);
  await editor.updateComplete;
  const form = editor.shadowRoot?.querySelector<StubForm>('ha-form:not(.switch)');
  const toggle = editor.shadowRoot?.querySelector<StubForm>('ha-form.switch');
  if (!form || !toggle) throw new Error('editor did not render its forms');
  const saved: CardConfig[] = [];
  editor.addEventListener('config-changed', (event) => {
    saved.push((event as CustomEvent<{ config: CardConfig }>).detail.config);
  });
  return { editor, form, toggle, saved };
}

/** What ha-form reports when the user clears a field: the data with `undefined` at the dotted path. */
export function cleared(data: Record<string, unknown>, path: string): Record<string, unknown> {
  const [key, ...rest] = path.split('.') as [string, ...string[]];
  if (rest.length === 0) return { ...data, [key]: undefined };
  return { ...data, [key]: cleared(data[key] as Record<string, unknown>, rest.join('.')) };
}
