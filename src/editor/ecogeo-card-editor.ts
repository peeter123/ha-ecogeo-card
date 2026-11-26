// Copied from hrv-ventilation src/editor/hrv-card-editor.ts. Deviations: tag name and strings are this card's; the
// schema comes from `schemaFor` (a function of the config, see ecogeo-schema.ts) instead of a fixed `schema`; the
// "Advanced settings" switch is kept but never locked on (turning it off hides the entity pickers and keeps the
// overrides; it starts on when the config has an `entities` or `states` key); the config reaches ha-form through `toFormData`
// and comes back through `fromFormData`, and the saved config is pruned of empty groups (add-card-editor D3); the
// colour stop rows are shown from and folded back into `colors` (color-rows.ts); the card's configuration error is
// shown above the form; no list-of-text draft handling (this card has no text lists).
// The visual editor: Home Assistant's own `ha-form` with the card's schema, and nothing else of Home Assistant. It
// only fires `config-changed`; it calls no service and changes no entity.
import { css, html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { configErrors, notPresentRoles } from '../config/options';
import { DEFAULT_STATES } from '../config/states';
import { valueAt, type CardConfig } from '../lib/config';
import { defineOnce } from '../lib/define';
import type { HassEntityRegistryEntry, HassEntityState, HassLike } from '../lib/hass';
import { EDITOR } from '../strings';
import { suggestEntities } from '../suggest/suggest';
import { bindingWarnings } from './binding-check';
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
import {
  DEVICE_FIELD,
  editorSchema,
  EMPTY_GROUPS,
  NESTED_GROUPS,
  NOT_PRESENT_FIELD,
  stateOptions,
} from './ecogeo-schema';
import { roleLabel } from './role-labels';
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
  withValueAt,
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
  if (item.label !== undefined) return item.label;
  return FIELD_LABELS[item.name] ?? ROLE_LABELS[item.name] ?? item.name;
}

/** True for a config with `entities` or `states`: the advanced settings open for it. */
const hasAdvanced = (config: CardConfig): boolean =>
  Object.hasOwn(config, 'entities') || Object.hasOwn(config, 'states');

const hasEntities = (config: CardConfig): boolean => Object.hasOwn(config, 'entities');

/** The fields of the form that are not keys of the config. */
const VIRTUAL_FIELDS: readonly string[] = [DEVICE_FIELD, NOT_PRESENT_FIELD];

/** The `states` lists left out of the config when empty or equal to their default (unless already set that way). */
function withoutDefaultStates(config: CardConfig, current: CardConfig): CardConfig {
  const states = config['states'];
  if (typeof states !== 'object' || states === null || Array.isArray(states)) return config;
  const same = (a: unknown, b: unknown): boolean =>
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((item, i) => String(item).trim().toLowerCase() === String(b[i]).trim().toLowerCase());
  const kept = Object.entries(states).filter(([key, list]) => {
    if (!Array.isArray(list)) return true;
    if (list.length === 0) return false;
    const defaults = key === 'off' || key === 'defrost' ? DEFAULT_STATES[key] : undefined;
    const unchanged = JSON.stringify(list) === JSON.stringify(valueAt(current, `states.${key}`));
    return defaults === undefined || !same(list, defaults) || unchanged;
  });
  return { ...config, states: Object.fromEntries(kept) };
}

/** The config with the roles of `wanted` set to `none` and the other `none` roles of `current` removed. */
function withNotPresent(config: CardConfig, wanted: ReadonlySet<string>, current: CardConfig): CardConfig {
  let next = config;
  for (const path of notPresentRoles(current)) {
    if (!wanted.has(path)) next = withValueAt(next, `entities.${path}`, undefined, current);
  }
  for (const path of wanted) next = withValueAt(next, `entities.${path}`, 'none', current);
  return next;
}

/** The device the form reports, or undefined when none is picked. */
function pickedDevice(device: unknown): string | undefined {
  return typeof device === 'string' && device !== '' ? device : undefined;
}

/** True for a `states.*` list the user emptied to [] (it stays blank until a value is added). */
function isEmptyStateList(reported: CardConfig, path: string): boolean {
  const list = valueAt(reported, path);
  return path.startsWith('states.') && Array.isArray(list) && list.length === 0;
}

/**
 * The decoded form with the "not present" field applied, when the form reported one (a list, or the key itself).
 * `formData` is the form's full reported data, the not-present key included.
 */
