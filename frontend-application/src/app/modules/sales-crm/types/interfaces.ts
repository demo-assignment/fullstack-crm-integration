export enum SortDirection {
  ASC = "ascending",
  DESC = "descending",
}

export interface Sort {
  property: string;
  direction: SortDirection;
}
