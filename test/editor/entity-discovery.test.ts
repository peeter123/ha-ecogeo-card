// The editor part of add-entity-discovery (task group 5): the device picker and "Suggest entities", the report, the
// "Not present" choice, the state value lists and the binding check. Opened with the stand-in ha-form and the
// emulator's two mock sources (firmware and foreign naming) as `hass`.
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import {
  FIRMWARE_DEVICE_ID,
  FOREIGN_BINDING,
  FOREIGN_DEVICE_ID,
  FOREIGN_MODE_OPTIONS,
  FOREIGN_NONE,
} from '../../dev/foreign';
import { ROLES } from '../../src/config/roles';
import { fieldsWithPaths } from '../../src/editor/schema';
import type { CardConfig } from '../../src/lib/config';
import type { HassEntityState, HassLike } from '../../src/lib/hass';
import { roleLabel } from '../../src/editor/role-labels';
import { EDITOR } from '../../src/strings';
import { firmwareHass, foreignHass } from './hass-fixtures';
import { cleared, openEditor, StubForm } from './harness';

beforeAll(async () => {
  customElements.define('ha-form', StubForm);
  await import('../../src/editor/ecogeo-card-editor');
});

afterEach(() => {
  document.body.innerHTML = '';
});

const BASE = { type: 'custom:ecogeo-card' };

async function open(config: CardConfig, hass: HassLike) {
  const opened = await openEditor(config);
  opened.editor.hass = hass;
  await opened.editor.updateComplete;
  const button = (): HTMLButtonElement => {
    const found = opened.editor.shadowRoot?.querySelector<HTMLButtonElement>('button.suggest');
    if (!found) throw new Error('no suggest button');
    return found;
  };
  const text = (selector: string): string[] =>
    [...(opened.editor.shadowRoot?.querySelectorAll(`${selector} li`) ?? [])].map((li) => li.textContent.trim());
  return { ...opened, button, text };
}

const pathsOf = (form: StubForm): string[] => fieldsWithPaths(form.schema).map(({ path }) => path);

