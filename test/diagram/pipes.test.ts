import { describe, expect, test } from 'vitest';
import { circuitsFor } from '../../src/calc/circuits';
import type { Mode } from '../../src/calc/mode';
import { animationReadings, readRoles, type AnimationReadings } from '../../src/calc/readings';
import type { DhwStorage, Source } from '../../src/config/options';
import { ROLE_BY_PATH, ROLE_PATHS, type RolePath } from '../../src/config/roles';
import { mergeFeatures, type FeatureKey, type FeatureState } from '../../src/config/variants';
import { DEFAULT_STOPS, MUTED_COLOR, temperatureColor } from '../../src/diagram/colors';
import { drawnComponents, drawnSegments, arrangementFor } from '../../src/diagram/geometry';
import {
  FLOW_SECONDS_MAX,
  FLOW_SECONDS_MIN,
  HTR_FLOW_SECONDS,
  TAP_WATER_SEGMENT_IDS,
  coilColor,
  flowDuration,
  pipeState,
  roleFor,
  shownState,
  tankColor,
  type PipeState,
  type PipeView,
} from '../../src/diagram/pipes';
import { cabinetStyles } from '../../src/diagram/cabinet';
import { readings } from '../helpers';

// the scenarios draw detail full
const full = arrangementFor('full', 'full');
const COMPONENTS = full.components;
const SEGMENTS = full.segments;

interface Options {
  mode: Mode;
  features?: Partial<Record<FeatureKey, FeatureState>>;
  dhw?: DhwStorage;
  source?: Source;
}

/** The pipe states of every drawn segment for a mode and readings. */
function scenario(
  options: Options,
  values: Partial<Record<RolePath, number | string | boolean>> = {},
  base?: AnimationReadings,
) {
  const features = mergeFeatures(4, options.features ?? {});
  const dhw = options.dhw ?? 'external';
  const model = dhw === 'internal' ? 'C' : 'B';
  const context = { model, dhw, source: options.source ?? 'air', features, detail: 'full' } as const;
  const rd = base ?? readings(values);
  const view: PipeView = {
    mode: options.mode,
    circuits: circuitsFor(options.mode, features, dhw, rd, true, true),
    readings: rd,
    stops: DEFAULT_STOPS,
  };
  const drawn = drawnSegments(context);
  const states = new Map<string, PipeState>(
    drawn.map((entry) => [entry.part.id, pipeState(entry.part, entry.state, view)]),
  );
  const get = (id: string): PipeState => {
    const state = states.get(id);
    if (state === undefined) throw new Error(`segment ${id} is not drawn`);
    return state;
  };
  return { view, context, states, get };
}

const color = (temperature: number): string => temperatureColor(temperature, DEFAULT_STOPS);

// the heating snapshot of the live unit (sample.ts), the readings the pipe colours are checked against
const HEATING = {
  'production.outlet_temperature': 25.2,
  'production.return_temperature': 22,
  'production.pump': 99.9,
  'brine.outlet_temperature': -2.8,
  'brine.inlet_temperature': 0.5,
  'brine.pump': 100,
  'compressor.percentage': 38.9,
  'compressor.speed': 2803,
  'compressor.discharge_temperature': 52.5,
  'compressor.suction_temperature': 1,
  'refrigerant.condensation_temperature': 27,
  'refrigerant.evaporation_temperature': -5.3,
  'source.air_unit_outlet_temperature': 0.5,
  'dhw.temperature': 52.1,
  'heating.capacity': 4712,
} as const;

/** The same readings with the HTR state on (item 9): HTR recovery in heating and active cooling. */
const HTR_ON = { ...HEATING, 'htr.active': true };

