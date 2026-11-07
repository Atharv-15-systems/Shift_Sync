export interface DetectedRisk {
  keyword: string;
  severity: 'critical' | 'high' | 'medium';
  text: string;
  category: 'safety' | 'operational' | 'medical';
}

export interface RiskAnalysisResult {
  hasCriticalRisks: boolean;
  risks: DetectedRisk[];
  counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  ruleBasedSummary: string;
}

const RISK_RULES: Array<{
  keyword: string;
  severity: 'critical' | 'high' | 'medium';
  category: 'safety' | 'operational' | 'medical';
}> = [
  { keyword: 'allergy', severity: 'critical', category: 'medical' },
  { keyword: 'danger', severity: 'critical', category: 'safety' },
  { keyword: 'critical', severity: 'critical', category: 'medical' },
  { keyword: 'fail', severity: 'critical', category: 'operational' },
  { keyword: 'urgent', severity: 'high', category: 'operational' },
  { keyword: 'leak', severity: 'high', category: 'safety' },
  { keyword: 'overdue', severity: 'high', category: 'operational' },
  { keyword: 'do not', severity: 'high', category: 'medical' },
  { keyword: 'broken', severity: 'medium', category: 'operational' },
  { keyword: 'missing', severity: 'medium', category: 'operational' }
];

export function analyzeHandoverRisks(
  items: Array<{ kind: string; text: string; priority?: string }>,
  notes?: string
): RiskAnalysisResult {
  const risks: DetectedRisk[] = [];
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  const allTexts = items.map(i => i.text);
  if (notes) allTexts.push(notes);

  // 1. Calculate Priority Counts
  for (const item of items) {
    if (item.kind === 'pending' || item.kind === 'warning') {
      const p = (item.priority || 'medium').toLowerCase();
      if (p === 'critical') counts.critical++;
      else if (p === 'high') counts.high++;
      else if (p === 'low') counts.low++;
      else counts.medium++;
    }
  }

  // 2. Keyword-based Safety Threat Scanning (Offline Rule-Based)
  for (const text of allTexts) {
    const lower = text.toLowerCase();
    for (const rule of RISK_RULES) {
      const regex = new RegExp(`\\b${rule.keyword}\\b`, 'i');
      if (regex.test(lower)) {
        // Avoid duplicate identical text flags for same rule
        if (!risks.some(r => r.keyword === rule.keyword && r.text === text)) {
          risks.push({
            keyword: rule.keyword,
            severity: rule.severity,
            category: rule.category,
            text: text.trim()
          });
        }
      }
    }
  }

  // Sort risks by severity: critical > high > medium
  const severityRank = { critical: 3, high: 2, medium: 1 };
  risks.sort((a, b) => severityRank[b.severity] - severityRank[a.severity]);

  const hasCriticalRisks = risks.some(r => r.severity === 'critical') || counts.critical > 0;

  // 3. Generate Structured 3-Line Summary
  const pendingCount = items.filter(i => i.kind === 'pending').length;
  const completedCount = items.filter(i => i.kind === 'completed').length;
  const warningCount = items.filter(i => i.kind === 'warning').length;

  const line1 = `Shift Overview: ${completedCount} tasks completed; ${pendingCount} active tasks remaining (${counts.critical} critical, ${counts.high} high).`;
  const line2 = risks.length > 0
    ? `Risk Alert: ${risks.length} potential hazard(s) flagged — highest severity: ${risks[0].severity.toUpperCase()} (${risks[0].keyword}).`
    : `Risk Alert: No critical safety or operational hazards detected.`;
  const line3 = warningCount > 0
    ? `Action Required: Review ${warningCount} safety warning(s) and obtain incoming acknowledgment before shift lock.`
    : `Action Required: Complete standard shift transition acknowledgement.`;

  const ruleBasedSummary = `${line1}\n${line2}\n${line3}`;

  return {
    hasCriticalRisks,
    risks,
    counts,
    ruleBasedSummary
  };
}

