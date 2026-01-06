import { api } from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";
import { Sort } from "../modules/sales-crm/types/interfaces";
import { FilterNode } from "../modules/sales-crm/filter/type/filters";

interface Query {
  sorts?: Sort[];
  filter?: FilterNode | null;
}

export const getSales = async (query?: Query) => {
  const endpoint = `${ENDPOINTS.sales.list}`;
  const response = await api.post(endpoint, { sorts: query?.sorts || [], filter: query?.filter || null });
  return response || [];
};
