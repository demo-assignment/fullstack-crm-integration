type FilterGroup = { and: FilterNode[] } | { or: FilterNode[] };
type FilterCondition = { property: string; filterOperator: string; value?: any };
export type FilterNode = FilterGroup | FilterCondition;

const isGroup = (node: FilterNode): node is FilterGroup => {
  return typeof (node as any)?.and !== "undefined" || typeof (node as any)?.or !== "undefined";
};

export const validateCompoundFilterDepth = (node: FilterNode, maxDepth: number) => {
  const walk = (n: FilterNode, depth: number) => {
    if (!isGroup(n)) return;
    if (depth > maxDepth) throw new Error(`Filter nesting exceeds max depth ${maxDepth}`);
    const children = "and" in n ? n.and : n.or;
    for (const child of children) walk(child, depth + 1);
  };
  walk(node, 1);
};

const normalizeString = (value: any) => {
  return (value ?? "").toString().toLowerCase();
};

const getValueForCompare = (cell: any) => {
  if (!cell) return { type: "unknown", value: undefined };
  if (cell.type === "number") return { type: "number", value: typeof cell.number === "number" ? cell.number : undefined };
  if (cell.type === "checkbox") return { type: "checkbox", value: !!cell.checkbox };
  if (cell.type === "date") return { type: "date", value: cell.date?.start || null };
  if (cell.type === "created_time") return { type: "date", value: cell.created_time || null };
  if (cell.type === "last_edited_time") return { type: "date", value: cell.last_edited_time || null };
  if (cell.type === "multi_select") return { type: "multi_select", value: Array.isArray(cell.multi_select) ? cell.multi_select : [] };
  return { type: "string", value: cell.plainValue ?? "" };
};

const isEmptyValue = (type: string, value: any) => {
  if (value === null || typeof value === "undefined") return true;
  if (type === "string") return normalizeString(value).length === 0;
  if (type === "multi_select") return Array.isArray(value) ? value.length === 0 : true;
  if (type === "date") return !value;
  return false;
};

const toTime = (value: any) => {
  if (!value) return NaN;
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : NaN;
};

export const matchesCondition = (row: Record<string, any>, condition: FilterCondition) => {
  const cell = row?.[condition.property];
  const { type, value } = getValueForCompare(cell);
  const op = condition.filterOperator;

  if (op === "is empty") return isEmptyValue(type, value);
  if (op === "is not empty") return !isEmptyValue(type, value);

  if (type === "number") {
    const left = typeof value === "number" ? value : NaN;
    const right = typeof condition.value === "number" ? condition.value : Number(condition.value);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (op === "=") return left === right;
    if (op === "!=") return left !== right;
    if (op === "<") return left < right;
    if (op === ">") return left > right;
    if (op === "<=") return left <= right;
    if (op === ">=") return left >= right;
    return false;
  }

  if (type === "checkbox") {
    const left = !!value;
    const right = !!condition.value;
    if (op === "is") return left === right;
    if (op === "is not") return left !== right;
    return false;
  }

  if (type === "multi_select") {
    const names = (Array.isArray(value) ? value : []).map((x: any) => normalizeString(x?.name ?? x));
    const needle = normalizeString(condition.value);
    if (op === "contains") return names.some(n => n.includes(needle));
    if (op === "does not contain") return !names.some(n => n.includes(needle));
    return false;
  }

  if (type === "date") {
    const left = toTime(value);
    const right = toTime(condition.value);
    if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
    if (op === "is") return left === right;
    if (op === "is before") return left < right;
    if (op === "is after") return left > right;
    if (op === "is on or before") return left <= right;
    if (op === "is on or after") return left >= right;
    return false;
  }

  const left = normalizeString(value);
  const right = normalizeString(condition.value);
  if (op === "is") return left === right;
  if (op === "is not") return left !== right;
  if (op === "contains") return left.includes(right);
  if (op === "does not contain") return !left.includes(right);
  if (op === "starts with") return left.startsWith(right);
  if (op === "ends with") return left.endsWith(right);
  return false;
};

export const matchesCompoundFilter = (row: Record<string, any>, node: FilterNode): boolean => {
  if (!isGroup(node)) return matchesCondition(row, node);
  const children = "and" in node ? node.and : node.or;
  if ("and" in node) return children.every(child => matchesCompoundFilter(row, child));
  return children.some(child => matchesCompoundFilter(row, child));
};

export const applyCompoundFilter = (rows: Record<string, any>[], node: FilterNode) => {
  return (rows || []).filter(row => matchesCompoundFilter(row, node));
};
