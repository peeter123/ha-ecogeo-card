// The name of a role in the editor's lists (the "Not present" choice, the suggestion report, the entity check):
// its group title and its label, such as "Brine circuit: Inlet temperature".
import { EDITOR } from '../strings';

const GROUPS: Readonly<Record<string, string>> = EDITOR.roleGroups;
const ROLES: Readonly<Record<string, string>> = EDITOR.roles;

/** Labels by path, for roles whose last path part is shared with another role's: the heat power roles (add-htr-state D6). */
const PATH_LABELS: Readonly<Record<string, string>> = {
  'heating.power': EDITOR.heatPower,
  'dhw.power': EDITOR.heatPower,
  'htr.power': EDITOR.heatPower,
};

/** The label of the role at a path such as `brine.inlet_temperature`: its own by path, else by its last part. */
export function roleOwnLabel(path: string): string {
  const name = path.split('.')[1] ?? '';
  return PATH_LABELS[path] ?? ROLES[name] ?? name;
}

/** The name of the role at a path such as `brine.inlet_temperature`. */
export function roleLabel(path: string): string {
  const [group = ''] = path.split('.');
  return `${GROUPS[group] ?? group}: ${roleOwnLabel(path)}`;
}