describe('device picker and suggestions', () => {
  test('the Entities section has a device picker with the device selector, before the prefix', async () => {
    const { form } = await open(BASE, foreignHass());
    const paths = pathsOf(form);
    expect(paths.indexOf('_device')).toBeGreaterThan(-1);
    expect(paths.indexOf('_device')).toBeLessThan(paths.indexOf('prefix'));
    const item = fieldsWithPaths(form.schema).find(({ path }) => path === '_device');
    expect(item?.field.selector).toEqual({ device: {} });
    expect(form.computeLabel?.({ name: '_device' })).toBe(EDITOR.fields._device);
  });

  test('the button is disabled without a picked device and enabled with one', async () => {
    const { editor, form, button } = await open(BASE, foreignHass());
    expect(button().textContent.trim()).toBe(EDITOR.suggest.button);
    expect(button().disabled).toBe(true);
    form.change({ ...form.data, _device: FOREIGN_DEVICE_ID });
    await editor.updateComplete;
    expect(button().disabled).toBe(false);
    form.change({ ...form.data, _device: undefined });
    await editor.updateComplete;
    expect(button().disabled).toBe(true);
  });

  test('card-editor "Device not written": picking a device leaves the config unchanged', async () => {
    const config = { ...BASE, source: 'air' };
    const { editor, form, toggle, saved } = await open(config, foreignHass());
    form.change({ ...form.data, _device: FOREIGN_DEVICE_ID });
    await editor.updateComplete;
    expect(saved).toEqual([]);
    expect(form.data['_device']).toBe(FOREIGN_DEVICE_ID);
    expect(toggle.data).toEqual({ advanced: false });
    // The next real edit carries no device.
    form.change({ ...form.data, source: 'ground' });
    expect(saved).toStrictEqual([{ ...BASE, source: 'ground' }]);
    expect(JSON.stringify(saved)).not.toContain('_device');
  });

  test('card-editor "Empty roles filled": a renamed firmware device fills every role under entities', async () => {
    const hass = firmwareHass('hp_basement');
    const { editor, form, toggle, button, saved } = await open(BASE, hass);
    form.change({ ...form.data, _device: FIRMWARE_DEVICE_ID });
    await editor.updateComplete;
    button().click();
    await editor.updateComplete;
    expect(saved).toHaveLength(1);
    const entities = saved[0]?.['entities'] as Record<string, Record<string, string>>;
    expect(Object.values(entities).flatMap((group) => Object.keys(group))).toHaveLength(ROLES.length);
    expect(entities['production']?.['outlet_temperature']).toBe('sensor.hp_basement_production_out');
    expect(saved[0]).not.toHaveProperty('_device');
    expect(toggle.data).toEqual({ advanced: true });
    expect(editor.shadowRoot?.querySelector('ha-form.switch')).not.toBeNull();
  });

  test('card-editor "Report": the filled count and the empty roles are shown until the next edit', async () => {
    const { editor, form, button, text, saved } = await open(BASE, foreignHass());
    form.change({ ...form.data, _device: FOREIGN_DEVICE_ID });
    await editor.updateComplete;
    button().click();
    await editor.updateComplete;
    expect(text('.report')).toEqual([
      EDITOR.suggest.filled(Object.keys(FOREIGN_BINDING).length),
      EDITOR.suggest.empty(
        ROLES.map((role) => role.path)
          .filter((path) => (FOREIGN_NONE as readonly string[]).includes(path))
          .map(roleName),
      ),
    ]);
    expect(saved).toHaveLength(1);
    form.change({ ...form.data, source: 'air' });
    await editor.updateComplete;
    expect(text('.report')).toEqual([]);
  });

  test('card-editor "Own choice kept": a role bound to a known entity is not changed', async () => {
    const config = { ...BASE, entities: { dhw: { temperature: 'sensor.wp_diag_1' } } };
    const { editor, form, button, saved } = await open(config, foreignHass());
    form.change({ ...form.data, _device: FOREIGN_DEVICE_ID });
    await editor.updateComplete;
    button().click();
    const entities = saved[0]?.['entities'] as Record<string, Record<string, string>>;
    expect(entities['dhw']?.['temperature']).toBe('sensor.wp_diag_1');
  });

  test('a suggestion that fills nothing writes no config but shows the report', async () => {
    const hass = firmwareHass('hp_basement');
    const config = { ...BASE, prefix: 'hp_basement' };
    const { editor, form, button, text, saved } = await open(config, hass);
    form.change({ ...form.data, _device: FIRMWARE_DEVICE_ID });
    await editor.updateComplete;
    button().click();
    await editor.updateComplete;
    expect(saved).toEqual([]);
    expect(text('.report')[0]).toBe(EDITOR.suggest.filled(0));
  });

  test('the advanced switch opens on for a config with states, or entities, and not otherwise', async () => {
    expect((await open({ ...BASE, states: { off: ['Uit'] } }, foreignHass())).toggle.data).toEqual({ advanced: true });
    expect((await open({ ...BASE, entities: { unit: { cop: 'none' } } }, foreignHass())).toggle.data).toEqual({
      advanced: true,
    });
    expect((await open(BASE, foreignHass())).toggle.data).toEqual({ advanced: false });
  });
});

/** The role's name as the editor words it. */
function roleName(path: string): string {
  return roleLabel(path);
}

