import { Dispatch, FC, SetStateAction, useMemo, useState } from "react";
import Tippy from "@tippyjs/react";
import { Query } from "../hooks/useFetchSales";
import { FILTER_OPTIONS } from "../constants/filter.const";
import { KEY_NAME_MAP } from "../constants/key.const";
import { SALE_KEYS } from "../types/key";
import { FilterCondition, FilterGroup, FilterNode, LogicalOperator } from "./type/filters";

interface FilterProps {
  loading: boolean;
  root: FilterGroup;
  setRoot: Dispatch<SetStateAction<FilterGroup>>;
  onQuery: (query?: Query) => void;
}

type FilterableKey = keyof typeof FILTER_OPTIONS;
type ValueKind = "text" | "number" | "checkbox" | "date";

const MAX_FILTER_DEPTH = process.env.NEXT_PUBLIC_MAX_FILTER_DEPTH;

const isGroup = (node: FilterNode): node is FilterGroup => {
  return typeof (node as any)?.and !== "undefined" || typeof (node as any)?.or !== "undefined";
};

const getGroupOp = (group: FilterGroup) => ("and" in group ? LogicalOperator.And : LogicalOperator.Or);
const getGroupItems = (group: FilterGroup) => ("and" in group ? group.and : group.or);

const buildGroup = (op: LogicalOperator, children: FilterNode[]): FilterGroup => {
  return op === LogicalOperator.And ? { and: children } : { or: children };
};

const getValueKind = (property: string): ValueKind => {
  if (property === SALE_KEYS.ESTIMATED_VALUE) {
    return "number";
  }

  if (property === SALE_KEYS.DONE) {
    return "checkbox";
  }

  if (property === SALE_KEYS.FOLLOW_UP_DATE) {
    return "date";
  }

  if (property === SALE_KEYS.CREATED_TIME) {
    return "date";
  }

  if (property === SALE_KEYS.LAST_EDITED_TIME) {
    return "date";
  }

  return "text";
};

const defaultValueFor = (kind: ValueKind) => {
  if (kind === "number") return 0;
  if (kind === "checkbox") return false;
  return "";
};

const createCondition = (property: FilterableKey = SALE_KEYS.NAME) => {
  const kind = getValueKind(property);
  return {
    property,
    filterOperator: FILTER_OPTIONS[property][0],
    value: defaultValueFor(kind),
  } satisfies FilterCondition;
};

const createGroup = () => ({ and: [createCondition()] } satisfies FilterGroup);

const updateNodeAtPath = (
  node: FilterNode,
  path: number[],
  pathIndex: number,
  updater: (n: FilterNode) => FilterNode,
): FilterNode => {
  if (pathIndex === path.length) return updater(node);
  if (!isGroup(node)) return node;

  const index = path[pathIndex];
  const op = getGroupOp(node);
  const children = getGroupItems(node);

  const nextChildren: FilterNode[] = children.map((child: FilterNode, i: number): FilterNode => {
    if (i !== index) return child;
    return updateNodeAtPath(child, path, pathIndex + 1, updater);
  });

  return buildGroup(op, nextChildren);
};

