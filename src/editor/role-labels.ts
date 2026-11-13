// The name of a role in the editor's lists (the "Not present" choice, the suggestion report, the entity check):
// its group title and its label, such as "Brine circuit: Inlet temperature".
import { EDITOR } from '../strings';

const GROUPS: Readonly<Record<string, string>> = EDITOR.roleGroups;
const ROLES: Readonly<Record<string, string>> = EDITOR.roles;

/** The name of the role at a path such as `brine.inlet_temperature`. */
export function roleLabel(path: string): string {
  const [group = '', name = ''] = path.split('.');
  return `${GROUPS[group] ?? group}: ${ROLES[name] ?? name}`;
}
