import { MRT_ColumnDef } from "mantine-react-table";
import { SALE_KEYS } from "../types/key";
import { KEY_NAME_MAP } from "./key.const";
import { getOriginalData } from "../utils/getOriginalData";
import { NOTION_COLOR_SYSTEM } from "./color.const";
import Avvvatars from "avvvatars-react";
import { getUserKey } from "../utils/getUserKey";
import { parseDate } from "../utils/parseDate";

const nameKey = SALE_KEYS.NAME;
const companyKey = SALE_KEYS.COMPANY;
const priorityKey = SALE_KEYS.PRIORITY;
const estimatedValueKey = SALE_KEYS.ESTIMATED_VALUE;
const accountOwnerKey = SALE_KEYS.ACCOUNT_OWNER;
const statusKey = SALE_KEYS.STATUS;
const tagKey = SALE_KEYS.TAG;
const doneKey = SALE_KEYS.DONE;
const followUpDateKey = SALE_KEYS.FOLLOW_UP_DATE;
const createdTimeKey = SALE_KEYS.CREATED_TIME;
const lastEditedTimeKey = SALE_KEYS.LAST_EDITED_TIME;

export const SALE_TABLE_COLUMNS: MRT_ColumnDef[] = [
  {
    accessorKey: nameKey,
    header: KEY_NAME_MAP[nameKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, nameKey);
      const { plainValue } = originalData || {};
      return (
        <div className="flex gap-2 items-center">
          <img src="/static/images/doc.png" alt="doc" className="w-4 h-4" />
          <div>{plainValue}</div>
        </div>
      );
    },
  },
  {
    accessorKey: companyKey,
    header: KEY_NAME_MAP[companyKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, companyKey);
      const { plainValue } = originalData || {};
      return <div>{plainValue}</div>;
    },
  },
  {
    accessorKey: statusKey,
    header: KEY_NAME_MAP[statusKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, statusKey);
      const { plainValue, status } = originalData || {};
      const { color } = status || {};
      const colorHex = NOTION_COLOR_SYSTEM[color];
      return (
        <div style={{ backgroundColor: `${colorHex}` }} className={`px-3 py-1 w-fit rounded-lg`}>
          {plainValue}
        </div>
      );
    },
  },
  {
    accessorKey: priorityKey,
    header: KEY_NAME_MAP[priorityKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, priorityKey);
      const { plainValue, select } = originalData || {};
      const { color } = select || {};
      const colorHex = NOTION_COLOR_SYSTEM[color];
      return (
        <div style={{ backgroundColor: `${colorHex}` }} className={`px-3 py-1 w-fit rounded-lg`}>
          {plainValue}
        </div>
      );
    },
  },
  {
    accessorKey: tagKey,
    header: KEY_NAME_MAP[tagKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, tagKey);
      const { plainValue, multi_select } = originalData || {};
      const checkData = multi_select || plainValue || [];
      return (
        <div className="flex gap-2">
          {checkData.map((item: { color: string; name: string }) => {
            const { color, name } = item || {};
            const colorHex = NOTION_COLOR_SYSTEM[color];
            return (
              <div style={{ backgroundColor: `${colorHex}` }} className={`px-3 py-1 w-fit rounded-lg`}>
                {name}
              </div>
            );
          })}
        </div>
      );
    },
  },
  {
    accessorKey: estimatedValueKey,
    header: KEY_NAME_MAP[estimatedValueKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, estimatedValueKey);
      const { plainValue } = originalData || {};
      return <div>${plainValue}</div>;
    },
  },
  {
    accessorKey: accountOwnerKey,
    header: KEY_NAME_MAP[accountOwnerKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const { index } = row || {};
      const originalData = getOriginalData(row, accountOwnerKey);
      const { plainValue, people } = originalData || {};
      const { person, id, name } = people?.[0] || {};
      const { email } = person || {};
      return (
        <div className="flex gap-2 items-center">
          <Avvvatars value={getUserKey({ email, id, index })} style="shape" size={32} />
          <div>{name || plainValue}</div>
        </div>
      );
    },
  },
  {
    accessorKey: doneKey,
    header: KEY_NAME_MAP[doneKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, doneKey);
      const { plainValue = false, checkbox = false } = originalData || {};
      const boolVal = plainValue || checkbox || false;
      return <input type="checkbox" checked={boolVal} readOnly />;
    },
  },
  {
    accessorKey: followUpDateKey,
    header: KEY_NAME_MAP[followUpDateKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, followUpDateKey);
      const { date, plainValue } = originalData || {};
      const dateVal = date || plainValue;
      const { start } = dateVal || {};
      const formattedStartDate = parseDate(start);
      return <div>{formattedStartDate}</div>;
    },
  },
  {
    accessorKey: createdTimeKey,
    header: KEY_NAME_MAP[createdTimeKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, createdTimeKey);
      const { plainValue, created_time } = originalData || {};
      const createdTimeVal = created_time || plainValue;
      const formattedCreatedDate = parseDate(createdTimeVal);
      return <div>{formattedCreatedDate}</div>;
    },
  },
  {
    accessorKey: lastEditedTimeKey,
    header: KEY_NAME_MAP[lastEditedTimeKey],
    enableSorting: false,
    Cell: cellProps => {
      const { row } = cellProps || {};
      const originalData = getOriginalData(row, lastEditedTimeKey);
      const { plainValue, last_edited_time } = originalData || {};
      const lastEditedTimeVal = last_edited_time || plainValue;
      const formattedLastEditedDate = parseDate(lastEditedTimeVal);
      return <div>{formattedLastEditedDate}</div>;
    },
  },
];
