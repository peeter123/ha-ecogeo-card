# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green. Groups 1-4 do not run `npm run release`.
Emulator screenshots are captured and judged by a subagent, which returns a text verdict.

## 1. Optional roles (no visible change)

- [x] 1.1 Add the five roles to `src/config/roles.ts` with an `optional` flag (design D3): `htr.active`
  (binary_sensor, `htr_active`, item 9), `htr.power` (sensor, `heating_power_htr`, W, 0 decimals, item 9),
  `heating.power` (sensor, `heating_power_dg1`, W, 0 decimals, item 1/2), `dhw.power` (sensor, `heating_power_dhw`, W,
  0 decimals, item 26) and `unit.system_cop` (sensor, `system_cop_display`, 1 decimal, item footer). Every other role
  stays non-optional.
  Verify: `test/config/roles.test.ts` checks the five entries, their suffixes and that exactly these five are optional;
  `test/config/resolve.test.ts` checks the card-config scenario "Default entities of the optional roles".
- [x] 1.2 Add the presence check where the readings are read (`src/calc/readings.ts`): an optional role has no entity
  when it is `none`, or not set in `entities` and its prefix default (or, without a prefix, nothing) is not in
  `hass.states`; an explicitly set entity id and an existing but unknown or unavailable entity keep the entity. Expose
  the result next to the readings so the drawing and the footer can pick their fallbacks; `resolveEntities` stays a
  pure function of the config.
  Verify: `test/calc/readings.test.ts` covers the card-config scenarios "Older firmware", "Set to none", "Explicit
  entity that does not exist", "Default entity unavailable" and "No prefix".
- [x] 1.3 Watch both the preferred and the fallback entity for re-rendering (`src/lib/render.ts`), so the card
  re-renders when an optional default entity appears or disappears.
  Verify: `test/lib/render.test.ts` re-renders when `sensor.<prefix>_heating_power_dg1` is added to `hass.states`.
- [x] 1.4 Give the five roles sample values in `src/config/sample.ts` (heating, HTR off, DG1 power equal to the sample
  condensation capacity, HTR power 0 W, DHW power 0 W, system COP close to the sample COP), taking them without
  fallback (card-config "Optional roles in the sample values").
  Verify: `test/config/sample.test.ts` checks a value for every role, optional ones included.
- [x] 1.5 Document optional roles in `docs/ecogeo-card.md` (the role table and "Using another source": which roles are
  optional, when they have no entity, that an explicit entity keeps its dash) and add the five roles to the README's
  entity list.
  Verify: `test/docs.test.ts` and `test/readme.test.ts` pass with the five role paths listed.
