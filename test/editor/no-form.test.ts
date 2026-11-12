// Adapted from hrv-ventilation test/editor/no-form.test.ts.
// Runs in its own happy-dom environment, where Home Assistant's ha-form is not defined at first.
import { describe, expect, test } from 'vitest';
import '../../src/editor/ecogeo-card-editor';
import { CONFIG_ERRORS, EDITOR } from '../../src/strings';

describe('ecogeo-card-editor without ha-form', () => {
  test('the editor tells the user to use the code editor, still shows the config error, and draws the form once ha-form exists', async () => {
    const editor = document.createElement('ecogeo-card-editor');
    editor.setConfig({ type: 'custom:ecogeo-card', model: 'B', dhw: 'internal' });
    document.body.append(editor);
    await editor.updateComplete;
    expect(editor.shadowRoot?.textContent).toContain(EDITOR.noForm);
    expect(editor.shadowRoot?.textContent).toContain(CONFIG_ERRORS.dhwMismatch('internal', 'B'));
    expect(editor.shadowRoot?.querySelector('ha-form')).toBeNull();

    // When Home Assistant defines ha-form later, the form replaces the hint.
    customElements.define('ha-form', class extends HTMLElement {});
    await customElements.whenDefined('ha-form');
    await new Promise((resolve) => setTimeout(resolve, 0));
    await editor.updateComplete;
    expect(editor.shadowRoot?.querySelectorAll('ha-form')).toHaveLength(1);
    expect(editor.shadowRoot?.textContent).not.toContain(EDITOR.noForm);
  });
});
