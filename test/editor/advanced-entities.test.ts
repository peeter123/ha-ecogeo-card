// The advanced entity pickers (add-card-editor D2, D5, task 2.1): the switch, one picker per role, the minimal writes.
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { ROLES } from '../../src/config/roles';
import { fieldsWithPaths, isSection } from '../../src/editor/schema';
import type { CardConfig } from '../../src/lib/config';
import { EDITOR } from '../../src/strings';
import { cleared, openEditor, StubForm } from './harness';

beforeAll(async () => {
  customElements.define('ha-form', StubForm);
  await import('../../src/editor/ecogeo-card-editor');
});

afterEach(() => {
  document.body.innerHTML = '';
});

const BASE = { type: 'custom:ecogeo-card' };
const WITH_OVERRIDE = { ...BASE, entities: { dhw: { temperature: 'sensor.boiler_top' } } };

describe('advanced switch', () => {
  test('the switch is off for a config without entities, and the pickers are hidden', async () => {
    const { form, toggle } = await openEditor(BASE);
    expect(toggle.data).toEqual({ advanced: false });
    expect(toggle.computeLabel?.({ name: 'advanced' })).toBe(EDITOR.advanced);
    expect(fieldsWithPaths(form.schema).some(({ path }) => path.startsWith('entities.'))).toBe(false);
  });

  test('the switch is on for a config with an entities key, even an empty one, and the pickers show', async () => {
    for (const config of [WITH_OVERRIDE, { ...BASE, entities: {} }]) {
      const { form, toggle } = await openEditor(config);
      expect(toggle.data).toEqual({ advanced: true });
      expect(fieldsWithPaths(form.schema).some(({ path }) => path === 'entities.dhw.temperature')).toBe(true);
    }
  });

  test('turning the switch on shows a picker for every role', async () => {
    const { editor, form, toggle } = await openEditor(BASE);
    toggle.change({ advanced: true });
    await editor.updateComplete;
    const shown = fieldsWithPaths(form.schema).map(({ path }) => path);
    for (const role of ROLES) expect(shown, role.path).toContain(`entities.${role.path}`);
  });

  test('card-editor "Switch not written": turning the switch on and off fires no change and leaves the config alone', async () => {
    const { editor, form, toggle, saved } = await openEditor(WITH_OVERRIDE);
    toggle.change({ advanced: false });
    await editor.updateComplete;
    toggle.change({ advanced: true });
    await editor.updateComplete;
    expect(saved).toEqual([]);
    // The next real change carries no switch key either.
    form.change({ ...form.data, source: 'air' });
    expect(saved).toStrictEqual([{ ...WITH_OVERRIDE, source: 'air' }]);
    expect(JSON.stringify(saved)).not.toContain('advanced');
  });

  test('turning the switch off hides the pickers but keeps the overrides', async () => {
    const { editor, form, toggle, saved } = await openEditor(WITH_OVERRIDE);
    toggle.change({ advanced: false });
    await editor.updateComplete;
    expect(toggle.data).toEqual({ advanced: false });
    expect(fieldsWithPaths(form.schema).some(({ path }) => path.startsWith('entities.'))).toBe(false);
    form.change({ ...form.data, source: 'air' });
    expect(saved).toStrictEqual([{ ...WITH_OVERRIDE, source: 'air' }]);
    // Home Assistant handing the saved config back does not turn the switch on again.
    editor.setConfig(saved[0] ?? {});
    await editor.updateComplete;
    expect(toggle.data).toEqual({ advanced: false });
  });

  test('entities arriving from outside (the code editor) turn the switch on', async () => {
    const { editor, toggle } = await openEditor(BASE);
    editor.setConfig(WITH_OVERRIDE);
    await editor.updateComplete;
    expect(toggle.data).toEqual({ advanced: true });
  });
});

