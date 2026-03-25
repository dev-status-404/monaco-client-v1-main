"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Ban,
  Wallet,
  UserRound,
  Mail,
  IdCard,
  Shield,
  Calendar,
  Save,
} from "lucide-react";

// ✅ replace path with your real hook
import { useUpdateUser } from "@/hooks/user/";
import { queryClient } from "@/providers/react-query";

type UserRow = {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  createdAt?: string;

  // your backend might use: isBlocked OR blocked OR status
  isBlocked?: boolean;
  blocked?: boolean;
  status?: string;
};

type Props = {
  row: UserRow | null;

  // optional balance getter (separate endpoint)
  onFetchBalance?: (
    userId: string,
  ) => Promise<{ balance: number; currency?: string }>;

  // these are provided by GlobalDataTable render modal
  onClose?: () => void;
  onSuccess?: () => void;
};

export function UserActionsForm({
  row,
  onFetchBalance,
  onClose,
  onSuccess,
}: Props) {
  const { mutateAsync: updateUser, isPending } = useUpdateUser();

  const [loadingBalance, setLoadingBalance] = useState(false);
  const [balance, setBalance] = useState<{
    balance: number;
    currency?: string;
  } | null>(null);

  // editable form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");

  const [blocked, setBlocked] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // init on open / row change
  useEffect(() => {
    setEmail(row?.email ?? "");
    setFirstName(row?.firstName ?? "");
    setLastName(row?.lastName ?? "");
    setRole(row?.role ?? "user");
    setBlocked(row?.blocked ?? false);
    setBalance(null);
    setErr(null);
  }, [row?.id]);

  const fullName = useMemo(() => {
    const fn = (firstName ?? "").trim();
    const ln = (lastName ?? "").trim();
    return `${fn} ${ln}`.trim() || "—";
  }, [firstName, lastName]);

  const created = row?.createdAt
    ? new Date(row.createdAt).toLocaleString()
    : "—";

  // ✅ SINGLE place to map payload for your backend
  const buildUpdatePayload = (patch: Partial<UserRow>) => {
    // common patterns:
    // A) { id, ...patch }
    // B) { userId: id, ...patch }
    // C) { id, data: patch }
    return {
      id: row?.id,
      ...patch,
    };
  };

  const handleSaveDetails = async () => {
    if (!row?.id) return;
    setErr(null);

    try {
      await updateUser(
        buildUpdatePayload({
          email,
          firstName,
          lastName,
          role,
        }),
      );

      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["users", "dashboard"] });
    } catch (e: any) {
      setErr(e?.message ?? "Failed to update user.");
    }
  };

  const handleToggleBlock = async (next: boolean) => {
    if (!row?.id) return;
    setErr(null);
    setBlocked(next); // optimistic UI

    try {
      // map it to whatever your backend expects:
      // - isBlocked: boolean
      // - blocked: boolean
      // - status: "blocked" | "active"
      await updateUser(
        buildUpdatePayload({
          blocked: next,
          // OR: blocked: next,
          // OR: status: next ? "blocked" : "active",
        }),
      );

      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["users", "dashboard"] });
    } catch (e: any) {
      setBlocked((prev) => !prev); // rollback
      setErr(e?.message ?? "Failed to update block status.");
    }
  };

  const handleFetchBalance = async () => {
    if (!row?.id || !onFetchBalance) return;
    setLoadingBalance(true);
    try {
      const b = await onFetchBalance(row.id);
      setBalance(b);
    } finally {
      setLoadingBalance(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-base font-semibold flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {fullName}
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
            <Mail className="h-4 w-4" />
            {email || "—"}
          </div>
        </div>

        <Badge
          variant={blocked ? "destructive" : "secondary"}
          className="rounded-xl"
        >
          {blocked ? "Blocked" : "Active"}
        </Badge>
      </div>

      {err && (
        <Alert>
          <AlertDescription>{err}</AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Editable fields */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@email.com"
          />
        </div>

        <div className="space-y-1">
          <Label>Role</Label>
          <Input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="user / admin"
          />
        </div>

        <div className="space-y-1">
          <Label>First Name</Label>
          <Input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
          />
        </div>

        <div className="space-y-1">
          <Label>Last Name</Label>
          <Input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Close
        </Button>
        <Button onClick={handleSaveDetails} disabled={isPending || !row?.id}>
          <Save className="mr-2 h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      <Separator />

      {/* Read-only details */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <IdCard className="h-3.5 w-3.5" /> User ID
          </div>
          <div className="mt-1 text-xs font-medium break-all">
            {row?.id ?? "—"}
          </div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" /> Role
          </div>
          <div className="mt-1 text-sm font-semibold">{role || "—"}</div>
        </div>

        <div className="rounded-xl border p-3 col-span-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> Created At
          </div>
          <div className="mt-1 text-sm font-semibold">{created}</div>
        </div>
      </div>

      {/* Balance */}
      <div className="rounded-2xl border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Wallet Balance
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFetchBalance}
            disabled={loadingBalance || !onFetchBalance}
          >
            {loadingBalance ? "Loading..." : "View Balance"}
          </Button>
        </div>

        <div className="text-sm">
          {balance ? (
            <div className="font-semibold">
              {balance.balance} {balance.currency ?? ""}
            </div>
          ) : (
            <div className="text-muted-foreground">No balance loaded.</div>
          )}
        </div>
      </div>

      {/* Block user */}
      <div className="rounded-2xl border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Block User
          </div>

          <div className="flex items-center gap-3">
            <Label className="text-sm text-muted-foreground">
              {blocked ? "Blocked" : "Not blocked"}
            </Label>
            <Switch
              checked={blocked}
              onCheckedChange={handleToggleBlock}
              disabled={isPending || !row?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
