"use client";

import { MantineReactTable as TableComponent, useMantineReactTable, type MRT_ColumnDef } from "mantine-react-table";
import { useCheckClient } from "@/app/hooks/useCheckClient";
import WillRender from "../will-render/WillRender";

interface TableProps {
  columns: MRT_ColumnDef[];
  data: any;
  loading: boolean;
  errorMessage?: string;
}

const Table = (props: TableProps) => {
  const { columns, data, loading = false, errorMessage } = props;

  const { isClient } = useCheckClient();

  const table = useMantineReactTable({
    columns,
    data: data || [],
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enablePagination: true,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 20,
      },
    },
  });

  if (!isClient) {
    return <div>Parsing UI...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      <WillRender when={!!errorMessage}>
        <div>{errorMessage || "No data found! Please try again later."}</div>
      </WillRender>
      <TableComponent table={table} />
    </div>
  );
};

export default Table;