describe('round trip with states and none', () => {
  test('card-editor "Round trip": configs with states and none roles are saved unchanged', async () => {
    const configs: CardConfig[] = [
      { ...BASE, states: { off: ['Uit'], defrost: ['Ontdooien', '4'] } },
      { ...BASE, states: { defrost: ['Ontdooien'] } },
      { ...BASE, states: { off: ['OFF'] } },
      { ...BASE, prefix: 'p', entities: { source: { fan_speed: 'none' }, unit: { cop: 'none' } } },
      {
        ...BASE,
        entities: { unit: { on_off: 'switch.pump_onoff', cop: 'none' }, heating: { setpoint: 'none' } },
        states: { defrost: ['Ontdooien'] },
        grid_options: { columns: 6 },
      },
    ];
    for (const config of configs) {
      const { form, saved } = await open(config, foreignHass());
      form.change(structuredClone(form.data));
      expect(saved, JSON.stringify(config)).toStrictEqual([config]);
    }
  });
});

describe('Not present', () => {
  const WITH_PREFIX = { ...BASE, prefix: 'p' };

  test('the choice is a multiple select over the role labels, behind the advanced switch', async () => {
    const { editor, form, toggle } = await open(WITH_PREFIX, foreignHass());
    expect(pathsOf(form)).not.toContain('_not_present');
    toggle.change({ advanced: true });
    await editor.updateComplete;
    const item = fieldsWithPaths(form.schema).find(({ path }) => path === '_not_present');
    const select = item?.field.selector['select'] as { multiple: boolean; options: { value: string; label: string }[] };
    expect(select.multiple).toBe(true);
    expect(select.options.map((option) => option.value)).toEqual(ROLES.map((role) => role.path));
    expect(select.options.find((option) => option.value === 'source.fan_speed')?.label).toBe(
      roleName('source.fan_speed'),
    );
    expect(form.computeLabel?.({ name: '_not_present' })).toBe(EDITOR.fields._not_present);
  });

  test('card-editor "Mark the fan speed": adding it writes none and removes its picker; removing it deletes the key', async () => {
    const { editor, form, toggle, saved } = await open(WITH_PREFIX, foreignHass());
    toggle.change({ advanced: true });
    await editor.updateComplete;
    expect(pathsOf(form)).toContain('entities.source.fan_speed');
    form.change({ ...form.data, _not_present: ['source.fan_speed'] });
    await editor.updateComplete;
    expect(saved).toStrictEqual([{ ...WITH_PREFIX, entities: { source: { fan_speed: 'none' } } }]);
    expect(pathsOf(form)).not.toContain('entities.source.fan_speed');
    expect(form.data['_not_present']).toEqual(['source.fan_speed']);
    form.change({ ...form.data, _not_present: [] });
    await editor.updateComplete;
    expect(saved.at(-1)).toStrictEqual(WITH_PREFIX);
    expect(saved.at(-1)).not.toHaveProperty('entities');
    expect(pathsOf(form)).toContain('entities.source.fan_speed');
  });

  test('a Not present value reported as undefined is the empty set', async () => {
    const config = { ...BASE, entities: { unit: { cop: 'none' }, dhw: { temperature: 'sensor.t' } } };
    const { form, saved } = await open(config, foreignHass());
    form.change({ ...form.data, _not_present: undefined });
    expect(saved.at(-1)).toStrictEqual({ ...BASE, entities: { dhw: { temperature: 'sensor.t' } } });
  });

  test('picking another device clears the report', async () => {
    const { editor, form, button, text } = await open(BASE, foreignHass());
    form.change({ ...form.data, _device: FOREIGN_DEVICE_ID });
    await editor.updateComplete;
    button().click();
    await editor.updateComplete;
    expect(text('.report').length).toBeGreaterThan(0);
    form.change({ ...form.data, _device: 'other' });
    await editor.updateComplete;
    expect(text('.report')).toEqual([]);
  });

  test('marking a bound role replaces its entity; another role of the group is kept on removal', async () => {
    const config = { ...BASE, entities: { unit: { cop: 'sensor.cop', alarm: 'binary_sensor.alarm' } } };
    const { form, saved } = await open(config, foreignHass());
    form.change({ ...form.data, _not_present: ['unit.cop'] });
    expect(saved.at(-1)).toStrictEqual({ ...BASE, entities: { unit: { cop: 'none', alarm: 'binary_sensor.alarm' } } });
  });

  test('a none role shows no picker and a group with only none roles is left out', async () => {
    const all = ROLES.filter((role) => role.path.startsWith('cooling.')).map((role) => role.path);
    const config = { ...BASE, entities: { cooling: { capacity: 'none' } } };
    const { form } = await open(config, foreignHass());
    expect(all).toEqual(['cooling.capacity']);
    expect(pathsOf(form).some((path) => path.startsWith('entities.cooling'))).toBe(false);
    expect(form.data['_not_present']).toEqual(['cooling.capacity']);
  });
});