describe('segment colours by probe (temperature-coloring spec)', () => {
  test('heating: the supply to connection 1 has the outlet colour, the return from connection 2 the return colour', () => {
    const { get } = scenario({ mode: 'heating' }, HEATING);
    expect(get('p1_up').color).toBe(color(25.2));
    expect(get('prod_44_26').color).toBe(color(25.2));
    expect(get('p2_in').color).toBe(color(22));
    expect(get('trunk').color).toBe(color(22));
  });

  test('the brine segments take the brine probes: outlet to connection 3, inlet from connection 4', () => {
    const { get } = scenario({ mode: 'heating' }, HEATING);
    expect(get('ln3').color).toBe(color(-2.8));
    expect(get('ln4_a').color).toBe(color(0.5));
    expect(get('src_out').color).toBe(color(-2.8));
    expect(get('src_in').color).toBe(color(0.5));
  });

  test('cold brine is closer to blue than to light blue', () => {
    expect(color(-2.8)).toBe('color-mix(in srgb, #5fa8e0 36%, #1e5aa8)');
  });

  test('refrigerant: discharge, condensation, evaporation and suction points of the cycle', () => {
    const { get } = scenario({ mode: 'heating' }, HEATING);
    expect(get('ref_discharge').color).toBe(color(52.5));
    expect(get('ref_9_14').color).toBe(color(52.5));
    expect(get('ref_14_8').color).toBe(color(52.5));
    expect(get('ref_8_13').color).toBe(color(27));
    expect(get('ref_12_7').color).toBe(color(-5.3));
    expect(get('ref_7_14').color).toBe(color(1));
    expect(get('ref_suction').color).toBe(color(1));
  });

  test('a discharge above the scale takes the 70 degree end colour', () => {
    const { get } = scenario({ mode: 'heating' }, { ...HEATING, 'compressor.discharge_temperature': 95 });
    expect(get('ref_discharge').color).toBe('#d7263d');
  });

  test('custom stops colour the segments', () => {
    const stops = [
      { temperature: 0, color: 'navy' },
      { temperature: 100, color: 'red' },
    ];
    const s = scenario({ mode: 'heating' }, HEATING);
    const segment = SEGMENTS.find((item) => item.id === 'p1_up');
    if (segment === undefined) throw new Error('no p1_up');
    expect(pipeState(segment, 'normal', { ...s.view, stops }).color).toBe(temperatureColor(25.2, stops));
  });

  test('the HTR water segments take the DHW temperature', () => {
    const { get } = scenario({ mode: 'active_cooling' }, { ...HTR_ON, 'dhw.temperature': 48 });
    for (const id of ['htr_in', 'htr_pump', 'htr_to_9', 'htr_riser']) expect(get(id).color, id).toBe(color(48));
  });
});

