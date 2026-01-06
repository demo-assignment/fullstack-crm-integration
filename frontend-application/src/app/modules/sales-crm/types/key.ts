export enum SALE_KEYS {
  NONE = "none",
  COMPANY = "company",
  PRIORITY = "priority",
  TAG = "tag",
  ESTIMATED_VALUE = "estimatedValue",
  ACCOUNT_OWNER = "accountOwner",
  STATUS = "status",
  NAME = "name",
  DONE = "done",
  FOLLOW_UP_DATE = "followUpDate",
  CREATED_TIME = "createdTime",
  LAST_EDITED_TIME = "lastEditedTime",
}

export interface UserKey {
  email: string;
  id: string;
  index: number;
}
