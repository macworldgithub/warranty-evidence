export interface VolumeTrendPoint {
  month: string;
  warranties: number;
  claims: number;
  payoutsAud: number;
}

export interface StatusDistribution {
  name: string;
  count: number;
  percentage: number;
  colorHex: string;
}

export interface ReportsData {
  timeframe: string;
  kpis: {
    totalWarranties: number;
    warrantiesGrowthPct: number;
    openClaims: number;
    claimsResolutionRatePct: number;
    avgReviewTurnaroundHours: number;
    totalPayoutsAud: number;
  };
  volumeTrends: VolumeTrendPoint[];
  caseStatusDistribution: StatusDistribution[];
  defectCategories: StatusDistribution[];
  evidenceApprovalRate: {
    approved: number;
    rejected: number;
    infoRequested: number;
  };
}
