import type { ReportsData } from '../../types/report';

export const mockReportsData: ReportsData = {
  timeframe: 'Current Quarter (Q3 2026)',
  kpis: {
    totalWarranties: 1420,
    warrantiesGrowthPct: 14.8,
    openClaims: 38,
    claimsResolutionRatePct: 91.4,
    avgReviewTurnaroundHours: 4.2,
    totalPayoutsAud: 148920,
  },
  volumeTrends: [
    { month: 'Apr 2026', warranties: 110, claims: 22, payoutsAud: 32400 },
    { month: 'May 2026', warranties: 135, claims: 28, payoutsAud: 41200 },
    { month: 'Jun 2026', warranties: 125, claims: 24, payoutsAud: 36800 },
    { month: 'Jul 2026', warranties: 155, claims: 34, payoutsAud: 51200 },
    { month: 'Aug 2026', warranties: 170, claims: 39, payoutsAud: 58900 },
    { month: 'Sep 2026 (MTD)', warranties: 42, claims: 8, payoutsAud: 12400 },
  ],
  caseStatusDistribution: [
    { name: 'In Progress', count: 18, percentage: 47, colorHex: '#2563eb' },
    { name: 'Pending Review', count: 11, percentage: 29, colorHex: '#eab308' },
    { name: 'Open Intake', count: 6, percentage: 16, colorHex: '#64748b' },
    { name: 'Closed / Settled', count: 3, percentage: 8, colorHex: '#10b981' },
  ],
  defectCategories: [
    { name: 'Transmission & Drivetrain', count: 14, percentage: 37, colorHex: '#3b82f6' },
    { name: 'Engine & Mechanical', count: 10, percentage: 26, colorHex: '#ef4444' },
    { name: 'Electrical & Sensors', count: 8, percentage: 21, colorHex: '#8b5cf6' },
    { name: 'Suspension & Steering', count: 4, percentage: 11, colorHex: '#f97316' },
    { name: 'Cooling & HVAC', count: 2, percentage: 5, colorHex: '#06b6d4' },
  ],
  evidenceApprovalRate: {
    approved: 84,
    rejected: 9,
    infoRequested: 7,
  },
};
