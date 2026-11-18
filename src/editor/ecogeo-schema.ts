// The editor's schema (add-card-editor D2): the sections and fields of the card's options, generated from the
// option table (src/config/options.ts) and the variant presets, for the config being edited (the DHW storage's
// default follows the model, and the empty choice of a feature names the variant's preset). Pure; the editor
// element renders it. The colour stop rows (color-rows.ts) sit in the appearance section; the advanced entity pickers
// (one section per role group, built from the role table) are in the `entities` section.
import {
  DEFAULT_VARIANT,
  isNone,
  prefixOf,
  defaultDhw,
  DHW_STORAGES,
  DETAIL_OPTION,
  DHW_OPTION,
  EXCHANGER_FILL_OPTION,
  LAYOUT_OPTION,
  MODEL_OPTION,
  MODELS,
  type DhwStorage,
  type Model,
  SOURCE_OPTION,
  variantOf,
} from '../config/options';
import { resolveEntities } from '../config/resolve';
import { ROLES } from '../config/roles';
import { DEFAULT_STATES } from '../config/states';
import { VARIANTS, variantFeatures, type FeatureKey, type FeatureState } from '../config/variants';
import type { CardConfig } from '../lib/config';
import { valueAt } from '../lib/config';
import type { HassEntityState } from '../lib/hass';
import { EDITOR } from '../strings';
import { colorRowFields, draftOf } from './color-rows';
import { choiceField, entityField } from './fields';
import { roleLabel, roleOwnLabel } from './role-labels';
import type { EditorField, EditorSchema, EditorSection } from './schema';

/** The top-level groups the editor removes when they end up empty. */
export const EMPTY_GROUPS: readonly string[] = ['features', 'entities', 'states'];

/** The groups that hold groups of their own (`entities.<group>`), which are removed when they end up empty. */
export const NESTED_GROUPS: readonly string[] = ['entities'];

/** The name of the virtual fields: editor state or a view of the config that is never a config key of its own. */
export const DEVICE_FIELD = '_device';
export const NOT_PRESENT_FIELD = '_not_present';

/** The form value of a feature that is left to the variant's preset. */
const VARIANT_DEFAULT = 'default';

/** A feature's form values and the config values they stand for. */
const FEATURE_CODES = [
  [VARIANT_DEFAULT, undefined],
  ['true', true],
  ['false', false],
  ['unused', 'unused'],
] as const;

function featureField(key: FeatureKey, preset: FeatureState): EditorField {
  const { on, off, unused, presetOn, presetOff, presetUnused, variantDefault } = EDITOR.featureChoices;
  return {
    name: key,
    default: VARIANT_DEFAULT,
    coded: FEATURE_CODES,
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          {
            value: VARIANT_DEFAULT,
            label: variantDefault(preset === 'unused' ? presetUnused : preset ? presetOn : presetOff),
          },
          { value: 'true', label: on },
          { value: 'false', label: off },
          { value: 'unused', label: unused },
        ],
      },
    },
  };
}

/** The order of the features in the editor and the docs (FEATURE_KEYS has the preset's order). */
const FEATURE_ORDER: readonly FeatureKey[] = ['passive_cooling', 'active_cooling', 'htr', 'backup_heater'];

/** The variant: a select of the allowed variants (form values are text), written back as a number. */
function variantField(): EditorField {
  return {
    name: 'variant',
    default: String(DEFAULT_VARIANT),
    coded: VARIANTS.map((variant) => [String(variant), variant] as const),
    selector: {
      select: {
        mode: 'dropdown',
        options: VARIANTS.map((variant) => ({ value: String(variant), label: EDITOR.choices.variant[variant] })),
      },
    },
  };
}

/**
 * The storages a model allows (the card rejects internal on B, and external and none on C, which always has its
 * tank): its own tank, unused, and on B none.
 */
const allowedDhw = (model: Model): readonly DhwStorage[] =>
  DHW_STORAGES.filter((dhw) => dhw === 'unused' || dhw === defaultDhw(model) || (dhw === 'none' && model === 'B'));

/**
 * The DHW select: the storages the model allows, plus the config's current value when it is a known storage the
 * model does not allow, so it still shows (the card's error is shown above the form).
 */
function dhwField(config: CardConfig, model: Model): EditorField {
  const current = valueAt(config, 'dhw');
  const allowed = allowedDhw(model);
  const shown = DHW_STORAGES.filter((dhw) => allowed.includes(dhw) || dhw === current);
  return choiceField('dhw', { ...DHW_OPTION, choices: shown }, EDITOR.choices.dhw, defaultDhw(model));
}

