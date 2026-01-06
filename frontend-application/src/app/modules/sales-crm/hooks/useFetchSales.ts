import { useEffect, useRef, useState } from "react";
import { getSales } from "@/app/services/sale.service";
import { Sort } from "../types/interfaces";
import { FilterNode } from "../filter/type/filters";

interface Params {
  shouldRunPolling?: boolean;
  pollingMs?: number;
}

export interface Query {
  sorts?: Sort[];
  filter?: FilterNode | null;
}

export const useFetchSales = (params?: Params) => {
  const { shouldRunPolling = false, pollingMs = 5000 } = params || {};

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [query, setQuery] = useState<Query>({});

  const timer = useRef<NodeJS.Timeout | null>(null);

  const fetchSales = async (query?: Query) => {
    try {
      const response = await getSales(query);
      setQuery(prev => ({ ...prev, ...(query || {}) }));
      setSales(response?.data || response || []);
      setLoading(false);
      setErrorMessage("");
    } catch (error: any) {
      setErrorMessage(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldRunPolling && pollingMs >= 0) {
      timer.current = setInterval(() => {
        fetchSales(query);
      }, pollingMs);
      return;
    }

    fetchSales(query);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  return { sales, loading, errorMessage, fetchSales };
};
