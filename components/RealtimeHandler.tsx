"use client";

import { useRealtimeClasses } from "@/lib/react-query/hooks/useRealtimeClasses";

export default function RealtimeHandler() {
  useRealtimeClasses();
  return null;
}
