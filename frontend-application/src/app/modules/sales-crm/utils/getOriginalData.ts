import { MRT_Row } from "mantine-react-table";

export const getOriginalData = (row: MRT_Row | any, key: string) => {
  return row.original[key];
};
