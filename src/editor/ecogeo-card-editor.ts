// Copied from hrv-ventilation src/editor/hrv-card-editor.ts. Deviations: tag name and strings are this card's; the
// schema comes from `schemaFor` (a function of the config, see ecogeo-schema.ts) instead of a fixed `schema`; the
// "Advanced settings" switch is left out until task 2.1 (only the non-advanced fields are shown); the config
// reaches ha-form through `toFormData` and comes back through `fromFormData`, and the saved config is pruned of
// empty groups (add-card-editor D3); the card's configuration error is shown above the form; no list-of-text
// draft handling (this card has no text lists).
// The visual editor: Home Assistant's own `ha-form` with the card's schema, and nothing else of Home Assistant. It
// only fires `config-changed`; it calls no service and changes no entity.
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { configErrors } from '../config/options';
import { valueAt, type CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import type { HassLike } from '../lib/hass';
import { EDITOR } from '../strings';
import { editorSchema, EMPTY_GROUPS } from './ecogeo-schema';
import {
  clearedPaths,
  fromFormData,
  isSection,
  toFormData,
  visibleSchema,
  withoutEmptyGroups,
  withoutEmptyTexts,
  withoutShownDefaults,
  withoutUndefined,
  withShownDefaults,
  type EditorSchema,
  type FormField,
  type FormSchema,
  type FormSection,
} from './schema';

export const EDITOR_TAG = 'ecogeo-card-editor';

const SECTION_LABELS: Readonly<Record<string, string>> = EDITOR.sections;
const FIELD_LABELS: Readonly<Record<string, string>> = EDITOR.fields;

/** The label of a section or field: its title, or its name looked up in the section or field strings. */
function label(item: FormField | FormSection): string {
  if (isSection(item)) return item.title ?? SECTION_LABELS[item.name] ?? item.name;
  return FIELD_LABELS[item.name] ?? item.name;
}

export class EcogeoCardEditor extends LitElement {
  static override styles = css`
    .hint {
      color: var(--secondary-text-color);
    }
    .error {
      color: var(--error-color);
      margin: 0 0 8px;
    }
  `;

  @property({ attribute: false }) hass?: HassLike;

  /** The schema for a config; the card's own by default. */
  @property({ attribute: false }) schemaFor: (config: CardConfig) => EditorSchema = editorSchema;

  @state() private _config?: CardConfig;

  @state() private _formDefined = customElements.get('ha-form') !== undefined;

  // The schema of the current config, replaced only when it changes: a new schema object makes ha-form rebuild its
  // fields, which would collapse the sections the user has opened.
  private _schema: EditorSchema = [];
  private _formSchema: FormSchema = [];

  // What ha-form displays: the config with the defaults of unset fields filled in and the coded values as form values.
  private _shown: CardConfig = {};

  // The fields the user just cleared. They stay empty instead of showing their default again (the box would refill
  // and typing 5 would give 105) until the config is set from outside.
  private _emptied = new Set<string>();

  constructor() {
    super();
    if (!this._formDefined) {
      void customElements.whenDefined('ha-form').then(() => {
        this._formDefined = true;
      });
    }
  }

  /** Called by Home Assistant with the card's config, also after edits in the code editor. */
  setConfig(config: CardConfig): void {
    // Home Assistant may hand back the config this editor just fired: that is not a change from outside.
    const fromOutside = JSON.stringify(config) !== JSON.stringify(this._config);
    if (this._emptied.size > 0 && fromOutside) this._emptied = new Set();
    this._config = config;
    this._refreshSchema(config);
  }

  private _refreshSchema(config: CardConfig): void {
    const next = this.schemaFor(config);
    if (JSON.stringify(next) === JSON.stringify(this._schema)) return;
    this._schema = next;
    // The switch for advanced fields comes with task 2.1: until then only the basic fields are shown.
    this._formSchema = visibleSchema(next, false);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('schemaFor') && this._config) this._refreshSchema(this._config);
    // Rebuilt only when the config or the schema changes, so ha-form is not handed new data on every hass update.
    if (this._config && (changed.has('_config') || changed.has('schemaFor'))) {
      this._shown = toFormData(this._schema, withShownDefaults(this._schema, this._config, this._emptied));
    }
  }

  private _configChanged = (event: CustomEvent<{ value: CardConfig }>): void => {
    event.stopPropagation();
    const current = this._config ?? {};
    // ha-form reports the whole data it displays, defaults included: keep out the keys of cleared fields (reported
    // as undefined or as an empty text) and the defaults the config did not have.
    const reported = withoutUndefined(withoutEmptyTexts(this._schema, event.detail.value));
    const cleared = clearedPaths(this._schema, this._shown, reported);
    this._emptied = new Set([...this._emptied, ...cleared].filter((path) => valueAt(reported, path) === undefined));
    const decoded = fromFormData(this._schema, reported, current);
    // Values the editor cannot represent (`prefix: ''`, `features:` without a value, an invalid value) are normalised
    // on the first edit; the card's error is shown above the form until then (design D2).
    const config = withoutEmptyGroups(withoutShownDefaults(this._schema, current, decoded), current, EMPTY_GROUPS);
    this._config = config;
    this._refreshSchema(config);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  };

  protected override render(): unknown {
    if (!this._config) return nothing;
    const errors = configErrors(this._config);
    return html`
      ${errors.length > 0 ? html`<p class="error" role="alert">${errors.join('; ')}</p>` : nothing}
      ${
        this._formDefined
          ? html`<ha-form
              .hass=${this.hass}
              .data=${this._shown}
              .schema=${this._formSchema}
              .computeLabel=${label}
              @value-changed=${this._configChanged}
            ></ha-form>`
          : html`<p class="hint">${EDITOR.noForm}</p>`
      }
    `;
  }
}

defineOnce(EDITOR_TAG, EcogeoCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    'ecogeo-card-editor': EcogeoCardEditor;
  }
}
