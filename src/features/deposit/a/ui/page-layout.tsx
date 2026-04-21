"use client";

import { useParams } from "next/navigation";
import UserDepositLayout from "@/features/deposit/u/ui/page-layout";

export default function AdminDepositLayout() {
  const params = useParams();
  const userId = typeof params?.id === "string" ? params.id : undefined;
  return <UserDepositLayout userId={userId} />;
}
