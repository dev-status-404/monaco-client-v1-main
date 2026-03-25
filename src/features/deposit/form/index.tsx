"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, Wallet, CalendarDays, Gamepad2, UserRound } from "lucide-react";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";

// ✅ your global-table type
import type { RenderFormProps } from "@/components/common/global-table";

// ✅ your existing hooks (adjust path if needed)
import { useDepositActions } from "@/hooks/deposit";
import { queryClient } from "@/providers/react-query";

type DepositRow = {
  id: string;
  amount: string;
  status: string;
  currency?: string;
  provider?: string;
  createdAt?: string;

  game_id?: string;
  game_name?: string;
  game?: { id: string; name: string };

  user_id?: string;
  user?: { id: string; email?: string; firstName?: string; lastName?: string };
};

type DepositStatus =
  | "pending"
  | "initiated"
  | "processing"
  | "confirmed"
  | "completed"
  | "failed";

const STATUS_OPTIONS: { value: DepositStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "initiated", label: "Initiated" },
  { value: "processing", label: "Processing" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

const safeText = (v: any) => String(v ?? "").trim();

function formatMoney(amount: string, currency = "USD") {
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export function DepositActionsForm(
  props: RenderFormProps<DepositRow> & {
    /** if you want to hide status controls in some contexts */
    allowStatusEdit?: boolean;

    /** if you want to hide editable fields (read-only modal) */
    readOnly?: boolean;
  },
) {
  const {
    mode,
    row,
    onClose,
    onSuccess,
    allowStatusEdit = true,
    readOnly = false,
  } = props;

  const depositActions = useDepositActions();

  // You likely have these inside your hook. If names differ, just map them:
  const createDeposit = (depositActions as any).createDeposit;
  const updateDeposit =
    (depositActions as any).updateDeposit ??
    (depositActions as any).editDeposit;

  const isSubmitting: boolean =
    (depositActions as any).isPending ??
    (depositActions as any).isLoading ??
    (createDeposit as any)?.isPending ??
    (createDeposit as any)?.isLoading ??
    (updateDeposit as any)?.isPending ??
    (updateDeposit as any)?.isLoading ??
    false;

  const [err, setErr] = useState<string | null>(null);

  // editable state
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [provider, setProvider] = useState("Stripe");
  const [status, setStatus] = useState<DepositStatus>("pending");

  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");

  // hydrate from row
  useEffect(() => {
    setErr(null);

    const r = row ?? null;

    setAmount(safeText(r?.amount) || "");
    setCurrency(safeText(r?.currency) || "USD");
    setProvider(safeText(r?.provider) || "Stripe");

    const st = safeText(r?.status).toLowerCase() as DepositStatus;
    setStatus(
      (STATUS_OPTIONS.some((x) => x.value === st)
        ? st
        : "pending") as DepositStatus,
    );

    setGameId(safeText(r?.game_id) || safeText(r?.game?.id) || "");
    setGameName(safeText(r?.game_name) || safeText(r?.game?.name) || "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id, mode]);

  const userLabel = useMemo(() => {
    const u = row?.user;
    if (!u) return row?.user_id ?? "—";
    const fn = safeText(u.firstName);
    const ln = safeText(u.lastName);
    const name = `${fn} ${ln}`.trim();
    return name || u.email || u.id || "—";
  }, [row?.user, row?.user_id]);

  const createdLabel = useMemo(() => {
    if (!row?.createdAt) return "—";
    try {
      return new Date(row.createdAt).toLocaleString();
    } catch {
      return String(row.createdAt);
    }
  }, [row?.createdAt]);

  const canEdit = !readOnly;

  const validate = () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return "Enter a valid amount.";
    if (!gameId) return "Select a game.";
    if (!currency.trim()) return "Currency is required.";
    if (!provider.trim()) return "Provider is required.";
    return null;
  };

  const handleSave = async () => {
    setErr(null);

    if (mode === "add") {
      const msg = validate();
      if (msg) {
        setErr(msg);
        return;
      }

      if (!createDeposit) {
        setErr("createDeposit action is missing in useDepositActions().");
        return;
      }

      try {
        await createDeposit(
          {
            // if your backend needs user_id, pass it here (or add a user selector)
            user_id: row?.user_id ?? row?.user?.id, // may be undefined on add if you don’t set it
            amount,
            currency,
            provider,
            game_id: gameId,
            game_name: gameName,
            status,
          },
          {
            onSuccess: (data: any) => {
              queryClient.invalidateQueries({ queryKey: ["deposits"] });
            },
            onError: (e: any) => {
              setErr(
                e?.response?.data?.message || e?.message || "Create failed",
              );
            },
          },
        );
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || "Create failed");
      }
      return;
    }

    // edit/custom
    if (!row?.id) {
      setErr("Missing deposit id.");
      return;
    }

    if (!updateDeposit) {
      setErr("updateDeposit action is missing in useDepositActions().");
      return;
    }

    // allow admin to only change status if you want
    const payload: any = {
      id: row.id,
    };

    if (canEdit) {
      // let admin update these too (optional)
      payload.id = row.id;
      payload.amount = amount;
      payload.currency = currency;
      payload.provider = provider;
      payload.game_id = gameId;
      payload.game_name = gameName;
    }

    if (allowStatusEdit) payload.status = status;

    try {
      await updateDeposit(payload, {
        onSuccess: (data: any) => {
          console.log(data);

          onSuccess();
        },
        onError: (e: any) => {
          console.log(e);
          setErr(e?.response?.data?.message || e?.message || "Update failed");
        },
      });
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* quick header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Deposit {row?.id ? `#${String(row.id).slice(0, 8)}` : ""}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {userLabel}
          </div>
        </div>

        <Badge variant="secondary" className="rounded-xl">
          {status}
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
        <div className="space-y-1 col-span-2">
          <Label className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" /> Game
          </Label>
          <GamesSelect
            value={gameId}
            disabled={!canEdit || isSubmitting}
            onChange={(g: GameOption | null) => {
              setGameId(g?.id ?? "");
              setGameName(g?.name ?? "");
            }}
          />
        </div>

        <div className="space-y-1">
          <Label>Amount</Label>
          <Input
            value={amount}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50.00"
          />
          <div className="text-[11px] text-muted-foreground">
            Preview: {formatMoney(amount || "0", currency)}
          </div>
        </div>

        <div className="space-y-1">
          <Label>Currency</Label>
          <Input
            value={currency}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="USD"
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label>Provider</Label>
          <Input
            value={provider}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="Stripe"
          />
        </div>

        {/* ✅ Admin status change */}
        {allowStatusEdit && (
          <div className="space-y-1 col-span-2">
            <Label>Status</Label>
            <select
              value={status}
              disabled={isSubmitting}
              onChange={(e) => setStatus(e.target.value as DepositStatus)}
              className="h-10 w-full rounded-2xl border border-border !bg-card px-3 text-sm outline-none"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Separator />

      {/* Read-only meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/5  p-3 col-span-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" /> Created At
          </div>
          <div className="mt-1 text-sm font-semibold">{createdLabel}</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>

        <Button onClick={handleSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : mode === "add" ? "Create" : "Save"}
        </Button>
      </div>
    </div>
  );
}
