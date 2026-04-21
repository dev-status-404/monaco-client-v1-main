"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  CalendarDays,
  CreditCard,
  Wallet,
  Gamepad2,
  UserRound,
  Shield,
} from "lucide-react";

import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";
import type { RenderFormProps } from "@/components/common/global-table";
import { useWithdrawlActions } from "@/hooks/withdrawls";
import { useUserInfo } from "@/helpers/use-user";
import { Spinner } from "@/components/ui/spinner";

type PaymentMethod = "coin-flow" | "manual" | "paypal" | "bank";

type RedeemRow = {
  id: string;
  amount: string;
  currency?: string;
  method?: string;
  destination?: string;

  status: string;
  admin_note?: string | null;

  createdAt: string;
  updatedAt?: string;

  game_id?: string;
  game_name?: string;
  game?: { id: string; name: string };

  user?: { id: string; email: string; firstName?: string; lastName?: string };
  reviewed_by_admin_id?: string | null;
  reviewedByAdmin?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  } | null;
};

type RedeemStatus =
  | "requested"
  | "pending"
  | "processing"
  | "approved"
  | "paid"
  | "completed"
  | "confirmed"
  | "rejected"
  | "failed";

const STATUS_OPTIONS: { value: RedeemStatus; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
  { value: "failed", label: "Failed" },
];

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "coin-flow", label: "Coin-Flow" },
  { value: "manual", label: "Manual" },
  { value: "paypal", label: "PayPal" },
  { value: "bank", label: "Bank Transfer" },
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

