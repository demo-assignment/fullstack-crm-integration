export enum LogicalOperator {
  And = "and",
  Or = "or",
}

export interface FilterCondition {
  property: string;
  filterOperator: string;
  value: any;
}

export type FilterGroup = { and: FilterNode[] } | { or: FilterNode[] };

export type FilterNode = FilterCondition | FilterGroup;
