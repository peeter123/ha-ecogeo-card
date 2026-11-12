import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { configErrors } from '../../src/config/options';
import { INDICATIONS } from '../../src/strings';

describe('card editor hooks', () => {
  test('card-editor "Editor element": getConfigElement returns an ecogeo-card-editor element', () => {
    const element = EcogeoCard.getConfigElement();
    expect(element.localName).toBe('ecogeo-card-editor');
    expect(element).toBeInstanceOf(customElements.get('ecogeo-card-editor'));
    expect(typeof (element as unknown as { setConfig: unknown }).setConfig).toBe('function');
  });

  test('card-editor "Picker preview": the stub config is valid and renders the sample-value schematic', async () => {
    const stub = EcogeoCard.getStubConfig();
    expect(configErrors({ type: 'custom:ecogeo-card', ...stub })).toEqual([]);
    expect(stub).not.toHaveProperty('prefix');
    expect(stub).not.toHaveProperty('entities');
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card', ...stub });
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot?.querySelector('.sample')?.textContent.trim()).toBe(INDICATIONS.sampleValues);
    expect(card.shadowRoot?.querySelector('svg g.cabinet')).not.toBeNull();
    card.remove();
  });
});