export function WithdrawlActionsForm(
  props: RenderFormProps<RedeemRow> & {
    /** default: true (admin can update status + note) */
    allowStatusEdit?: boolean;

    /** lock everything except status/note if you want */
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

  const actions = useWithdrawlActions();
  const { id } = useUserInfo();
  // Map to whatever your hook exports
  const updateWithdrawl =
    (actions as any).updateWithdrawl ??
    (actions as any).updateWithdrawal ??
    (actions as any).editWithdrawl ??
    (actions as any).editWithdrawal;

  const isSubmitting: boolean =
    (actions as any).isPending ??
    (actions as any).isLoading ??
    (updateWithdrawl as any)?.isPending ??
    (updateWithdrawl as any)?.isLoading ??
    false;

  const [err, setErr] = useState<string | null>(null);

  // editable fields (admin)
  const [status, setStatus] = useState<RedeemStatus>("requested");
  const [adminNote, setAdminNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // optional editable fields (only if you want)
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [method, setMethod] = useState<PaymentMethod>("manual");
  const [destination, setDestination] = useState("");
  const [gameId, setGameId] = useState("");
  const [gameName, setGameName] = useState("");

  useEffect(() => {
    setErr(null);

    const r = row ?? null;

    const st = safeText(r?.status).toLowerCase() as RedeemStatus;
    setStatus(
      (STATUS_OPTIONS.some((x) => x.value === st)
        ? st
        : "requested") as RedeemStatus,
    );

    setAdminNote(safeText(r?.admin_note) || "");

    setAmount(safeText(r?.amount) || "");
    setCurrency(safeText(r?.currency) || "USD");

    const m = safeText(r?.method).toLowerCase() as PaymentMethod;
    setMethod(
      (METHOD_OPTIONS.some((x) => x.value === m)
        ? m
        : "manual") as PaymentMethod,
    );

    setDestination(safeText((r as any)?.destination) || safeText((r as any)?.address) || "");

    setGameId(safeText(r?.game_id) || safeText(r?.game?.id) || "");
    setGameName(safeText(r?.game_name) || safeText(r?.game?.name) || "");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.id, mode]);

  const userLabel = useMemo(() => {
    const u = row?.user;
    if (!u) return "—";
    const name = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
    return name || u.email || u.id || "—";
  }, [row?.user]);

  const reviewerLabel = useMemo(() => {
    const a = row?.reviewedByAdmin;
    if (!a) return "-";
    const name = [a.firstName, a.lastName].filter(Boolean).join(" ").trim();
    return name || a.email || a.id || "-";
  }, [row?.reviewedByAdmin]);

  const createdLabel = useMemo(() => {
    if (!row?.createdAt) return "—";
    try {
      return new Date(row.createdAt).toLocaleString();
    } catch {
      return String(row.createdAt);
    }
  }, [row?.createdAt]);

  const updatedLabel = useMemo(() => {
    if (!row?.updatedAt) return "—";
    try {
      return new Date(row.updatedAt).toLocaleString();
    } catch {
      return String(row.updatedAt);
    }
  }, [row?.updatedAt]);

  const canEdit = !readOnly;

  const handleSave = async () => {
    setErr(null);

    if (!row?.id) {
      setErr("Missing withdrawal id.");
      return;
    }

    if (!updateWithdrawl) {
      setErr("updateWithdrawl action is missing in useWithdrawlActions().");
      return;
    }

    // ✅ payload: keep minimal (status + note) unless you want to allow more edits
    const payload: any = { id: row.id };

    if (allowStatusEdit) payload.status = status;
    payload.admin_note = adminNote;
    payload.reviewed_by_admin_id = id || ""; // or set to current admin id if you have that context
    payload.destination = destination;

    // optional editable fields (only if readOnly === false)
    if (canEdit) {
      payload.amount = amount;
      payload.currency = currency;
      payload.method = method;
      payload.destination = destination;
      payload.game_id = gameId;
      payload.game_name = gameName;
      payload.reviewed_by_admin_id = id || ""; // or set to current admin id if you have that context
    }

    try {
      await updateWithdrawl(payload, {
        onSuccess: () => {
          onSuccess();
        },
        onError: (e: any) =>
          setErr(e?.response?.data?.message || e?.message || "Update failed"),
      });
      
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Redeem {row?.id ? `#${String(row.id).slice(0, 8)}` : ""}
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

      {/* Editable / Admin controls */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1 col-span-2">
          <Label>Status</Label>
          <select
            value={status}
            disabled={isSubmitting || !allowStatusEdit}
            onChange={(e) => setStatus(e.target.value as RedeemStatus)}
            className="h-10 w-full rounded-2xl border border-border bg-card px-3 text-sm outline-none"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 col-span-2">
          <Label>Admin note</Label>
          <Textarea
            value={adminNote}
            disabled={isSubmitting}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder="Reason / internal note..."
            className="min-h-[90px] rounded-2xl"
          />
        </div>

        {/* Optional edit fields (toggle via readOnly) */}
        <div className="space-y-1">
          <Label className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Amount
          </Label>
          <Input
            value={amount}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            className="bg-card"
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
            className="bg-card"
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Method
          </Label>
          <select
            value={method}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="h-10 w-full rounded-2xl border border-border bg-transparent px-3 text-sm outline-none"
          >
            {METHOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1 col-span-2">
          <Label className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Wallet Address
          </Label>
          <Input
            value={destination}
            disabled={!canEdit || isSubmitting}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Payout address"
            className="bg-card"
          />
        </div>

        <div className="space-y-1 col-span-2">
          <Label className="flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" /> Platform
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
      </div>

      <Separator />

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border p-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" /> Created
          </div>
          <div className="mt-1 text-sm font-semibold">{createdLabel}</div>
        </div>

        <div className="rounded-xl border p-3">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5" /> Updated
          </div>
          <div className="mt-1 text-sm font-semibold">{updatedLabel}</div>
        </div>

        <div className="rounded-xl border p-3 col-span-2">
          <div className="text-[11px] text-muted-foreground flex items-center gap-2">
            <Shield className="h-3.5 w-3.5" /> Reviewed By
          </div>
          <div className="mt-1 text-sm font-semibold">{reviewerLabel}</div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
          Close
        </Button>

        <Button
          onClick={handleSave}
          disabled={isSubmitting || updateWithdrawl.isLoading}
        >
          {isSubmitting ? (
            <Spinner className="size-3" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