- [x] 1.6 Label the three heat power roles "Heat power" by path in the editor (design D6, card-editor "Labels of the
  heat power roles"); `compressor.power` keeps "Power consumption". Added in the group 1 review.
  Verify: an editor or role-labels test reads "Heat power" for `heating.power`, `dhw.power` and `htr.power`, and "Power
  consumption" for `compressor.power`.

Note (group 1 review): "no visible change" holds for the drawing and the footer, not for the editor. The editor already
shows the new pickers and the `htr` group, the suggestions fill the new roles (keywords without the electrical-power
exclusion until 4.2), and the binding check warns about an absent optional default until 4.1. Accepted as interim:
nothing is released before group 5. The foreign naming writes the optional roles as `none` until 3.2.

## 2. HTR state in heating and active cooling

- [ ] 2.1 Extend `circuitsFor()` in `src/calc/circuits.ts` (design D1): in `heating` and `active_cooling`, with HTR
  `true` and `dhw` `external` or `internal`, add `htr` and `dhw_coil` while `htr.active` is on; when `htr.active` has
  no entity, keep the condensation capacity rule in `active_cooling` only; ignore the role in every other mode. Update
  the doc comment with the inputs.
  Verify: `test/calc/circuits.test.ts` covers every scenario of operating-mode "HTR recovery" and "Active circuits
  follow the mode".
- [ ] 2.2 Check the HTR water on the DHW lines and coil while heating (dhw-storage "HTR recovery while heating"),
  external and internal tank and model C coil 51; no drawing change is expected (`src/diagram/pipes.ts` reads only
  the circuits).
  Verify: `test/diagram/pipes.test.ts` and `test/diagram/dhw.test.ts` assert the DHW temperature colour and the
  fixed HTR speed on the HTR segments in `heating` with `htr.active` on.
- [ ] 2.3 Add the "heating with HTR recovery" scenario to `dev/scenarios.ts` (design D7: heating, `htr_active` on, DG1
  and HTR power, a DHW temperature below 54 °C) and give every firmware scenario values for the new roles (DG1 or
  DHW power by mode, HTR power, `system_cop_display`); add the scenario to the screenshot cycle in `dev/captures.ts`.
  Verify: `test/dev/scenarios.test.ts` checks the scenario list of dev-emulator "Scenario presets"; a subagent
  screenshots the emulator in the heating with HTR scenario at both detail levels and confirms exchanger 9 and pump
  17 active, the DHW lines in the DHW temperature colour and animated, valve 26 towards connections 1/2.
- [ ] 2.4 Update the operating-mode section of `docs/ecogeo-card.md` (HTR in heating and active cooling, the 25-30 s
  tail at the start of a DHW cycle and why DHW mode ignores it, the fallback rule) and the README's HTR line.
  Verify: `test/docs.test.ts` passes; the docs no longer say HTR runs only in active cooling.

## 3. Footer: power items by mode and system COP

- [ ] 3.1 Rework `footerItems()` in `src/diagram/labels.ts` (design D2, D4): remove the condensation and evaporation
  items; add the power items by mode with captions "DG1", "DHW", "Cooling" and "HTR" in `src/strings.ts`, the DG1 and
  DHW fallback to the condensation capacity, the HTR item only with HTR `true`, a DHW tank in use and an `htr.power`
  entity; the efficiency from `unit.system_cop` or else `unit.cop`, 0 as a muted dash, caption "EER" in
  `active_cooling`. Power items are detail tier; the efficiency stays key tier.
  Verify: `test/diagram/labels.test.ts` covers every scenario of live-values "Footer", "Footer power items by mode",
  "Footer efficiency" and "Roles not present are hidden"; `test/card/compact.test.ts` covers "Compact footer without
  power items".
- [ ] 3.2 Leave the optional roles unbound in the foreign naming (`dev/foreign.ts`), so it shows every fallback, and
  bind `unit.cop` to a foreign COP entity (design D7, decided in the group 1 review) so the register COP fallback
  shows; update the foreign naming's description in the README.
  Verify: `test/dev/foreign.test.ts` checks that no optional role is bound and `unit.cop` is; a subagent screenshots
  the foreign naming in the heating with HTR recovery scenario and confirms dev-emulator "Foreign fallbacks".
- [ ] 3.3 Check the footer's wrap and the panel fit with the longest new footer (active cooling with HTR, EER) at
  624 px (`detail: simplified`), 664 px (`detail: full`) and in the 1280 x 800 panel view.
  Verify: `test/card/compact.browser.test.ts` (footer wrap) and `test/card/panel.browser.test.ts` pass in Chromium and
  WebKit with that footer; if the footer needs more than the 64 px allowance, raise the allowance and record why in
  the docs.
- [ ] 3.4 Update the footer snapshots and screenshot the emulator in the heating with HTR, DHW, active cooling with
  HTR and standby scenarios, full and compact layout.
  Verify: a subagent confirms each footer against live-values (items, captions, units with a no-break space, a dash
  for COP 0 in standby) and that no condensation or evaporation item is shown.
- [ ] 3.5 Update the footer section and the key/detail tier table of `docs/ecogeo-card.md` (the table of design D2,
  the system COP and its meter dependency, the register COP fallback, the HTR power as the firmware's estimate) and the
  README's footer description.
  Verify: `test/docs.test.ts` and `test/readme.test.ts` pass; the docs no longer list the capacities as footer items.

## 4. Editor: binding check and suggestions

- [ ] 4.1 Skip the "does not exist" warning in `src/editor/binding-check.ts` for an optional role whose entity comes
  from the prefix default (design D5).
  Verify: `test/editor/entity-discovery.test.ts` (or the binding check's own test) covers card-editor "Optional default
  absent" and "Optional role set explicitly", and the existing "Unknown entity" and "Wrong unit".
- [ ] 4.2 Add keywords for the five roles in `src/config/keywords.ts` (design D6), with the electrical-power exclusion
  for `heating.power`, `dhw.power` and `htr.power`.
  Verify: `test/suggest/suggest.test.ts` covers card-editor "Firmware device" and "Electrical power kept apart", and a
  device with Dutch names for the HTR power and state.
  Note (group 1): group 1 already added keywords for the five roles, without the exclusion, so 4.2 reviews and
  completes them. By names alone a plain "COP" and a "System COP" entity still tie for `unit.cop` (only the `_cop`
  suffix rule separates them); the exclusion mechanism of 4.2 should also keep "system systeem sistema" away from
  `unit.cop`.
- [ ] 4.3 Document the binding check exception and the new suggestions in the editor section of
  `docs/ecogeo-card.md`, and the README's editor notes if they list roles.
  Verify: `test/docs.test.ts` passes.

## 5. Release and live check

- [ ] 5.1 Run `npm run release`, deploy `dist/ecogeo-card.js` with the command in `private/installation.md`, and bump
  the dashboard resource's `?v=`.
  Verify: the resource lists the new `?v=`; system_log has no `frontend.js` error for the card after a reload.
- [ ] 5.2 Check the live card (agent screenshot in light mode, plus the states of `htr_active`, the DG1, DHW and HTR
  power and `system_cop_display`): the footer shows the power items of the current mode and the system COP (or a dash
  at 0); when HTR runs during heating, exchanger 9 and pump 17 are active; the dashboard config is unchanged.
  Verify: a subagent's verdict on the screenshot matches the states read at the same moment; record the deploy, the
  `?v=` and the result in `private/installation.md`.

## Workflow follow-up

- One fresh Opus review of the whole change before archiving.
- Archive the change and merge its delta specs into `openspec/specs/`; name it in `AGENTS.md`.
- Confirm HTR in active cooling on the live installation next summer and record it in `private/installation.md`.
