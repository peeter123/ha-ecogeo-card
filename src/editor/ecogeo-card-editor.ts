// Copied from hrv-ventilation src/editor/hrv-card-editor.ts. Deviations: tag name and strings are this card's; the
// schema comes from `schemaFor` (a function of the config, see ecogeo-schema.ts) instead of a fixed `schema`; the
// "Advanced settings" switch is kept but never locked on (turning it off hides the entity pickers and keeps the
// overrides; it starts on when the config has an `entities` key); the config reaches ha-form through `toFormData`
// and comes back through `fromFormData`, and the saved config is pruned of empty groups (add-card-editor D3); the
// colour stop rows are shown from and folded back into `colors` (color-rows.ts); the card's configuration error is
// shown above the form; no list-of-text draft handling (this card has no text lists).
// The visual editor: Home Assistant's own `ha-form` with the card's schema, and nothing else of Home Assistant. It
// only fires `config-changed`; it calls no service and changes no entity.
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { configErrors } from '../config/options';
import { valueAt, type CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import type { HassLike } from '../lib/hass';
import { EDITOR } from '../strings';
import {
  colorRowData,
  colorRowOf,
  draftOf,
  foldDraft,
  splitColorRows,
  updateDraft,
  withColors,
  type DraftRow,
} from './color-rows';
import { editorSchema, EMPTY_GROUPS, NESTED_GROUPS } from './ecogeo-schema';
import {
  clearedPaths,
  fieldsWithPaths,
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

const SWITCH_SCHEMA: FormSchema = [{ name: 'advanced', selector: { boolean: {} } }];
const switchLabel = (): string => EDITOR.advanced;

const SECTION_LABELS: Readonly<Record<string, string>> = EDITOR.sections;
const FIELD_LABELS: Readonly<Record<string, string>> = EDITOR.fields;
const ROLE_LABELS: Readonly<Record<string, string>> = EDITOR.roles;

/** The label of a section or field: its title, or its name looked up in the section or field strings. */
function label(item: FormField | FormSection): string {
  if (isSection(item)) return item.title ?? SECTION_LABELS[item.name] ?? item.name;
  const row = colorRowOf(item.name);
  if (row !== undefined) return EDITOR.colorRow[row.part](row.index + 1);
  return FIELD_LABELS[item.name] ?? ROLE_LABELS[item.name] ?? item.name;
}

const hasEntities = (config: CardConfig): boolean => Object.hasOwn(config, 'entities');

export class EcogeoCardEditor extends LitElement {
  static override styles = css`
    .hint {
      color: var(--secondary-text-color);
    }
    .switch {
      display: block;
      margin-bottom: 8px;
    }
    .error {
      color: var(--error-color);
      margin: 0 0 8px;
    }
  `;

  @property({ attribute: false }) hass?: HassLike;

  /** The schema for a config and the number of colour rows to show (the editor's draft); the card's own by default. */
  @property({ attribute: false }) schemaFor: (config: CardConfig, colorRows?: number) => EditorSchema = editorSchema;

  @state() private _config?: CardConfig;

  // The "Advanced settings" switch, as the data of its form: editor state, never written to the config. It starts on
  // when the config has an `entities` key and is turned on again when one arrives from outside; only the user turns it off.
  @state() private _switch = { advanced: false };

  @state() private _formDefined = customElements.get('ha-form') !== undefined;

  // The schema of the current config, replaced only when it changes: a new schema object makes ha-form rebuild its
  // fields, which would collapse the sections the user has opened.
  private _schema: EditorSchema = [];
  private _formSchema: FormSchema = [];

  // What ha-form displays: the config with the defaults of unset fields filled in and the coded values as form values.
  private _shown: CardConfig = {};

  // The colour rows in the order typed, rebuilt from the config only when the editor opens or when `colors` arrives
  // from outside (differs from the last list the editor fired or saw), see color-rows.ts.
  private _draft: DraftRow[] = [];
  private _colorsSeen: unknown;
  private _draftBuilt = false;

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
    const hadEntities = this._config !== undefined && hasEntities(this._config);
    if (hasEntities(config) && !hadEntities && !this._switch.advanced) this._switch = { advanced: true };
    if (!this._draftBuilt || JSON.stringify(config['colors']) !== JSON.stringify(this._colorsSeen)) {
      this._draft = draftOf(config);
      this._colorsSeen = config['colors'];
      this._draftBuilt = true;
    }
    this._config = config;
    this._refreshSchema(config);
  }

  private _refreshSchema(config: CardConfig): void {
    const next = this.schemaFor(config, this._draft.length);
    if (JSON.stringify(next) === JSON.stringify(this._schema)) return;
    this._schema = next;
    this._formSchema = visibleSchema(next, this._switch.advanced);
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has('schemaFor') && this._config) this._refreshSchema(this._config);
    if (changed.has('_switch')) this._formSchema = visibleSchema(this._schema, this._switch.advanced);
    // Rebuilt only when the config or the schema changes, so ha-form is not handed new data on every hass update.
    if (this._config && (changed.has('_config') || changed.has('schemaFor'))) {
      this._shown = {
        ...toFormData(this._schema, withShownDefaults(this._schema, this._config, this._emptied)),
        ...(this._hasColorRows ? colorRowData(this._draft) : {}),
      };
    }
  }

  /** True when the schema has the colour stop rows (a schema of another builder may not). */
  private get _hasColorRows(): boolean {
    return fieldsWithPaths(this._schema).some(({ path }) => colorRowOf(path) !== undefined);
  }

  private _toggleAdvanced = (event: CustomEvent<{ value: { advanced?: boolean } }>): void => {
    event.stopPropagation();
    this._switch = { advanced: event.detail.value.advanced === true };
  };

  private _configChanged = (event: CustomEvent<{ value: CardConfig }>): void => {
    event.stopPropagation();
    const current = this._config ?? {};
    // ha-form reports the whole data it displays, defaults included: keep out the keys of cleared fields (reported
    // as undefined or as an empty text) and the defaults the config did not have.
    // The colour rows are folded into `colors` below and never reach the config as keys of their own.
    const hasRows = this._hasColorRows;
    const split = hasRows ? splitColorRows(event.detail.value) : undefined;
    const reported = withoutUndefined(withoutEmptyTexts(this._schema, split?.rest ?? event.detail.value));
    const shownRest = hasRows ? splitColorRows(this._shown).rest : this._shown;
    const cleared = clearedPaths(this._schema, shownRest, reported);
    this._emptied = new Set([...this._emptied, ...cleared].filter((path) => valueAt(reported, path) === undefined));
    const decoded = fromFormData(this._schema, reported, current);
    // Values the editor cannot represent (`prefix: ''`, `features:` without a value, an invalid value) are normalised
    // on the first edit; the card's error is shown above the form until then (design D2).
    const pruned = withoutEmptyGroups(
      withoutShownDefaults(this._schema, current, decoded),
      current,
      EMPTY_GROUPS,
      NESTED_GROUPS,
    );
    if (split) this._draft = updateDraft(this._draft, split.rows);
    const colors = split ? foldDraft(this._draft, current) : 'keep';
    const config = colors === 'keep' ? pruned : withColors(pruned, colors);
    this._colorsSeen = config['colors'];
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
                class="switch"
                .hass=${this.hass}
                .data=${this._switch}
                .schema=${SWITCH_SCHEMA}
                .computeLabel=${switchLabel}
                @value-changed=${this._toggleAdvanced}
              ></ha-form>
              <ha-form
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
