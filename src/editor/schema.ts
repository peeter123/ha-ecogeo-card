// Copied from hrv-ventilation src/editor/schema.ts. Deviations: `EditorField.coded` with `toFormData` and
// `fromFormData` (a select whose form value is text while the config value is a boolean, such as a feature);
// `withoutEmptyTexts` and `withoutEmptyGroups` (the minimal writes of add-card-editor D3) take the place of
// `withoutBlankTexts` (this card has no text lists); `withValueAt` keeps the position of an existing key; sections
// can nest (the entity pickers sit in one section per role group inside an `entities` section, so the form data has
// the config's own shape `entities.<group>.<role>`); `withoutEmptyGroups` also prunes emptied nested groups; the
// imports are this card's. `hasAdvancedValue` is kept unused: this card's switch follows `entities` or `states`; `withValueAt` is exported.
// The editor schema of a card: Home Assistant `ha-form` fields and expandable sections, each field marked basic
// or advanced. The pure functions here decide what the form shows; the editor element only renders their result.
import { parseNumericState } from '../lib/availability';
import type { CardConfig } from '../lib/config';
import { valueAt } from '../lib/config';

/** One form field. `selector` is a Home Assistant selector, e.g. `{ entity: { filter: { domain: 'sensor' } } }`. */
export interface EditorField {
  name: string;
  selector: Readonly<Record<string, unknown>>;
  required?: boolean;
  /** Hidden while the "Advanced settings" switch is off. */
  advanced?: boolean;
  /**
   * The value the card uses when the field is not set. Only `hasAdvancedValue` reads it, which is kept unused: this
   * card's "Advanced settings" switch starts on when the config has an `entities` override (design D5), not when an
   * advanced field differs from its default.
   */
  default?: unknown;
  /**
   * For a select whose option values are text while the config holds something else (a boolean): pairs of the form's
   * value and the config's value. A config value of `undefined` means "not set": choosing it removes the key.
   */
  coded?: readonly (readonly [form: string, config: unknown])[];
}

/**
 * An expandable section; `ha-form` nests its fields' values under `name` in the config, or keeps them at the top
 * level with `flatten` (a section that only groups fields in the editor). Without a `title` the editor looks the
 * name up in the editor strings.
 */
export interface EditorSection {
  type: 'expandable';
  name: string;
  title?: string;
  flatten?: boolean;
  schema: readonly (EditorField | EditorSection)[];
}

export type EditorSchema = readonly (EditorField | EditorSection)[];

/** What `ha-form` receives: the same shapes without the editor's own `advanced` mark. */
export type FormField = Omit<EditorField, 'advanced'>;

export interface FormSection extends Omit<EditorSection, 'schema'> {
  schema: FormSchema;
}

export type FormSchema = readonly (FormField | FormSection)[];

/** True for a section, in an editor schema or in the form schema derived from it. */
export function isSection<T extends EditorField | FormField>(
  item: T | EditorSection | FormSection,
): item is Exclude<typeof item, T> {
  return 'type' in item;
}

function toFormField(field: EditorField): FormField {
  const { advanced, ...formField } = field;
  return formField;
}

function visibleItems(items: EditorSchema, showAdvanced: boolean): FormSchema {
  return items.flatMap((item): (FormField | FormSection)[] => {
    if (!isSection(item)) return showAdvanced || item.advanced !== true ? [toFormField(item)] : [];
    const inner = visibleItems(item.schema, showAdvanced);
    return inner.length > 0 ? [{ ...item, schema: inner }] : [];
  });
}

/** Every field of the schema with the config path its value lives at ("outdoor.temperature", "min_scale"). */
export function fieldsWithPaths(
  schema: EditorSchema | FormSchema,
  prefix = '',
): { field: EditorField; path: string }[] {
  return (schema as EditorSchema).flatMap((item) =>
    isSection(item)
      ? fieldsWithPaths(item.schema, item.flatten ? prefix : `${prefix}${item.name}.`)
      : [{ field: item, path: `${prefix}${item.name}` }],
  );
}