function decodeNotPresent(decodedForm: CardConfig, formData: CardConfig, current: CardConfig): CardConfig {
  const notPresent = formData[NOT_PRESENT_FIELD];
  if (!Array.isArray(notPresent) && !Object.hasOwn(formData, NOT_PRESENT_FIELD)) return decodedForm;
  const wanted = new Set(Array.isArray(notPresent) ? notPresent.filter((p): p is string => typeof p === 'string') : []);
  return withNotPresent(decodedForm, wanted, current);
}

/** The emptied paths after an edit: the ones the user cleared are added, the ones that have a value again dropped. */
function emptiedAfter(
  schema: EditorSchema,
  emptied: ReadonlySet<string>,
  reported: CardConfig,
  shownRest: CardConfig,
): Set<string> {
  // A state list emptied to [] stays blank, like a cleared field: its default does not reappear until a value is added.
  const cleared = [
    ...clearedPaths(schema, shownRest, reported),
    ...fieldsWithPaths(schema)
      .map(({ path }) => path)
      .filter((path) => isEmptyStateList(reported, path) && valueAt(shownRest, path) !== undefined),
  ].filter((path) => !VIRTUAL_FIELDS.includes(path));
  return new Set(
    [...emptied, ...cleared].filter(
      (path) => valueAt(reported, path) === undefined || isEmptyStateList(reported, path),
    ),
  );
}

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
    .suggest {
      margin: 8px 0;
      padding: 8px 16px;
      border: none;
      border-radius: var(--ha-border-radius-pill, 18px);
      background: var(--primary-color);
      color: var(--text-primary-color);
      font: inherit;
      font-weight: 500;
      cursor: pointer;
    }
    .suggest:disabled {
      background: var(--disabled-color);
      cursor: default;
    }
    .report,
    .warnings {
      margin: 0 0 8px;
      padding-left: 20px;
      color: var(--secondary-text-color);
    }
    .warnings {
      color: var(--warning-color, var(--secondary-text-color));
    }
    .title {
      margin: 8px 0 0;
      font-weight: 500;
    }
  `;

  @property({ attribute: false }) hass?: HassLike;

  /** The schema for a config and the number of colour rows to show (the editor's draft); the card's own by default. */
  @property({ attribute: false }) schemaFor: (
    config: CardConfig,
    colorRows?: number,
    states?: Readonly<Record<string, HassEntityState | undefined>>,
  ) => EditorSchema = editorSchema;

  @state() private _config?: CardConfig;

  // The "Advanced settings" switch, as the data of its form: editor state, never written to the config. It starts on
  // when the config has an `entities` or `states` key and is turned on again when one arrives from outside; only the user turns it off.
  @state() private _switch = { advanced: false };

  // The device picked for the suggestions and what the last suggestion did: editor state, never written to the
  // config. The report stays until the next edit.
  @state() private _device?: string;
  @state() private _report?: { filled: number; empty: string[] };

  // The options of the enum entities behind the state lists, as text: the schema is rebuilt when they change.
  private _optionsKey = '';

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
    if (fromOutside) this._report = undefined;
    const hadAdvanced = this._config !== undefined && hasAdvanced(this._config);
    if (hasAdvanced(config) && !hadAdvanced && !this._switch.advanced) this._switch = { advanced: true };
    if (!this._draftBuilt || JSON.stringify(config['colors']) !== JSON.stringify(this._colorsSeen)) {
      this._draft = draftOf(config);
      this._colorsSeen = config['colors'];
      this._draftBuilt = true;
    }
    this._config = config;
    this._refreshSchema(config);
  }

  private _refreshSchema(config: CardConfig): void {
    const next = this.schemaFor(config, this._draft.length, this.hass?.states);
    this._optionsKey = JSON.stringify(stateOptions(config, this.hass?.states));
    if (JSON.stringify(next) === JSON.stringify(this._schema)) return;
    this._schema = next;
    this._formSchema = visibleSchema(next, this._switch.advanced);
  }

  protected override willUpdate(changed: PropertyValues): void {
    this._syncSchema(changed);
    if (changed.has('_switch')) this._formSchema = visibleSchema(this._schema, this._switch.advanced);
    // Rebuilt only when the config or the schema changes, so ha-form is not handed new data on every hass update.
    if (this._config && (changed.has('_config') || changed.has('schemaFor') || changed.has('_device'))) {
      this._shown = this._shownData(this._config);
    }
  }

  /** Refreshes the schema when the builder changed, or when the states changed the options of a state list. */
  private _syncSchema(changed: PropertyValues): void {
    if (changed.has('schemaFor') && this._config) this._refreshSchema(this._config);
    else if (
      changed.has('hass') &&
      this._config &&
      JSON.stringify(stateOptions(this._config, this.hass?.states)) !== this._optionsKey
    )
      this._refreshSchema(this._config);
  }

  /** The data ha-form shows: the config as form data, the colour rows, the device and the not-present roles. */
  private _shownData(config: CardConfig): Record<string, unknown> {
    return {
      ...toFormData(this._schema, withShownDefaults(this._schema, config, this._emptied)),
      ...(this._hasColorRows ? colorRowData(this._draft) : {}),
      ...(this._has(DEVICE_FIELD) && this._device !== undefined ? { [DEVICE_FIELD]: this._device } : {}),
      ...(this._has(NOT_PRESENT_FIELD) ? { [NOT_PRESENT_FIELD]: [...notPresentRoles(config)] } : {}),
    };
  }

  /** True when the schema has the field (a schema of another builder may not). */
  private _has(name: string): boolean {
    return fieldsWithPaths(this._schema).some(({ path }) => path === name);
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
    // The device is editor state: picking one changes no config. "Not present" is a view of the `none` roles.
    const { [DEVICE_FIELD]: device, [NOT_PRESENT_FIELD]: notPresent, ...formValue } = event.detail.value;
    const hasDevice = this._has(DEVICE_FIELD);
    const picked = pickedDevice(device);
    if (hasDevice && picked !== this._device) {
      this._device = picked;
      this._report = undefined;
      return;
    }
    this._report = undefined;
    const hasNotPresent = this._has(NOT_PRESENT_FIELD);
    const value = hasDevice || hasNotPresent ? formValue : event.detail.value;
    // ha-form reports the whole data it displays, defaults included: keep out the keys of cleared fields (reported
    // as undefined or as an empty text) and the defaults the config did not have.
    // The colour rows are folded into `colors` below and never reach the config as keys of their own.
    const hasRows = this._hasColorRows;
    const split = hasRows ? splitColorRows(value) : undefined;
    const reported = withoutUndefined(withoutEmptyTexts(this._schema, split?.rest ?? value));
    const shownRest = hasRows ? splitColorRows(this._shown).rest : this._shown;
    this._emptied = emptiedAfter(this._schema, this._emptied, reported, shownRest);
    const decodedForm = fromFormData(this._schema, reported, current);
    const decoded = hasNotPresent ? decodeNotPresent(decodedForm, event.detail.value, current) : decodedForm;
    // Values the editor cannot represent (`prefix: ''`, `features:` without a value, an invalid value) are normalised
    // on the first edit; the card's error is shown above the form until then (design D2).
    const pruned = withoutEmptyGroups(
      withoutDefaultStates(withoutShownDefaults(this._schema, current, decoded), current),
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

  private _pickDevice(): string | undefined {
    return this.hass === undefined ? undefined : this._device;
  }

  /** "Suggest entities": binds the device's entities to the open roles, writes them as `entities`, opens the advanced part. */
  private _suggest = (): void => {
    const deviceId = this._pickDevice();
    const hass = this.hass;
    if (deviceId === undefined || hass === undefined || this._config === undefined) return;
    const current = this._config;
    const { entities, report } = suggestEntities({
      states: hass.states,
      entities: (hass.entities ?? {}) as Readonly<Record<string, HassEntityRegistryEntry>>,
      devices: hass.devices ?? {},
      deviceId,
      config: current,
    });
    this._switch = { advanced: true };
    this._report = { filled: report.filled.length, empty: report.empty.map(roleLabel) };
    // Nothing filled and no `entities` yet: do not add an empty group.
    const config = Object.keys(entities).length === 0 && !hasEntities(current) ? current : { ...current, entities };
    if (JSON.stringify(config) === JSON.stringify(current)) return;
    this._config = config;
    this._refreshSchema(config);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }));
  };

  private _renderNotes(): unknown {
    const warnings = this._config ? bindingWarnings(this._config, this.hass?.states) : [];
    return html`
      ${
        this._has(DEVICE_FIELD)
          ? html`<button
              type="button"
              class="suggest"
              ?disabled=${this._pickDevice() === undefined}
              @click=${this._suggest}
            >
              ${EDITOR.suggest.button}
            </button>`
          : nothing
      }
      ${
        this._report
          ? html`<ul class="report" role="status">
              <li>${EDITOR.suggest.filled(this._report.filled)}</li>
              ${this._report.empty.length > 0 ? html`<li>${EDITOR.suggest.empty(this._report.empty)}</li>` : nothing}
            </ul>`
          : nothing
      }
      ${
        warnings.length > 0
          ? html`<p class="title">${EDITOR.suggest.warningsTitle}</p>
              <ul class="warnings">
                ${warnings.map((warning) => html`<li>${warning}</li>`)}
              </ul>`
          : nothing
      }
    `;
  }

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
              ></ha-form>
              ${this._renderNotes()}`
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
