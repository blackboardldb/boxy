"use client";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export function useActiveOrgId(): string | undefined {
  const { currentUser } = useCurrentUser();
  return currentUser?.organizationId;
}
