import { describe, it, expect } from 'vitest';
import { analyzeHandoverRisks } from '../src/services/riskDetection.js';

describe('Offline Rule-Based Risk Detection Engine', () => {
  it('detects critical keywords like allergy, danger, and fail', () => {
    const items = [
      { kind: 'warning', text: 'Patient 304 has severe penicillin allergy', priority: 'critical' },
      { kind: 'pending', text: 'Backup generator battery fail alarm triggered', priority: 'high' }
    ];

    const result = analyzeHandoverRisks(items);

    expect(result.hasCriticalRisks).toBe(true);
    expect(result.risks.length).toBeGreaterThanOrEqual(2);
    expect(result.risks.some(r => r.keyword === 'allergy' && r.severity === 'critical')).toBe(true);
    expect(result.risks.some(r => r.keyword === 'fail' && r.severity === 'critical')).toBe(true);
  });

  it('detects high-severity keywords like leak, urgent, and overdue', () => {
    const items = [
      { kind: 'pending', text: 'Valve leak on floor 3 water line', priority: 'high' },
      { kind: 'pending', text: 'Overdue medication for room 201', priority: 'high' }
    ];

    const result = analyzeHandoverRisks(items);

    expect(result.risks.some(r => r.keyword === 'leak' && r.severity === 'high')).toBe(true);
    expect(result.risks.some(r => r.keyword === 'overdue' && r.severity === 'high')).toBe(true);
  });

  it('calculates priority counts properly', () => {
    const items = [
      { kind: 'completed', text: 'Routine check', priority: 'low' },
      { kind: 'pending', text: 'Urgent transfer', priority: 'critical' },
      { kind: 'pending', text: 'Review labs', priority: 'high' },
      { kind: 'pending', text: 'Order supplies', priority: 'medium' },
      { kind: 'warning', text: 'Broken light', priority: 'medium' }
    ];

    const result = analyzeHandoverRisks(items);

    expect(result.counts.critical).toBe(1);
    expect(result.counts.high).toBe(1);
    expect(result.counts.medium).toBe(2);
  });

  it('produces a structured 3-line handover summary', () => {
    const items = [
      { kind: 'completed', text: 'Administer IV fluids' },
      { kind: 'pending', text: 'Check dressing', priority: 'high' },
      { kind: 'warning', text: 'Do not elevate patient left leg', priority: 'high' }
    ];

    const result = analyzeHandoverRisks(items, 'Special monitoring required.');
    const lines = result.ruleBasedSummary.split('\n');

    expect(lines.length).toBe(3);
    expect(lines[0]).toContain('Shift Overview:');
    expect(lines[1]).toContain('Risk Alert:');
    expect(lines[2]).toContain('Action Required:');
  });
});