describe('muted segments', () => {
  test('the DHW loop is muted and still while heating', () => {
    const { get } = scenario({ mode: 'heating' }, HEATING);
    for (const id of [
      'dhw_sup_a',
      'dhw_sup_b',
      'dhw_sup_c',
      'dhw_ret_a',
      'dhw_ret_b',
      'dhw_ret_c',
      'dhw_ext_in',
      'dhw_ext_coil',
      'dhw_ext_out',
    ]) {
      expect(get(id), id).toMatchObject({ color: MUTED_COLOR, muted: true, animated: false });
    }
  });

  test('the refrigerant segments are muted and still in defrost', () => {
    const { get, states } = scenario({ mode: 'defrost' }, HEATING);
    for (const id of ['ref_discharge', 'ref_8_13', 'ref_12_7', 'ref_suction']) {
      expect(get(id), id).toMatchObject({ color: MUTED_COLOR, muted: true, animated: false });
    }
    // the brine and production circuits stay coloured
    expect(states.get('ln3')?.muted).toBe(false);
  });

  test('every circuit is muted and still in standby and off', () => {
    for (const mode of ['standby', 'off'] as const) {
      const { states } = scenario({ mode }, HEATING);
      for (const [id, state] of states) {
        if (TAP_WATER_SEGMENT_IDS.includes(id)) continue;
        expect(state, `${mode} ${id}`).toMatchObject({ muted: true, animated: false });
      }
    }
  });

  test('a part with the feature unused is muted and still, in a mode that would use it', () => {
    const { get } = scenario({ mode: 'active_cooling', features: { htr: 'unused' } }, HEATING);
    expect(get('htr_riser')).toMatchObject({ muted: true, animated: false });
    // the discharge line through exchanger 9 is a pipe through the part: coloured
    expect(get('ref_discharge').muted).toBe(false);
  });

  test('exchanger 10 and valves 27/28 with passive cooling unused are muted in heating', () => {
    const { get } = scenario({ mode: 'heating', features: { passive_cooling: 'unused' } }, HEATING);
    expect(get('prod_10_in')).toMatchObject({ muted: true, animated: false });
    expect(get('br_10_in')).toMatchObject({ muted: true, animated: false });
    expect(shownState({ feature: 'passive_cooling' }, 'muted', 'heating')).toBe('muted');
  });

  test('defrost uses exchanger 10, valves 27/28 and their pipes even when unused, symbols too', () => {
    const { get, context } = scenario({ mode: 'defrost', features: { passive_cooling: 'unused' } }, HEATING);
    for (const id of ['prod_10_in', 'prod_10_out', 'br_10_in', 'br_10_28']) {
      expect(get(id), id).toMatchObject({ muted: false, animated: true });
    }
    expect(shownState({ feature: 'passive_cooling' }, 'muted', 'defrost')).toBe('normal');
    const states = drawnComponents(context).filter((entry) => [10, 27, 28].includes(entry.part.item));
    expect(states.map((entry) => entry.state)).toEqual(['muted', 'muted', 'muted']);
    expect(states.map((entry) => shownState(entry.part, entry.state, 'defrost'))).toEqual([
      'normal',
      'normal',
      'normal',
    ]);
    // other unused parts stay muted in defrost
    expect(shownState({ feature: 'htr' }, 'muted', 'defrost')).toBe('muted');
  });

  test('a probe that is missing or reads the sentinel mutes its segment even in an active circuit', () => {
    const units = { temperature: '°C', difference: 'K', power: 'W', pressure: 'bar' } as const;
    const stateOf = (
      role: RolePath,
      value: string,
    ): { state: string; attributes: { unit_of_measurement?: string } } => {
      const quantity = ROLE_BY_PATH.get(role)?.quantity;
      return { state: value, attributes: quantity === undefined ? {} : { unit_of_measurement: units[quantity] } };
    };
    const entities = Object.fromEntries(ROLE_PATHS.map((role) => [role, `sensor.${role}`])) as Record<RolePath, string>;
    const states = Object.fromEntries(
      Object.entries(HEATING).map(([role, value]) => [`sensor.${role}`, stateOf(role as RolePath, String(value))]),
    );
    const rd = readRoles(
      { ...states, 'sensor.brine.inlet_temperature': stateOf('brine.inlet_temperature', '-999.900024414062') },
      entities,
    );
    const { get } = scenario({ mode: 'heating' }, {}, rd);
    expect(get('ln4_a')).toMatchObject({ color: MUTED_COLOR, muted: true });
    // its circuit is active, so the flow still shows
    expect(get('ln4_a').animated).toBe(true);
    expect(get('ln3').muted).toBe(false);
  });
});