describe('state value choices', () => {
  const FOREIGN_CONFIG = { ...BASE, entities: { compressor: { mode: 'sensor.wp_6' } } };

  const defrostOptions = (form: StubForm): unknown => {
    const item = fieldsWithPaths(form.schema).find(({ path }) => path === 'states.defrost');
    return item?.field.selector['select'];
  };

  test('card-editor "Enum options offered": the defrost list offers the options of the bound mode entity', async () => {
    const hass = foreignHass();
    const modeId = Object.keys(hass.states).find((id) => hass.states[id]?.attributes['options'] !== undefined);
    expect(modeId).toBeDefined();
    const config = { ...BASE, entities: { compressor: { mode: modeId } } };
    const { editor, form, toggle } = await open(config, hass);
    toggle.change({ advanced: true });
    await editor.updateComplete;
    const select = defrostOptions(form) as { multiple: boolean; custom_value: boolean; options: string[] };
    expect(select.multiple).toBe(true);
    expect(select.custom_value).toBe(true);
    expect(select.options).toEqual(expect.arrayContaining([...FOREIGN_MODE_OPTIONS]));
    expect(select.options).toContain('Defrost');
  });

  test('without an enum entity the lists offer the default; options appear when hass arrives', async () => {
    const { editor, form } = await open(FOREIGN_CONFIG, { states: {} });
    expect((defrostOptions(form) as { options: string[] }).options).toEqual(['Defrost']);
    const hass = foreignHass();
    const modeId = Object.keys(hass.states).find((id) => hass.states[id]?.attributes['options'] !== undefined) ?? '';
    editor.setConfig({ ...BASE, entities: { compressor: { mode: modeId } } });
    editor.hass = hass;
    await editor.updateComplete;
    expect((defrostOptions(form) as { options: string[] }).options).toContain('Ontdooien');
  });

  test('card-editor "Default not written": setting the off list to OFF leaves no states key', async () => {
    const { form, saved } = await open(BASE, foreignHass());
    form.change({ ...form.data, states: { off: ['OFF'], defrost: ['Defrost'] } });
    expect(saved).toStrictEqual([BASE]);
    expect(saved[0]).not.toHaveProperty('states');
  });

  test('a changed list is written alone; an empty list removes the key', async () => {
    const { form, saved } = await open(BASE, foreignHass());
    form.change({ ...form.data, states: { off: ['OFF'], defrost: ['Ontdooien'] } });
    expect(saved.at(-1)).toStrictEqual({ ...BASE, states: { defrost: ['Ontdooien'] } });
    form.change({ ...form.data, states: { off: ['OFF'], defrost: [] } });
    expect(saved.at(-1)).toStrictEqual(BASE);
  });

  test('a list set to the default replaces a set one: the key is removed', async () => {
    const config = { ...BASE, states: { off: ['Uit'], defrost: ['Ontdooien'] } };
    const { form, saved } = await open(config, foreignHass());
    form.change({ ...form.data, states: { off: ['OFF'], defrost: ['Ontdooien'] } });
    expect(saved.at(-1)).toStrictEqual({ ...BASE, states: { defrost: ['Ontdooien'] } });
  });

  test('removing the last value of a list keeps it blank and writes nothing until a value is added', async () => {
    const config = { ...BASE, states: { off: ['Uit'] } };
    const { editor, form, saved } = await open(config, foreignHass());
    form.change({ ...form.data, states: { off: [], defrost: ['Defrost'] } });
    await editor.updateComplete;
    expect(saved.at(-1)).toStrictEqual(BASE);
    expect((form.data['states'] as Record<string, unknown>)['off']).toBeUndefined();
    form.change({ ...form.data, states: { off: ['Uit'], defrost: ['Defrost'] } });
    expect(saved.at(-1)).toStrictEqual(config);
  });

  test('clearing a states field never leaves undefined behind', async () => {
    const config = { ...BASE, states: { off: ['Uit'] } };
    const { form, saved } = await open(config, foreignHass());
    form.change(cleared(form.data, 'states.off'));
    expect(JSON.stringify(saved.at(-1))).not.toContain('null');
    expect(saved.at(-1)).not.toHaveProperty('states.off');
  });
});