/**
 * The advanced entity pickers: an `entities` section with one section per role group (in the role table's order of
 * first appearance) and one entity picker per role, filtered to the domains the role accepts. A role set to `none`
 * has no picker, and a group left without one is left out. The form data thereby has the config's own shape,
 * `entities.<group>.<role>`.
 */
function entitiesSection(config: CardConfig): EditorSection {
  const groups = new Map<string, EditorField[]>();
  for (const role of ROLES) {
    if (isNone(valueAt(config, `entities.${role.path}`))) continue;
    const [group = '', name = ''] = role.path.split('.');
    groups.set(group, [
      ...(groups.get(group) ?? []),
      { ...entityField(name, role.accepts, { advanced: true }), label: roleOwnLabel(role.path) },
    ]);
  }
  return {
    type: 'expandable',
    name: 'entities',
    schema: [...groups].map(([group, schema]): EditorSection => ({
      type: 'expandable',
      name: group,
      title: EDITOR.roleGroups[group as keyof typeof EDITOR.roleGroups],
      schema,
    })),
  };
}

/** The "Not present" choice: a multiple select over the roles (a virtual field, folded into `none` values). */
const notPresentField = (): EditorField => ({
  name: NOT_PRESENT_FIELD,
  advanced: true,
  selector: {
    select: {
      multiple: true,
      mode: 'dropdown',
      options: ROLES.map((role) => ({ value: role.path, label: roleLabel(role.path) })),
    },
  },
});

/** The roles whose entity's `options` the state value lists offer: the off value is read from the on/off entity. */
const STATE_ROLES = { off: 'unit.on_off', defrost: 'compressor.mode' } as const;

/** The `options` attribute of the entity bound to the role behind each state list (an enum sensor or select). */
export function stateOptions(
  config: CardConfig,
  states: Readonly<Record<string, HassEntityState | undefined>> | undefined,
): Record<keyof typeof STATE_ROLES, string[]> {
  const resolved = resolveEntities(config, prefixOf(config));
  const options = (key: keyof typeof STATE_ROLES): string[] => {
    const entityId = resolved[STATE_ROLES[key]];
    const list = entityId === undefined ? undefined : states?.[entityId]?.attributes['options'];
    return Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : [];
  };
  return { off: options('off'), defrost: options('defrost') };
}

/** The `states` lists: multiple selects with typed values, offering the bound entity's options and the default. */
function statesSection(options: Record<keyof typeof STATE_ROLES, string[]>): EditorSection {
  const field = (key: keyof typeof STATE_ROLES): EditorField => ({
    name: key,
    advanced: true,
    default: [...DEFAULT_STATES[key]],
    selector: {
      select: {
        multiple: true,
        custom_value: true,
        mode: 'dropdown',
        options: [...new Set([...options[key], ...DEFAULT_STATES[key]])],
      },
    },
  });
  return { type: 'expandable', name: 'states', schema: [field('off'), field('defrost')] };
}

/**
 * The editor schema for a config: Unit, Entities (the device picker and the prefix), Features, Appearance (with the
 * colour stop rows) and the advanced parts (the entity pickers, "Not present", the state value lists). `states` are
 * Home Assistant's states, for the options of the bound enum entities.
 */
export function editorSchema(
  config: CardConfig,
  colorRows: number = draftOf(config).length,
  states?: Readonly<Record<string, HassEntityState | undefined>>,
): EditorSchema {
  const preset = variantFeatures(variantOf(config));
  const model = valueAt(config, 'model') === MODELS[1] ? MODELS[1] : MODELS[0];
  return [
    {
      type: 'expandable',
      name: 'unit',
      flatten: true,
      schema: [
        choiceField('model', MODEL_OPTION, EDITOR.choices.model),
        variantField(),
        choiceField('source', SOURCE_OPTION, EDITOR.choices.source),
        dhwField(config, model),
      ],
    },
    {
      type: 'expandable',
      name: 'entity_prefix',
      flatten: true,
      schema: [
        { name: DEVICE_FIELD, selector: { device: {} } },
        { name: 'prefix', selector: { text: {} } },
      ],
    },
    {
      type: 'expandable',
      name: 'features',
      schema: FEATURE_ORDER.map((key) => featureField(key, preset[key])),
    },
    {
      type: 'expandable',
      name: 'appearance',
      flatten: true,
      schema: [
        choiceField('detail', DETAIL_OPTION, EDITOR.choices.detail),
        choiceField('exchanger_fill', EXCHANGER_FILL_OPTION, EDITOR.choices.exchanger_fill),
        choiceField('layout', LAYOUT_OPTION, EDITOR.choices.layout),
        ...colorRowFields(colorRows),
      ],
    },
    entitiesSection(config),
    notPresentField(),
    statesSection(stateOptions(config, states)),
  ];
}
