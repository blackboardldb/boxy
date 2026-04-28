import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";

interface FinanceItem {
  userId: string;
  userName: string;
  planName: string;
  amount: number | null;
  processedAt: string;
}

interface ExpenseItem {
  id: string;
  concept: string;
  amount: number;
  date: string;
}

export interface FinancesResponse {
  ingresos: {
    total: number;
    count: number;
    items: FinanceItem[];
  };
  egresos: {
    total: number;
    count: number;
    items: ExpenseItem[];
  };
  balance: number;
  page: number;
  totalPages: number;
}

export function useFinances(year: number, month: number, page: number = 1) {
  const searchParams = new URLSearchParams({
    year: String(year),
    month: String(month),
    page: String(page),
  });

  return useQuery({
    queryKey: ["finances", year, month, page],
    queryFn: () =>
      fetchClient<{ success: boolean; data: FinancesResponse }>(
        `/finances?${searchParams.toString()}`
      ).then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
