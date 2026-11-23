// The band's shared body style (harmonize-band D1): every body of the band (the emitter, the air unit, the ground collector and the
// external tank) carries the class `band-outline`, which sets the one outline weight. The per-body classes stay for the colour and the
// muting. Tank 50 inside the cabinet is not a band body but shares the weight of the external tank's `tank-body`.
import { css } from 'lit';

export const bandStyles = css`
  .band-outline,
  .tank-body {
    stroke-width: max(2.5, var(--outline-width, 2));
  }
`;