const Filter: FC<FilterProps> = props => {
  const { loading, root, setRoot, onQuery } = props || {};

  const [visible, setVisible] = useState(false);
  const [unsaved, setUnsaved] = useState(false);

  const maxDepth = useMemo(() => {
    const raw = Number(MAX_FILTER_DEPTH || "2");
    if (!Number.isFinite(raw) || raw <= 0) return 2;
    return Math.floor(raw);
  }, []);

  const properties = useMemo(() => Object.keys(FILTER_OPTIONS) as FilterableKey[], []);

  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  const updateAt = (path: number[], updater: (n: FilterNode) => FilterNode) => {
    setRoot(prev => updateNodeAtPath(prev, path, 0, updater) as FilterGroup);
    setUnsaved(true);
  };

  const setGroupOperator = (path: number[], op: LogicalOperator) => {
    updateAt(path, node => {
      if (!isGroup(node)) return node;
      return buildGroup(op, getGroupItems(node));
    });
  };

  const addCondition = (path: number[]) => {
    updateAt(path, node => {
      if (!isGroup(node)) return node;
      const op = getGroupOp(node);
      return buildGroup(op, [...getGroupItems(node), createCondition()]);
    });
  };

  const addGroup = (path: number[]) => {
    updateAt(path, node => {
      if (!isGroup(node)) return node;
      const op = getGroupOp(node);
      return buildGroup(op, [...getGroupItems(node), { or: [createCondition()] }]);
    });
  };

  const removeChild = (pathToParent: number[], childIndex: number) => {
    updateAt(pathToParent, node => {
      if (!isGroup(node)) return node;
      const op = getGroupOp(node);
      const next = getGroupItems(node).filter((_, i) => i !== childIndex);
      //   return buildGroup(op, next.length > 0 ? next : [createCondition()]);
      return buildGroup(op, next);
    });
  };

  const setConditionProperty = (path: number[], property: FilterableKey) => {
    updateAt(path, node => {
      if (isGroup(node)) return node;
      return createCondition(property);
    });
  };

  const setConditionOperator = (path: number[], filterOperator: string) => {
    updateAt(path, node => {
      if (isGroup(node)) return node;
      const shouldHideValue = filterOperator === "is empty" || filterOperator === "is not empty";
      return { ...node, filterOperator, value: shouldHideValue ? "" : node.value };
    });
  };

  const setConditionValue = (path: number[], value: any) => {
    updateAt(path, node => {
      if (isGroup(node)) return node;
      return { ...node, value };
    });
  };

  const query = () => {
    setVisible(false);
    setUnsaved(false);
    onQuery({ filter: root });
  };

  const clear = () => {
    setUnsaved(false);
    setRoot({ and: [] });
    onQuery({ filter: null });
  };

  const renderCondition = (node: FilterCondition, path: number[], parentPath: number[], indexInParent: number) => {
    const property = node.property as FilterableKey;
    const kind = getValueKind(property);
    const operators = FILTER_OPTIONS[property];
    const showValue = node.filterOperator !== "is empty" && node.filterOperator !== "is not empty";

    return (
      <div className="flex gap-2 items-center" key={path.join(".")}>
        <select
          className="w-full bg-white text-black px-3 py-2 rounded-md"
          value={property}
          onChange={e => setConditionProperty(path, e.target.value as FilterableKey)}
        >
          {properties.map(p => (
            <option key={p} value={p}>
              {KEY_NAME_MAP[p]}
            </option>
          ))}
        </select>

        <select
          className="w-full bg-white text-black px-3 py-2 rounded-md"
          value={node.filterOperator}
          onChange={e => setConditionOperator(path, e.target.value)}
        >
          {operators.map((op: string) => (
            <option key={op} value={op}>
              {op}
            </option>
          ))}
        </select>

        {showValue ? (
          kind === "checkbox" ? (
            <select
              className="w-full bg-white text-black px-3 py-2 rounded-md"
              value={node.value ? "true" : "false"}
              onChange={e => setConditionValue(path, e.target.value === "true")}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : (
            <input
              type={kind === "number" ? "number" : kind === "date" ? "date" : "text"}
              className="w-full bg-white text-black px-3 py-2 rounded-md"
              value={node.value ?? ""}
              onChange={e => setConditionValue(path, kind === "number" ? Number(e.target.value) : e.target.value)}
              placeholder="Value"
            />
          )
        ) : null}

        <button
          className="bg-red-500 text-white px-3 py-2 rounded-md"
          onClick={() => removeChild(parentPath, indexInParent)}
        >
          Delete
        </button>
      </div>
    );
  };

  const renderGroup = (
    node: FilterGroup,
    path: number[],
    level: number,
    parentPath: number[] | null,
    indexInParent: number | null,
  ) => {
    const op = getGroupOp(node);
    const children = getGroupItems(node);
    const isMaxDepth = level - 1 >= maxDepth;

    return (
      <div className="flex flex-col gap-2 border border-slate-200 rounded-md p-3" key={path.join(".") || "root"}>
        <div className="flex gap-2 items-center">
          <select
            className="bg-white text-black px-3 py-2 rounded-md"
            value={op}
            onChange={e => setGroupOperator(path, e.target.value as LogicalOperator)}
          >
            <option value={LogicalOperator.And}>AND</option>
            <option value={LogicalOperator.Or}>OR</option>
          </select>
          <button className="bg-blue-500 text-white px-3 py-2 rounded-md" onClick={() => addCondition(path)}>
            + Condition
          </button>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-md disabled:opacity-50"
            onClick={() => addGroup(path)}
            disabled={isMaxDepth}
          >
            + Group
          </button>
          {parentPath && typeof indexInParent === "number" ? (
            <button
              className="bg-red-500 text-white px-3 py-2 rounded-md"
              onClick={() => removeChild(parentPath, indexInParent)}
            >
              Remove group
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          {children.map((child, i) => {
            const childPath = [...path, i];
            if (isGroup(child)) return renderGroup(child, childPath, level + 1, path, i);
            return renderCondition(child, childPath, path, i);
          })}
        </div>
      </div>
    );
  };

  return (
    <Tippy
      className="min-w-[600px]"
      interactive
      placement="bottom-start"
      visible={visible}
      onClickOutside={hide}
      content={
        <div className="text-white rounded-md flex flex-col gap-2">
          {renderGroup(root, [], 1, null, null)}
          <div className="flex gap-2">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={clear}
              disabled={loading}
            >
              Clear
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
              onClick={query}
              disabled={loading}
            >
              Query
            </button>
          </div>
        </div>
      }
    >
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded-md disabled:opacity-50"
        onClick={visible ? hide : show}
      >
        Filter {unsaved ? "*" : ""}
      </button>
    </Tippy>
  );
};

export default Filter;
