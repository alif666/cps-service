export type DoaRule = {
  id: string; transactionType: string; companyId?: string; businessUnitId?: string; procurementCategory?: string;
  minValue?: string; maxValue?: string; approverRoleId: string; sequenceNo: number; isParallel: boolean;
  effectiveFrom: string; effectiveTo?: string; isActive: boolean; createdAt: string; updatedAt: string;
};
export type CreateDoaRuleInput = Omit<DoaRule, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> & { isActive?: boolean };
export interface DoaRepository { list(): Promise<DoaRule[]>; create(input: CreateDoaRuleInput): Promise<DoaRule>; }
