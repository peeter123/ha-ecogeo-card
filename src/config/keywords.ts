// Keywords per role for the entity suggestions (add-entity-discovery D2, D8): subject words (what the value is about)
// and role words (what it measures), in English, Dutch, Spanish and German in one list. Words are written lower case,
// accents removed (the matcher removes them from the entity's names too); a German umlaut word has its plain and its
// `ue`/`oe`/`ae` spelling. A word of four or more letters hits as a substring of a name token (so `druk` hits
// `zuigdruk`); a shorter one only as a whole token. A role whose single word says everything (`superheat`, `cop`)
// lists it as subject and as role word, so a name with only that word reaches the strong threshold.
import type { RolePath } from './roles';

export interface RoleKeywords {
  subject: readonly string[];
  role: readonly string[];
  /** Words that disqualify a candidate by its names (not by the `_<suffix>` id rule): it is named as something else. */
  exclude?: readonly string[];
}

/** Splits a space separated word list. */
const w = (words: string): readonly string[] => words.split(/\s+/).filter((word) => word !== '');

/** Shared word groups. */
const TEMP = 'temp temperature temperatuur temperatura temperatur';
const PRESSURE = 'pressure druk presion druck';
const PUMP = 'pump pomp bomba pumpe circulator';
const HEATING_CIRCUIT = 'heating verwarming heizung heizkreis calefaccion cv';
const PRODUCTION = `production productie produccion produktion ${HEATING_CIRCUIT}`;
const BRINE = 'brine glycol source bron brijn captacion salmuera sole';
const DHW = 'dhw sanitary sanitaria tapwater warmwater warmwasser acs caliente domestic hotwater boiler';
const DEMAND = 'demand vraag demanda anforderung bedarf request';
const SUCTION = 'suction zuig saug ansaug succion aspiracion niederdruck lagedruk';
const DISCHARGE = 'discharge pers druckgas heissgas descarga hochdruck hogedruk';
const CAPACITY = 'capacity vermogen capacidad kapazitat leistung power';
const OPENING = 'valve ventiel valvula ventil position stand posicion stellung';
const COMPRESSOR = 'compressor compresor kompressor verdichter';
const CONDENSATION = 'condens condensation condensatie condensacion kondensation kondens';
const EVAPORATION = 'evaporat evaporation evaporacion verdamp verdampfung';
const HEATING = `${HEATING_CIRCUIT} dg verwarmen`;
const SETPOINT = 'setpoint set target desired gewenst ingesteld soll wunsch consigna objetivo streef';
const SUPERHEAT = 'superheat oververhitting oververhit sobrecalentamiento ueberhitzung uberhitzung';
const ON_OFF = 'on off aan uit onoff encendido apagado ein aus';
const ALARM = 'alarm alarma storing stoerung storung fehler error fault malfunction';
const HTR = 'htr recovery recuperacion recuperatie rueckgewinnung';
const POWER = 'power vermogen potencia leistung';
/** Electrical power (a W entity of the same device): not heat, so the heat power roles exclude it. */
const ELECTRICAL = 'electric elektr';
const NOT_DG1 = [ELECTRICAL, DHW, HTR].join(' ');
const NOT_DHW = [ELECTRICAL, HTR].join(' ');
const NOT_HTR = [ELECTRICAL, DHW].join(' ');
const SYSTEM = 'system systeem sistema';
const COP = 'cop scop coefficient rendimiento rendement wirkungsgrad efficiency';