/**
 * The schema for `ha-form`: everything while `showAdvanced` is on; without the advanced fields while it is off.
 * Advanced fields stay in their own section, and a section left without fields is left out.
 */
export function visibleSchema(schema: EditorSchema, showAdvanced: boolean): FormSchema {
  return visibleItems(schema, showAdvanced);
}

/**
 * Whether a config value counts as set to something other than the field's default. Numbers are compared as
 * numbers ("1.20" equals 1.2), other values as text ignoring case ("#FFF" equals "#fff").
 */
function differsFromDefault(value: unknown, field: EditorField): boolean {
  if (value === undefined || value === null || value === '') return false;
  if (field.default === undefined) return true;
  if (typeof field.default === 'number') {
    const number = typeof value === 'number' ? value : typeof value === 'string' ? parseNumericState(value) : undefined;
    if (number !== undefined) return number !== field.default;
  }
  return comparable(value) !== comparable(field.default);
}

function comparable(value: unknown): string {
  const text =
    typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
      ? String(value)
      : JSON.stringify(value);
  return text.toLowerCase();
}

/** True when the config sets any advanced field to a value other than its default, so the switch starts on. */
export function hasAdvancedValue(schema: EditorSchema, config: CardConfig): boolean {
  return fieldsWithPaths(schema).some(
    ({ field, path }) => field.advanced === true && differsFromDefault(valueAt(config, path), field),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A copy of the config with `value` at the dotted path (parents created when missing); `undefined` removes it. A
 * parent left empty by a removal is removed as well, unless `original` already had it.
 */
export function withValueAt(
  config: CardConfig,
  path: string,
  value: unknown,
  original?: CardConfig,
  prefix = '',
): CardConfig {
  const [key, ...rest] = path.split('.') as [string, ...string[]];
  const record = config as Record<string, unknown>;
  const { [key]: current, ...others } = record;
  if (rest.length === 0) {
    if (value === undefined) return others;
    // An existing key keeps its position, so a changed value does not reorder the YAML.
    return Object.hasOwn(record, key) ? { ...record, [key]: value } : { ...others, [key]: value };
  }
  const child = withValueAt(isRecord(current) ? current : {}, rest.join('.'), value, original, `${prefix}${key}.`);
  const existed = original !== undefined && valueAt(original, `${prefix}${key}`) !== undefined;
  if (value === undefined && Object.keys(child).length === 0 && !existed) return others;
  return { ...record, [key]: child };
}

/**
 * The config as `ha-form` displays it: every field of the schema that the config leaves unset shows its default.
 * `ha-form` does not draw the `default` of a selector for missing data, so a new card would show blank drop-downs.
 * This is display data only; `withoutShownDefaults` takes the defaults out again before a change is saved. The
 * paths in `emptied` are fields the user just cleared: they stay empty instead of showing their default again.
 * Returns the config itself when there is nothing to add.
 */
export function withShownDefaults(
  schema: EditorSchema | FormSchema,
  config: CardConfig,
  emptied: ReadonlySet<string> = new Set(),
): CardConfig {
  return fieldsWithPaths(schema).reduce(
    (shown, { field, path }) =>
      field.default !== undefined && valueAt(config, path) === undefined && !emptied.has(path)
        ? withValueAt(shown, path, field.default)
        : shown,
    config,
  );
}

/**
 * The paths of the fields the user cleared: set in what `ha-form` displayed (`shown`) and unset in what it reports
 * (`changed`, where a cleared field is missing or `undefined`).
 */
export function clearedPaths(schema: EditorSchema | FormSchema, shown: CardConfig, changed: CardConfig): string[] {
  return fieldsWithPaths(schema)
    .map(({ path }) => path)
    .filter((path) => valueAt(shown, path) !== undefined && valueAt(changed, path) === undefined);
}

/**
 * A copy without the keys whose value is `undefined`, in sections too: `ha-form` reports a cleared field as
 * `{ name: undefined }`, which must not reach the saved config. Returns the value itself when it has none.
 */
export function withoutUndefined<T>(value: T): T {
  if (!isRecord(value)) return value;
  const entries = Object.entries(value).filter(([, item]) => item !== undefined);
  const cleaned = entries.map(([key, item]) => [key, withoutUndefined(item)] as const);
  const changed = cleaned.length !== Object.keys(value).length || cleaned.some(([key, item]) => item !== value[key]);
  return changed ? (Object.fromEntries(cleaned) as T) : value;
}

/**
 * A copy without the text and entity fields (a `text` or `entity` selector) that are empty: `ha-form` reports a cleared
 * text box or entity picker as an empty text, which must not reach the config. Other values are kept as they are.
 */
export function withoutEmptyTexts(schema: EditorSchema | FormSchema, config: CardConfig): CardConfig {
  return fieldsWithPaths(schema).reduce(
    (cleaned, { field, path }) =>
      ('text' in field.selector || 'entity' in field.selector) && valueAt(cleaned, path) === ''
        ? withValueAt(cleaned, path, undefined, config)
        : cleaned,
    config,
  );
}

/** The config as `ha-form` displays it: the values of coded fields are replaced by their form values. */
export function toFormData(schema: EditorSchema | FormSchema, config: CardConfig): CardConfig {
  return fieldsWithPaths(schema).reduce((shown, { field, path }) => {
    const value = valueAt(shown, path);
    const pair = field.coded?.find(([, configValue]) => configValue !== undefined && configValue === value);
    return pair === undefined ? shown : withValueAt(shown, path, pair[0]);
  }, config);
}

/**
 * The inverse of `toFormData` for what `ha-form` reports: a coded form value becomes its config value, and one that
 * stands for "not set" removes the key. Parents that exist in `original` stay, even when they end up empty.
 */
export function fromFormData(
  schema: EditorSchema | FormSchema,
  reported: CardConfig,
  original: CardConfig,
): CardConfig {
  return fieldsWithPaths(schema).reduce((decoded, { field, path }) => {
    const value = valueAt(decoded, path);
    const pair = field.coded?.find(([form]) => form === value);
    return pair === undefined ? decoded : withValueAt(decoded, path, pair[1], original);
  }, reported);
}

/**
 * A copy without the listed top-level groups that are empty objects, unless `original` already had that group as an
 * empty object (so a config written that way survives a save unchanged). In the groups listed in `nested`, an empty
 * object inside the group (`entities.dhw`) is removed in the same way, before the group itself is judged.
 */
export function withoutEmptyGroups(
  config: CardConfig,
  original: CardConfig,
  groups: readonly string[],
  nested: readonly string[] = [],
): CardConfig {
  const isEmpty = (value: unknown): boolean => isRecord(value) && Object.keys(value).length === 0;
  return Object.fromEntries(
    Object.entries(config).flatMap(([key, value]): [string, unknown][] => {
      if (!groups.includes(key) || !isRecord(value)) return [[key, value]];
      const before = original[key];
      const kept = nested.includes(key)
        ? Object.fromEntries(
            Object.entries(value).filter(
              ([name, child]) => !isEmpty(child) || (isRecord(before) && isEmpty(before[name])),
            ),
          )
        : value;
      return Object.keys(kept).length > 0 || isEmpty(before) ? [[key, kept]] : [];
    }),
  );
}

/**
 * The config to save after `ha-form` reports `changed`: a field the current config left unset is dropped again when
 * its value is still the default that `withShownDefaults` displayed, so editing one field never writes the defaults
 * of the others into the card's YAML.
 */
export function withoutShownDefaults(
  schema: EditorSchema | FormSchema,
  current: CardConfig,
  changed: CardConfig,
): CardConfig {
  return fieldsWithPaths(schema).reduce(
    (saved, { field, path }) =>
      field.default !== undefined &&
      valueAt(current, path) === undefined &&
      valueAt(saved, path) !== undefined &&
      !differsFromDefault(valueAt(saved, path), field)
        ? withValueAt(saved, path, undefined, current)
        : saved,
    changed,
  );
}