describe('entity pickers', () => {
  test('every role in the role table has a picker filtered to the domains it accepts, and a label', async () => {
    const { editor, form, toggle } = await openEditor(BASE);
    toggle.change({ advanced: true });
    await editor.updateComplete;
    const fields = new Map(fieldsWithPaths(form.schema).map(({ field, path }) => [path, field]));
    for (const role of ROLES) {
      const field = fields.get(`entities.${role.path}`);
      expect(field?.selector, role.path).toEqual({ entity: { filter: { domain: role.accepts } } });
      const leaf = role.path.split('.')[1] ?? '';
      expect(EDITOR.roles, role.path).toHaveProperty(leaf);
      expect(form.computeLabel?.({ name: leaf }), role.path).toBe(EDITOR.roles[leaf as keyof typeof EDITOR.roles]);
    }
  });

  test('the pickers are in one section per role group, in the role table order, inside an entities section', async () => {
    const { form, toggle, editor } = await openEditor(BASE);
    toggle.change({ advanced: true });
    await editor.updateComplete;
    const section = form.schema.find((item) => item.name === 'entities');
    if (!section || !isSection(section)) throw new Error('no entities section');
    const groups = [...new Set(ROLES.map((role) => role.path.split('.')[0] ?? ''))];
    expect(section.schema.map((item) => item.name)).toEqual(groups);
    for (const group of section.schema) {
      expect(isSection(group) ? group.title : undefined, group.name).toBe(
        EDITOR.roleGroups[group.name as keyof typeof EDITOR.roleGroups],
      );
    }
    expect(form.computeLabel?.({ type: 'expandable', name: 'entities', schema: [] })).toBe(EDITOR.sections.entities);
  });

  test('card-editor "Override a role": picking sensor.boiler_top for the DHW temperature adds only that', async () => {
    const config = { type: 'custom:ecogeo-card', source: 'air', grid_options: { columns: 12 } };
    const { editor, form, toggle, saved } = await openEditor(config);
    toggle.change({ advanced: true });
    await editor.updateComplete;
    form.change({ ...form.data, entities: { dhw: { temperature: 'sensor.boiler_top' } } });
    expect(saved).toStrictEqual([{ ...config, entities: { dhw: { temperature: 'sensor.boiler_top' } } }]);
  });

  test('a second role in the same group and a role in another group are added next to the first', async () => {
    const { form, saved } = await openEditor(WITH_OVERRIDE);
    form.change({
      ...form.data,
      entities: { dhw: { temperature: 'sensor.boiler_top', setpoint: 'number.boiler_target' } },
    });
    form.change({ ...form.data, entities: { dhw: { temperature: 'sensor.boiler_top' }, unit: { cop: 'sensor.cop' } } });
    expect(saved).toStrictEqual([
      { ...BASE, entities: { dhw: { temperature: 'sensor.boiler_top', setpoint: 'number.boiler_target' } } },
      { ...BASE, entities: { dhw: { temperature: 'sensor.boiler_top' }, unit: { cop: 'sensor.cop' } } },
    ]);
  });

  test('clearing the only picker of a group removes the key and prunes the empty group and entities', async () => {
    const { form, saved } = await openEditor({ ...WITH_OVERRIDE, source: 'air' });
    form.change(cleared(form.data, 'entities.dhw.temperature'));
    expect(saved).toStrictEqual([{ ...BASE, source: 'air' }]);
    expect(saved[0]).not.toHaveProperty('entities');
  });

  test('an entity picker cleared as an empty text removes the key and prunes the group', async () => {
    const { form, saved } = await openEditor({ ...WITH_OVERRIDE, source: 'air' });
    form.change({ ...form.data, entities: { dhw: { temperature: '' } } });
    expect(saved).toStrictEqual([{ ...BASE, source: 'air' }]);
  });

  test('clearing a picker keeps the other pickers of its group, and the other groups', async () => {
    const config = {
      ...BASE,
      entities: { dhw: { temperature: 'sensor.boiler_top', setpoint: 'number.target' }, unit: { cop: 'sensor.cop' } },
    };
    const { editor, form, saved } = await openEditor(config);
    form.change(cleared(form.data, 'entities.dhw.setpoint'));
    await editor.updateComplete;
    expect(saved).toStrictEqual([
      { ...BASE, entities: { dhw: { temperature: 'sensor.boiler_top' }, unit: { cop: 'sensor.cop' } } },
    ]);
    form.change(cleared(form.data, 'entities.dhw.temperature'));
    // Only the group that emptied is pruned.
    expect(saved.at(-1)).toStrictEqual({ ...BASE, entities: { unit: { cop: 'sensor.cop' } } });
  });
});

describe('round trip with overrides', () => {
  async function roundTrip(config: CardConfig): Promise<CardConfig[]> {
    const { form, saved } = await openEditor(config);
    form.change(structuredClone(form.data));
    return saved;
  }

  test('card-editor "Round trip": configs with overrides are saved unchanged', async () => {
    const configs: CardConfig[] = [
      WITH_OVERRIDE,
      {
        ...BASE,
        prefix: 'demo_ecogeo',
        entities: { production: { pump: 'sensor.pump' }, unit: { alarm: 'binary_sensor.alarm' } },
      },
      { ...BASE, entities: { dhw: {} } },
      { ...BASE, entities: {} },
      { ...BASE, entities: { dhw: { temperature: 'sensor.boiler_top' } }, grid_options: { columns: 6 } },
    ];
    for (const config of configs) expect(await roundTrip(config), JSON.stringify(config)).toStrictEqual([config]);
  });

  test('the key order of a config with overrides is kept', async () => {
    const config = {
      entities: { dhw: { setpoint: 'number.t', temperature: 'sensor.x' } },
      type: 'custom:ecogeo-card',
      prefix: 'p',
    };
    const [saved] = await roundTrip(config);
    expect(JSON.stringify(saved)).toBe(JSON.stringify(config));
  });
});

describe('roles not present (none)', () => {
  const WITH_NONE = {
    ...BASE,
    prefix: 'p',
    entities: { unit: { cop: 'none' }, dhw: { temperature: 'sensor.boiler_top' } },
  };

  test('a none value is passed to the picker and written back unchanged by another edit', async () => {
    const { form, saved } = await openEditor(WITH_NONE);
    expect(form.data['entities']).toStrictEqual(WITH_NONE.entities);
    form.change({ ...form.data, source: 'air' });
    expect(saved).toStrictEqual([{ ...WITH_NONE, source: 'air' }]);
  });

  test('a none role has no picker; it is changed through the Not present choice', async () => {
    const { form, saved } = await openEditor(WITH_NONE);
    expect(fieldsWithPaths(form.schema).some(({ path }) => path === 'entities.unit.cop')).toBe(false);
    form.change({ ...form.data, _not_present: [] });
    expect(saved).toStrictEqual([{ ...WITH_NONE, entities: { dhw: { temperature: 'sensor.boiler_top' } } }]);
  });
});
