"use client";

import Table from "@/app/components/table/Table";
import { FC, useState } from "react";
import { SALE_TABLE_COLUMNS } from "./constants/columns.const";
import { Query, useFetchSales } from "@/app/modules/sales-crm/hooks/useFetchSales";
import "tippy.js/dist/tippy.css";
import { Sort } from "./types/interfaces";
import SortComponent from "./sort/Sort";
import FilterComponent from "./filter/Filter";
import { FilterGroup } from "./filter/type/filters";

const SalesCRM: FC = () => {
  const { sales, loading, errorMessage, fetchSales } = useFetchSales();
  const [sorts, setSorts] = useState<Sort[]>([]);
  const [filters, setFilters] = useState<FilterGroup>({ and: [] });

  const onQuerySort = (query?: Query) => {
    fetchSales({ ...query, filter: filters });
  };

  const onQueryFilter = (query?: Query) => {
    fetchSales({ ...query, sorts });
  };

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">👟 Sales CRM</h1>
      <div className="flex gap-2 items-center mb-4">
        <SortComponent loading={loading} sorts={sorts} fetchSales={onQuerySort} setSorts={setSorts} />
        <FilterComponent loading={loading} root={filters} setRoot={setFilters} onQuery={onQueryFilter} />
      </div>
      <Table columns={SALE_TABLE_COLUMNS} data={sales} loading={loading} errorMessage={errorMessage} />
    </div>
  );
};

export default SalesCRM;