/* prettier-ignore */
export const KEYWORDS: Readonly<Record<RolePath, RoleKeywords>> = {
  'production.outlet_temperature': { subject: w(PRODUCTION), role: w(TEMP) },
  'production.return_temperature': { subject: w(PRODUCTION), role: w(TEMP) },
  'production.pressure': { subject: w(PRODUCTION), role: w(PRESSURE) },
  'production.pump': { subject: w(PRODUCTION), role: w(PUMP) },
  'brine.outlet_temperature': { subject: w(BRINE), role: w(TEMP) },
  'brine.inlet_temperature': { subject: w(BRINE), role: w(TEMP) },
  'brine.pressure': { subject: w(BRINE), role: w(PRESSURE) },
  'brine.pump': { subject: w(BRINE), role: w(PUMP) },
  'compressor.speed': { subject: w(COMPRESSOR), role: w('rpm speed toerental toeren velocidad drehzahl frequency frequentie frecuencia frequenz hz running draait actief active activo laufend') },
  'compressor.percentage': { subject: w(COMPRESSOR), role: w('percentage porcentaje prozent load belasting carga auslastung capaciteit') },
  'compressor.power': { subject: w('power vermogen potencia leistung electrical elektrisch electrico'), role: w('consumption opgenomen verbruik consumo verbrauch aufnahme') },
  'compressor.suction_temperature': { subject: w(SUCTION), role: w(TEMP) },
  'compressor.discharge_temperature': { subject: w(DISCHARGE), role: w(TEMP) },
  'compressor.suction_pressure': { subject: w(SUCTION), role: w(PRESSURE) },
  'compressor.discharge_pressure': { subject: w(DISCHARGE), role: w(PRESSURE) },
  'compressor.mode': { subject: w(COMPRESSOR), role: w('mode modus modo operation operating bedrijf funcionamiento betriebsart') },
  'refrigerant.condensation_temperature': { subject: w(CONDENSATION), role: w(TEMP) },
  'refrigerant.evaporation_temperature': { subject: w(EVAPORATION), role: w(TEMP) },
  'refrigerant.superheat': { subject: w(SUPERHEAT), role: w(SUPERHEAT) },
  'refrigerant.expansion_valve': { subject: w('expansion expansie expansionsventil expans'), role: w(OPENING) },
  'heating.capacity': { subject: w(CONDENSATION), role: w(CAPACITY) },
  'cooling.capacity': { subject: w(EVAPORATION), role: w(CAPACITY) },
  'heating.demand': { subject: w(HEATING), role: w(DEMAND) },
  'heating.setpoint': { subject: w(HEATING), role: w(`${TEMP} ${SETPOINT}`) },
  'dhw.temperature': { subject: w(DHW), role: w(TEMP) },
  'dhw.setpoint': { subject: w(DHW), role: w(`${TEMP} ${SETPOINT}`) },
  'dhw.start_delta': { subject: w(DHW), role: w('delta difference verschil diferencia unterschied start starten arranque') },
  'dhw.demand': { subject: w(DHW), role: w(DEMAND) },
  'source.fan_speed': { subject: w('fan ventilator ventilador luefter lufter aerothermal aerotermico'), role: w('speed toerental toeren velocidad drehzahl rpm fan ventilator ventilador') },
  'source.air_unit_outlet_temperature': { subject: w('luchtunit lufteinheit airunit aerothermal aero'), role: w(TEMP) },
  'source.outside_temperature': { subject: w('outside outdoor external buiten exterior aussen ausen'), role: w(TEMP) },
  'unit.on_off': { subject: w(`${ON_OFF} heatpump warmtepomp`), role: w(`${ON_OFF} power switch schakelaar`) },
  'unit.summer': { subject: w('summer zomer verano sommer'), role: w('summer zomer verano sommer mode bedrijf modo betrieb') },
  'unit.winter': { subject: w('winter invierno'), role: w('winter invierno mode bedrijf modo betrieb') },
  'unit.alarm': { subject: w(ALARM), role: w(ALARM) },
  'unit.connection': { subject: w('connection connected connectivity conexion verbinding verbindung online communication'), role: w('connection connected connectivity conexion verbinding verbindung status online communication') },
  'unit.cop': { subject: w(COP), role: w(COP), exclude: w(SYSTEM) },
  // The optional roles of add-htr-state D6. The heat power roles exclude electrical power and each other's subjects
  // (the firmware entities of the three heat powers share words), so names alone tell them apart.
  'heating.power': { subject: w(HEATING), role: w(POWER), exclude: w(NOT_DG1) },
  'dhw.power': { subject: w(DHW), role: w(POWER), exclude: w(NOT_DHW) },
  'htr.active': { subject: w(HTR), role: w('active actief activo aktiv') },
  'htr.power': { subject: w(HTR), role: w(POWER), exclude: w(NOT_HTR) },
  'unit.system_cop': { subject: w(SYSTEM), role: w(COP) },
};

/** Direction words, shared by all roles (a word of four or more letters also hits inside a compound word). */
export const DIRECTION_WORDS: Readonly<Record<'in' | 'out', readonly string[]>> = {
  in: w(
    `in inlet return retour retorno inflow terug terugvoer terugloop inlaat entrada eintritt ruecklauf rucklauf ingaand eingang ${SUCTION}`,
  ),
  out: w(`out outlet supply aanvoer uitlaat salida impulsion austritt vorlauf uitgaand ausgang uit ${DISCHARGE}`),
};

/** Setpoint words: a candidate with one is a setpoint, only a setpoint role may take it, and a setpoint role needs one. */
export const SETPOINT_WORDS: readonly string[] = w(SETPOINT);

/** The roles that hold a setpoint (the user's wish, not a measurement). */
export const SETPOINT_ROLES: ReadonlySet<RolePath> = new Set<RolePath>(['heating.setpoint', 'dhw.setpoint']);

/** A weak `out` word: it counts only when no `in` word hits ("return flow" is a return). */
export const WEAK_OUT_WORDS: readonly string[] = w('flow');