describe('flow animation', () => {
  test('the dash period follows the speed: 100 % at 1.2 s, slower below, clamped', () => {
    expect(flowDuration(100)).toBeCloseTo(1.2);
    expect(flowDuration(50)).toBeCloseTo(2.4);
    expect(flowDuration(1)).toBe(FLOW_SECONDS_MAX);
    expect(flowDuration(1000)).toBe(FLOW_SECONDS_MIN);
  });

  test('0 %, a negative speed or no speed is still', () => {
    expect(flowDuration(0)).toBeUndefined();
    expect(flowDuration(-3)).toBeUndefined();
    expect(flowDuration(undefined)).toBeUndefined();
  });

  test('faster pump: the brine segments animate faster at 100 % than at 50 %', () => {
    const slow = scenario({ mode: 'heating' }, { ...HEATING, 'brine.pump': 50 }).get('ln3');
    const fast = scenario({ mode: 'heating' }, { ...HEATING, 'brine.pump': 100 }).get('ln3');
    expect(slow.animated && fast.animated).toBe(true);
    expect(slow.duration).toBeGreaterThan(fast.duration ?? 0);
  });

  test('production segments follow pump 15, refrigerant segments the compressor %', () => {
    const { get } = scenario({ mode: 'heating' }, { ...HEATING, 'production.pump': 40, 'compressor.percentage': 80 });
    expect(get('p1_up').duration).toBeCloseTo(3);
    expect(get('ref_discharge').duration).toBeCloseTo(1.5);
  });

  test('a segment with a speed role is still at 0 % and with an unknown speed', () => {
    const stopped = scenario({ mode: 'heating' }, { ...HEATING, 'brine.pump': 0 });
    expect(stopped.get('ln3')).toMatchObject({ animated: false });
    const unknown = scenario({ mode: 'heating' }, { ...HEATING, 'production.pump': undefined as unknown as number });
    expect(unknown.get('p1_up').animated).toBe(false);
    // its colour does not depend on the speed
    expect(unknown.get('p1_up').muted).toBe(false);
  });

  test('stubs are coloured but never animated', () => {
    const { get } = scenario({ mode: 'heating' }, HEATING);
    for (const id of ['p1_stub', 'p2_stub', 'prod_tap_a', 'prod_drain', 'brine_tap_a', 'brine_drain', 'htr_drain']) {
      const state = SEGMENTS.find((segment) => segment.id === id);
      expect(state?.stub, id).toBe(true);
      expect(get(id).animated, id).toBe(false);
    }
    expect(get('p1_stub').muted).toBe(false);
  });

  test('HTR water segments animate at the fixed medium speed whatever the pump speeds', () => {
    const { get } = scenario({ mode: 'active_cooling' }, { ...HTR_ON, 'production.pump': 0, 'brine.pump': 0 });
    for (const id of ['htr_in', 'htr_pump', 'htr_to_9', 'htr_riser']) {
      expect(get(id), id).toMatchObject({ animated: true, duration: HTR_FLOW_SECONDS });
    }
  });

  test('refrigerant runs reversed in active cooling, and only on the reversible legs', () => {
    const cooling = scenario({ mode: 'active_cooling' }, HEATING);
    const heating = scenario({ mode: 'heating' }, HEATING);
    for (const id of ['ref_14_8', 'ref_7_14', 'ref_8_13', 'ref_13_12', 'ref_12_7']) {
      expect(cooling.get(id).reversed, `cooling ${id}`).toBe(true);
      expect(heating.get(id).reversed, `heating ${id}`).toBe(false);
    }
    expect(cooling.get('ref_discharge').reversed).toBe(false);
    expect(cooling.get('ref_suction').reversed).toBe(false);
  });

  test('active cooling swaps the roles of 7 and 8: the discharge colour reaches evaporator 7', () => {
    const { get } = scenario({ mode: 'active_cooling' }, HEATING);
    expect(get('ref_discharge').color).toBe(color(52.5));
    expect(get('ref_7_14').color).toBe(color(52.5));
    expect(get('ref_14_8').color).toBe(color(1));
    // 7 now condenses: the liquid leaves it at the condensation temperature
    expect(get('ref_12_7').color).toBe(color(27));
    expect(get('ref_8_13').color).toBe(color(-5.3));
  });
});

