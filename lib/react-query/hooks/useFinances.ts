import { useQuery } from "@tanstack/react-query";
import { fetchClient } from "@/lib/api-client";
import { useActiveOrgId } from "@/lib/react-query/use-active-org-id";

interface FinanceItem {
  userId: string;
  userName: string;
  planName: string;
  amount: number | null;
  processedAt: string;
}

interface PaymentMethodItem {
  method: string;
  total: number;
  count: number;
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
    byPaymentMethod: PaymentMethodItem[];
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

export const financeKeys = {
  all: (orgId: string) => ["finances", orgId] as const,
  list: (orgId: string, year: number, month: number, page: number) =>
    ["finances", orgId, year, month, page] as const,
};

export function useFinances(year: number, month: number, page: number = 1) {
  const orgId = useActiveOrgId();
  const searchParams = new URLSearchParams({
    year: String(year),
    month: String(month),
    page: String(page),
  });

  return useQuery({
    queryKey: financeKeys.list(orgId ?? "", year, month, page),
    queryFn: () =>
      fetchClient<{ success: boolean; data: FinancesResponse }>(
        `/finances?${searchParams.toString()}`
      ).then((res) => res.data),
    enabled: !!orgId,
    staleTime: 0, // siempre refrescar — los ingresos cambian al asignar planes
  });
}
