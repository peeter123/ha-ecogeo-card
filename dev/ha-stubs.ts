// Adapted from hrv-ventilation dev/ha-stubs.ts. Stand-in for the Home Assistant element the card uses, for the
// preview page only: `ha-card` (the card frame with the theme's background).
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ha-card')
export class HaCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      background: var(--ha-card-background, var(--card-background-color));
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      color: var(--primary-text-color);
    }
  `;

  protected override render(): unknown {
    return html`<slot></slot>`;
  }
}