describe('mode-dependent roles (add-schematic-card D7)', () => {
  const viewOf = (mode: Mode): Pick<PipeView, 'mode' | 'circuits'> => scenario({ mode }, HEATING).view;
  const seg = (id: string) => {
    const found = SEGMENTS.find((segment) => segment.id === id);
    if (found === undefined) throw new Error(id);
    return found;
  };

  test('prod_10_out takes the production outlet temperature', () => {
    for (const mode of ['passive_cooling', 'defrost'] as const) {
      expect(roleFor(seg('prod_10_out'), viewOf(mode))).toBe('production.outlet_temperature');
    }
  });

  test('the production legs from valve 27 to condenser 8 take the outlet temperature in passive cooling and defrost only', () => {
    for (const id of ['prod_27_15', 'prod_15_8']) {
      expect(roleFor(seg(id), viewOf('passive_cooling')), id).toBe('production.outlet_temperature');
      expect(roleFor(seg(id), viewOf('defrost')), id).toBe('production.outlet_temperature');
      expect(roleFor(seg(id), viewOf('heating')), id).toBe('production.return_temperature');
    }
  });

  test('passive cooling: the legs after valve 27 are coloured by the outlet probe', () => {
    const { get } = scenario({ mode: 'passive_cooling' }, HEATING);
    expect(get('prod_27_15').color).toBe(color(25.2));
    expect(get('prod_15_8').color).toBe(color(25.2));
    expect(get('prod_10_in').color).toBe(color(22));
  });

  test('defrost: the brine through exchanger 10 has the brine inlet colour, animated towards the air unit', () => {
    const { get } = scenario({ mode: 'defrost' }, { ...HEATING, 'brine.inlet_temperature': 8 });
    expect(get('br_10_in').color).toBe(color(8));
    expect(get('br_10_in').animated).toBe(true);
    expect(get('src_in')).toMatchObject({ color: color(8), animated: true });
    for (const id of ['src_out', 'ln3', 'br_10_28'])
      expect(get(id), id).toMatchObject({ animated: true, reversed: false });
  });

  test('HTR water on the DHW lines takes the DHW temperature and the fixed speed, outside the arm of valve 26', () => {
    const { get } = scenario({ mode: 'active_cooling' }, { ...HTR_ON, 'dhw.temperature': 48 });
    for (const id of [
      'dhw_sup_b',
      'dhw_sup_c',
      'dhw_ret_b',
      'dhw_ret_c',
      'dhw_ext_in',
      'dhw_ext_coil',
      'dhw_ext_out',
    ]) {
      expect(get(id), id).toMatchObject({ color: color(48), animated: true, duration: HTR_FLOW_SECONDS });
    }
    // the arm of valve 26 is the production DHW circuit, which is idle
    expect(get('dhw_sup_a')).toMatchObject({ muted: true, animated: false });
    expect(get('dhw_ret_a')).toMatchObject({ muted: true, animated: false });
  });

  test('HTR recovery with no DHW temperature mutes the DHW lines', () => {
    const { get } = scenario(
      { mode: 'active_cooling' },
      { ...HTR_ON, 'dhw.temperature': undefined as unknown as number },
    );
    expect(get('dhw_ext_in').muted).toBe(true);
  });

  test('HTR state off or unknown: the DHW lines are muted and still, in active cooling and in heating', () => {
    for (const mode of ['active_cooling', 'heating'] as const) {
      for (const htr of [{ 'htr.active': false }, {}]) {
        const { get } = scenario({ mode }, { ...HEATING, ...htr });
        expect(get('dhw_ext_in'), `${mode} ${JSON.stringify(htr)}`).toMatchObject({ muted: true, animated: false });
        expect(get('htr_riser'), `${mode} ${JSON.stringify(htr)}`).toMatchObject({ muted: true, animated: false });
      }
    }
  });

  // dhw-storage "HTR recovery while heating": the same drawing as in active cooling, valve 26 stays towards ports 1/2
  test('heating with HTR on: the DHW lines take the DHW temperature at the fixed HTR speed, external and internal', () => {
    for (const dhw of ['external', 'internal'] as const) {
      const { get, view } = scenario({ mode: 'heating', dhw }, { ...HTR_ON, 'dhw.temperature': 46 });
      expect(view.circuits.valve26).toBe('production');
      for (const id of ['htr_in', 'htr_pump', 'htr_to_9', 'htr_riser']) {
        expect(get(id), `${dhw} ${id}`).toMatchObject({ color: color(46), animated: true, duration: HTR_FLOW_SECONDS });
      }
    }
    const { get } = scenario({ mode: 'heating' }, { ...HTR_ON, 'dhw.temperature': 46 });
    for (const id of [
      'dhw_sup_b',
      'dhw_sup_c',
      'dhw_ret_b',
      'dhw_ret_c',
      'dhw_ext_in',
      'dhw_ext_coil',
      'dhw_ext_out',
    ]) {
      expect(get(id), id).toMatchObject({ color: color(46), animated: true, duration: HTR_FLOW_SECONDS });
    }
    // the arm of valve 26 is the production DHW circuit, which is idle; DG1 production keeps its own colour
    expect(get('dhw_sup_a')).toMatchObject({ muted: true, animated: false });
    expect(get('dhw_ret_a')).toMatchObject({ muted: true, animated: false });
  });

  test('DHW mode ignores the HTR state: no HTR water on the DHW lines', () => {
    const { get } = scenario({ mode: 'dhw' }, HTR_ON);
    expect(get('htr_riser')).toMatchObject({ muted: true, animated: false });
  });

  test('without exchanger 10 (passive cooling false) the legs from valve 27 keep the return role', () => {
    const features = mergeFeatures(4, { passive_cooling: false });
    const rd = readings(HEATING);
    for (const mode of ['passive_cooling', 'defrost'] as const) {
      const view = { mode, circuits: circuitsFor(mode, features, 'external', rd, true, true) };
      expect(view.circuits.valves2728).toBe('closed');
      const segment = SEGMENTS.find((item) => item.id === 'prod_15_8');
      if (segment === undefined) throw new Error('no prod_15_8');
      expect(roleFor(segment, view), mode).toBe('production.return_temperature');
    }
  });

  test('dhw mode: the DHW lines take the production outlet colour, at the pump speed', () => {
    const { get } = scenario(
      { mode: 'dhw' },
      { ...HEATING, 'production.outlet_temperature': 55, 'production.pump': 100 },
    );
    for (const id of ['dhw_sup_a', 'dhw_sup_b', 'dhw_sup_c', 'dhw_ext_in', 'dhw_ext_coil']) {
      expect(get(id), id).toMatchObject({ color: color(55), animated: true });
      expect(get(id).duration, id).toBeCloseTo(1.2);
    }
    expect(get('dhw_ret_c').color).toBe(color(22));
    expect(get('p1_up')).toMatchObject({ muted: true, animated: false });
  });

  test('model C tap-water stubs 47/48/49 take the DHW temperature in every mode and never animate', () => {
    for (const mode of ['heating', 'dhw', 'standby', 'active_cooling'] as const) {
      const { get } = scenario({ mode, dhw: 'internal' }, { ...HEATING, 'dhw.temperature': 52.1 });
      for (const id of TAP_WATER_SEGMENT_IDS) {
        expect(get(id), `${mode} ${id}`).toMatchObject({ color: color(52.1), muted: false, animated: false });
      }
    }
    const none = scenario(
      { mode: 'heating', dhw: 'internal' },
      { ...HEATING, 'dhw.temperature': undefined as unknown as number },
    );
    expect(none.get('tap_47').muted).toBe(true);
  });

  test('model C: the coil 51 symbol takes the dhw_coil state, never animated', () => {
    const colorForMode = (mode: Mode, values: Partial<Record<RolePath, number | boolean>> = HEATING): string =>
      coilColor(scenario({ mode, dhw: 'internal' }, values).view);
    expect(colorForMode('dhw')).toBe(color(25.2));
    // HTR recovery: the coil is fed with HTR water, so it takes the DHW temperature like the DHW lines
    expect(colorForMode('active_cooling', HTR_ON)).toBe(color(52.1));
    expect(colorForMode('active_cooling', { ...HTR_ON, 'dhw.temperature': 48 })).toBe(color(48));
    expect(colorForMode('active_cooling')).toBe(MUTED_COLOR);
    // HTR recovery while heating
    expect(colorForMode('heating', { ...HTR_ON, 'dhw.temperature': 46 })).toBe(color(46));
    expect(colorForMode('heating')).toBe(MUTED_COLOR);
    expect(colorForMode('standby', HTR_ON)).toBe(MUTED_COLOR);
    expect(COMPONENTS.some((component) => component.item === 51 && component.kind === 'coil')).toBe(true);
    expect(SEGMENTS.some((segment) => segment.id === 'coil_51')).toBe(false);
  });
});