describe('binding check', () => {
  const warnings = (editor: HTMLElement): string[] =>
    [...(editor.shadowRoot?.querySelectorAll('.warnings li') ?? [])].map((li) => li.textContent.trim());

  test('card-editor "Unknown entity": a role bound to an unknown entity gets a warning naming both', async () => {
    const config = { ...BASE, entities: { brine: { inlet_temperature: 'sensor.old_name' } } };
    const { editor, saved } = await open(config, foreignHass());
    expect(warnings(editor)).toEqual([EDITOR.suggest.unknown(roleName('brine.inlet_temperature'), 'sensor.old_name')]);
    expect(warnings(editor)[0]).toContain('does not exist');
    expect(saved).toEqual([]);
  });

  test('a prefix default that does not exist is a warning too, and a none role is not checked', async () => {
    const config = { ...BASE, prefix: 'nothing_here', entities: { unit: { cop: 'none' } } };
    const { editor } = await open(config, foreignHass());
    const found = warnings(editor);
    expect(found).toHaveLength(ROLES.length - 1);
    expect(found).toContain(EDITOR.suggest.unknown(roleName('production.pump'), 'sensor.nothing_here_production_pump'));
    expect(found.join('\n')).not.toContain('nothing_here_cop');
  });

  test('card-editor "Wrong unit": an entity whose unit does not fit the role gets a warning, with no change', async () => {
    const hass = foreignHass();
    const percent: HassEntityState = {
      entity_id: 'sensor.pct',
      state: '40',
      attributes: { unit_of_measurement: '%' },
    };
    const config = { ...BASE, entities: { production: { outlet_temperature: 'sensor.pct' } } };
    const { editor, saved } = await open(config, { ...hass, states: { ...hass.states, 'sensor.pct': percent } });
    expect(warnings(editor)).toEqual([EDITOR.suggest.unit(roleName('production.outlet_temperature'), 'sensor.pct')]);
    expect(warnings(editor)[0]).toContain('unit');
    expect(saved).toEqual([]);
  });

  test('a fitting binding gives no warning: the foreign configuration, on/off entities, kPa and Hz included', async () => {
    const hass = foreignHass();
    const entities: Record<string, Record<string, string>> = {};
    for (const [path, id] of Object.entries(FOREIGN_BINDING)) {
      const [group = '', name = ''] = path.split('.');
      (entities[group] ??= {})[name] = id;
    }
    const { editor } = await open({ ...BASE, entities }, hass);
    expect(warnings(editor)).toEqual([]);
    // A text role on a switch, and a number role (the pump) on a switch, fit as well.
    const onOff = { ...hass.states, 'switch.x': { entity_id: 'switch.x', state: 'on', attributes: {} } };
    const second = await open(
      { ...BASE, entities: { unit: { on_off: 'switch.x' }, brine: { pump: 'switch.x' } } },
      { ...hass, states: onOff },
    );
    expect(warnings(second.editor)).toEqual([]);
  });

  test('no warnings without hass', async () => {
    const { editor } = await openEditor({ ...BASE, prefix: 'p' });
    expect(warnings(editor)).toEqual([]);
  });
});
