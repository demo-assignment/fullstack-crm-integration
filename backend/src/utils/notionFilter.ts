type FilterGroup = { and: FilterNode[] } | { or: FilterNode[] };
type FilterCondition = { property: string; filterOperator: string; value?: any };
export type FilterNode = FilterGroup | FilterCondition;

const isGroup = (node: FilterNode): node is FilterGroup => {
  return typeof (node as any)?.and !== "undefined" || typeof (node as any)?.or !== "undefined";
};

const PROPERTY_NAME: Record<string, string> = {
  name: "Name",
  company: "Company",
  status: "Status",
  priority: "Priority",
  estimatedValue: "Estimated value",
  tag: "Tag",
  done: "Done",
  followUpDate: "Follow Up Date",
  accountOwner: "Account owner",
};

type NotionPropType = "title" | "rich_text" | "status" | "select" | "number" | "multi_select" | "checkbox" | "date" | "timestamp";

const PROPERTY_TYPE: Record<string, NotionPropType> = {
  name: "title",
  company: "rich_text",
  status: "status",
  priority: "select",
  estimatedValue: "number",
  tag: "multi_select",
  done: "checkbox",
  followUpDate: "date",
  createdTime: "timestamp",
  lastEditedTime: "timestamp",
};

const textOperator = (op: string, value: any) => {
  if (op === "is") return { equals: String(value ?? "") };
  if (op === "is not") return { does_not_equal: String(value ?? "") };
  if (op === "contains") return { contains: String(value ?? "") };
  if (op === "does not contain") return { does_not_contain: String(value ?? "") };
  if (op === "starts with") return { starts_with: String(value ?? "") };
  if (op === "ends with") return { ends_with: String(value ?? "") };
  if (op === "is empty") return { is_empty: true };
  if (op === "is not empty") return { is_not_empty: true };
  return null;
};

const selectOperator = (op: string, value: any) => {
  if (op === "is") return { equals: String(value ?? "") };
  if (op === "is not") return { does_not_equal: String(value ?? "") };
  if (op === "is empty") return { is_empty: true };
  if (op === "is not empty") return { is_not_empty: true };
  return null;
};

const numberOperator = (op: string, value: any) => {
  const v = typeof value === "number" ? value : Number(value);
  if (op === "is empty") return { is_empty: true };
  if (op === "is not empty") return { is_not_empty: true };
  if (!Number.isFinite(v)) return null;
  if (op === "=") return { equals: v };
  if (op === "!=") return { does_not_equal: v };
  if (op === "<") return { less_than: v };
  if (op === ">") return { greater_than: v };
  if (op === "<=") return { less_than_or_equal_to: v };
  if (op === ">=") return { greater_than_or_equal_to: v };
  return null;
};

const checkboxOperator = (op: string, value: any) => {
  const v = !!value;
  if (op === "is") return { equals: v };
  if (op === "is not") return { does_not_equal: v };
  return null;
};

const dateOperator = (op: string, value: any) => {
  if (op === "is empty") return { is_empty: true };
  if (op === "is not empty") return { is_not_empty: true };
  const v = String(value ?? "");
  if (!v) return null;
  if (op === "is") return { equals: v };
  if (op === "is before") return { before: v };
  if (op === "is after") return { after: v };
  if (op === "is on or before") return { on_or_before: v };
  if (op === "is on or after") return { on_or_after: v };
  return null;
};

const timestampFilter = (propertyKey: string, op: string, value: any) => {
  const ts = propertyKey === "createdTime" ? "created_time" : propertyKey === "lastEditedTime" ? "last_edited_time" : null;
  if (!ts) return null;
  const clause = dateOperator(op, value);
  if (!clause) return null;
  return { timestamp: ts, [ts]: clause };
};

export const isEmptyGroup = (node: any) => {
  if (!node) return true;
  if (isGroup(node)) {
    const children = "and" in node ? node.and : node.or;
    return !children || children.length === 0;
  }
  return false;
};

export const toNotionFilter = (node: FilterNode): any => {
  if (isGroup(node)) {
    const children = "and" in node ? node.and : node.or;
    const key = "and" in node ? "and" : "or";
    const mapped = (children || []).map(child => toNotionFilter(child)).filter(Boolean);
    return { [key]: mapped };
  }

  const propertyKey = node.property;
  const propType = PROPERTY_TYPE[propertyKey];
  if (!propType) throw new Error(`Unsupported filter property: ${propertyKey}`);

  if (propType === "timestamp") {
    const f = timestampFilter(propertyKey, node.filterOperator, node.value);
    if (!f) throw new Error(`Unsupported timestamp operator: ${node.filterOperator}`);
    return f;
  }

  const property = PROPERTY_NAME[propertyKey];
  if (!property) throw new Error(`Unsupported filter property mapping: ${propertyKey}`);

  if (propType === "title") {
    const clause = textOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported title operator: ${node.filterOperator}`);
    return { property, title: clause };
  }

  if (propType === "rich_text") {
    const clause = textOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported rich_text operator: ${node.filterOperator}`);
    return { property, rich_text: clause };
  }

  if (propType === "status") {
    const clause = selectOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported status operator: ${node.filterOperator}`);
    return { property, status: clause };
  }

  if (propType === "select") {
    const clause = selectOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported select operator: ${node.filterOperator}`);
    return { property, select: clause };
  }

  if (propType === "number") {
    const clause = numberOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported number operator: ${node.filterOperator}`);
    return { property, number: clause };
  }

  if (propType === "multi_select") {
    const clause =
      node.filterOperator === "contains"
        ? { contains: String(node.value ?? "") }
        : node.filterOperator === "does not contain"
          ? { does_not_contain: String(node.value ?? "") }
          : node.filterOperator === "is empty"
            ? { is_empty: true }
            : node.filterOperator === "is not empty"
              ? { is_not_empty: true }
              : null;
    if (!clause) throw new Error(`Unsupported multi_select operator: ${node.filterOperator}`);
    return { property, multi_select: clause };
  }

  if (propType === "checkbox") {
    const clause = checkboxOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported checkbox operator: ${node.filterOperator}`);
    return { property, checkbox: clause };
  }

  if (propType === "date") {
    const clause = dateOperator(node.filterOperator, node.value);
    if (!clause) throw new Error(`Unsupported date operator: ${node.filterOperator}`);
    return { property, date: clause };
  }

  throw new Error(`Unsupported property type: ${propType}`);
};