describe('outer-loop source states (deferred from group 5)', () => {
  test('standby: the outer-loop pipes are muted and still', () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const { states } = scenario({ mode: 'standby', source }, HEATING);
      for (const [id, state] of states) {
        if (id.startsWith('src_')) expect(state, `${source} ${id}`).toMatchObject({ muted: true, animated: false });
      }
    }
  });

  test('heating with the brine pump running: the source pipes are coloured and animated', () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const { states } = scenario({ mode: 'heating', source }, HEATING);
      const own = [...states].filter(([id]) => id.startsWith('src_'));
      expect(own.length).toBeGreaterThan(2);
      for (const [id, state] of own) expect(state, `${source} ${id}`).toMatchObject({ muted: false, animated: true });
    }
  });

  test('the air unit exit takes the air unit outlet probe, the ground loop the brine inlet', () => {
    expect(scenario({ mode: 'heating', source: 'air' }, HEATING).get('src_air_exit').color).toBe(color(0.5));
    expect(
      scenario({ mode: 'heating', source: 'air' }, { ...HEATING, 'source.air_unit_outlet_temperature': 4 }).get(
        'src_air_exit',
      ).color,
    ).toBe(color(4));
    expect(scenario({ mode: 'heating', source: 'ground' }, HEATING).get('src_gnd_exit').color).toBe(color(0.5));
  });

  test('defrost with the brine pump running: the air pipes are coloured by the brine probes and animated', () => {
    const { get } = scenario({ mode: 'defrost', source: 'air' }, HEATING);
    expect(get('src_out')).toMatchObject({ color: color(-2.8), animated: true });
    expect(get('src_air_coil')).toMatchObject({ color: color(-2.8), animated: true });
  });

  test('a stopped brine pump mutes the source pipes even in heating', () => {
    const { get } = scenario({ mode: 'heating', source: 'air' }, { ...HEATING, 'brine.pump': 0 });
    expect(get('src_out')).toMatchObject({ muted: true, animated: false });
  });
});

describe('the DHW storage states (deferred from group 5)', () => {
  test('the tank body takes the DHW temperature on the scale', () => {
    expect(tankColor(scenario({ mode: 'heating' }, HEATING).view)).toBe(color(52.1));
  });

  test('DHW temperature unavailable: the tank body is muted', () => {
    expect(
      tankColor(scenario({ mode: 'heating' }, { ...HEATING, 'dhw.temperature': undefined as unknown as number }).view),
    ).toBe(MUTED_COLOR);
  });

  test('the tank keeps its colour while the coil loop is muted (heating)', () => {
    const s = scenario({ mode: 'heating' }, HEATING);
    expect(tankColor(s.view)).toBe(color(52.1));
    expect(s.get('dhw_ext_coil').muted).toBe(true);
  });
});

describe('reduced motion', () => {
  test('the stylesheet stops the dash animation under prefers-reduced-motion and leaves colours alone', () => {
    const css = cabinetStyles.cssText;
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.flow\s*\{\s*animation: none;\s*\}\s*\}/);
    const block = /@media \(prefers-reduced-motion: reduce\)\s*\{[^@]*\}\s*\}/.exec(css)?.[0] ?? '';
    expect(block).not.toMatch(/stroke:|color/);
  });
});

describe('pump without a percentage animates at the fixed medium speed', () => {
  test('a pump reading on (binary sensor) animates its production segments at the fixed speed', () => {
    const { get } = scenario({ mode: 'heating' }, { ...HEATING, 'production.pump': true });
    expect(get('trunk')).toMatchObject({ animated: true, duration: HTR_FLOW_SECONDS });
  });

  test('a pump off, 0 or unknown stays still', () => {
    for (const value of [false, 0, undefined]) {
      expect(scenario({ mode: 'heating' }, { ...HEATING, 'production.pump': value }).get('trunk').animated).toBe(false);
    }
  });

  test('2400 rpm becomes running through animationReadings, a percentage does not', () => {
    const rd = readings({ 'production.pump': 2400, 'brine.pump': 60, 'source.fan_speed': 900 });
    const entities = {
      'production.pump': 'sensor.a',
      'brine.pump': 'sensor.b',
      'source.fan_speed': 'sensor.c',
    } as Record<RolePath, string>;
    const states = {
      'sensor.a': { state: '2400', attributes: { unit_of_measurement: 'rpm' } },
      'sensor.b': { state: '60', attributes: { unit_of_measurement: '%' } },
      'sensor.c': { state: '900', attributes: { unit_of_measurement: 'rpm' } },
    };
    const moving = animationReadings(rd, entities, states);
    expect(moving['production.pump']).toBe(true);
    expect(moving['brine.pump']).toBe(60);
    expect(moving['source.fan_speed']).toBe(true);
    const { get } = scenario({ mode: 'heating' }, {}, moving);
    expect(get('trunk')).toMatchObject({ animated: true, duration: HTR_FLOW_SECONDS });
  });
});
