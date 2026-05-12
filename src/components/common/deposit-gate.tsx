"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUserInfo } from "@/helpers/use-user";
import { useWalletBalance, useWalletActions } from "@/hooks/wallet";
import { useWalletTransactions } from "@/hooks/wallet-transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Wallet, ArrowDownToLine, ShieldAlert, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";

type ReceiveType = "lightning" | "onchain";

const RECEIVE_TYPE_OPTIONS: { value: ReceiveType; label: string }[] = [
  { value: "lightning", label: "Lightning" },
  { value: "onchain", label: "On-chain" },
];

const MIN_DEPOSIT = 1;
const MAX_DEPOSIT_HINT = 10;
const REMINDER_INTERVAL_MS = 5 * 60 * 1000;

export default function DepositGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const { id, role } = useUserInfo() as any;
  const isAdmin = String(role ?? "").toLowerCase() === "admin";
  const queryClient = useQueryClient();
  const walletActions = useWalletActions();

  const { data: balanceData, isLoading: balanceLoading } = useWalletBalance(
    id as string | undefined,
  );

  const { data: txData } = useWalletTransactions(
    id && !isAdmin ? { user_id: id, type: "deposit", limit: 1 } : null,
  );

  const hasDeposits =
    Array.isArray((txData as any)?.data)
      ? (txData as any).data.length > 0
      : Array.isArray((txData as any)?.transactions)
        ? (txData as any).transactions.length > 0
        : false;

  const [dismissed, setDismissed] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    type: "lightning" as ReceiveType,
    memo: "",
    game_id: "",
    game_name: "",
  });

  const [amountError, setAmountError] = useState("");

  const [depositCreated, setDepositCreated] = useState<{
    address?: string;
    magic_link?: string;
    amount?: string;
  } | null>(null);

  const spendable = Number(
    (balanceData as any)?.data?.spendable ??
      (balanceData as any)?.spendable ??
      0,
  );

  const isLoading = balanceLoading;

  // Poll every 6 seconds while gate is visible so it auto-closes on deposit arrival
  useEffect(() => {
    if (!id || isAdmin || dismissed) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", id] });
    }, 6000);
    return () => clearInterval(interval);
  }, [id, isAdmin, dismissed, queryClient]);

  // Remind every 5 minutes after dismissal if still no deposits
  const remindedRef = useRef(false);
  useEffect(() => {
    if (!id || isAdmin || !dismissed || hasDeposits) return;

    const showReminder = () => {
      toast.warning("Reminder: make a deposit to unlock full access!", {
        id: "deposit-reminder",
        duration: 10000,
      });
    };

    if (!remindedRef.current) {
      showReminder();
      remindedRef.current = true;
    }

    const interval = setInterval(showReminder, REMINDER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id, isAdmin, dismissed, hasDeposits]);

  // Admins and unauthenticated users bypass the gate entirely
  if (!id || isAdmin) return <>{children}</>;

  const needsDeposit = !isLoading && spendable < MIN_DEPOSIT;
  const showGate = !dismissed && (isLoading || needsDeposit);

  // Gate dismissed or deposit satisfied — render children normally
  if (!showGate) return <>{children}</>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAmountError("");

    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) {
      setAmountError(`Minimum deposit is $${MIN_DEPOSIT}.`);
      return;
    }

    try {
      const response = await walletActions.createDeposit({
        userId: String(id),
        amount,
        type: form.type,
        memo: form.memo || undefined,
        gameId: form.game_id || undefined,
        gameName: form.game_name || undefined,
      });

      const result = response?.data ?? null;
      setDepositCreated(result);
      toast.success("Deposit address created! Send funds and refresh when done.");
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", id] });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create deposit address.",
      );
    }
  };

  return (
    <>
      {/* Page content visible (blurred) behind the modal */}
      <div className="pointer-events-none select-none opacity-25 blur-sm">
        {children}
      </div>

      {/* Full-screen backdrop + modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6 shadow-2xl space-y-5">

          {/* Dismiss button */}
          {!isLoading && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              aria-label="Dismiss and continue to dashboard"
            >
              <X className="size-4" />
            </button>
          )}

          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              {isLoading ? (
                <Spinner className="size-7 text-emerald-400" />
              ) : (
                <Wallet className="size-7 text-emerald-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isLoading ? "Loading your wallet…" : "Deposit Required"}
            </h2>
            {!isLoading && (
              <>
                <p className="text-sm text-muted-foreground">
                  A minimum deposit of{" "}
                  <span className="font-semibold text-emerald-400">
                    ${MIN_DEPOSIT}
                  </span>{" "}
                  is required to access your dashboard. We recommend starting
                  with{" "}
                  <span className="font-semibold text-emerald-400">
                    ${MAX_DEPOSIT_HINT}
                  </span>
                  .
                </p>

                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-400">
                  <ShieldAlert className="size-4 shrink-0" />
                  {spendable > 0
                    ? `Current balance: $${spendable.toFixed(2)} — below the $${MIN_DEPOSIT} minimum.`
                    : `Your account balance is $0.00. Deposit $${MIN_DEPOSIT}–$${MAX_DEPOSIT_HINT} to unlock access.`}
                </div>
              </>
            )}
          </div>

          {/* Body — only when data loaded */}
          {!isLoading && (
            <>
              {depositCreated ? (
                <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Deposit address created!
                  </p>
                  {depositCreated.address && (
                    <div>
                      <div className="text-[11px] text-muted-foreground">Address</div>
                      <div className="mt-1 break-all rounded-lg bg-black/20 p-2 font-mono text-xs text-foreground">
                        {depositCreated.address}
                      </div>
                    </div>
                  )}
                  {depositCreated.magic_link && (
                    <div>
                      <div className="text-[11px] text-muted-foreground mb-1.5">Magic Link</div>
                      <a
                        href={depositCreated.magic_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        <ArrowDownToLine className="size-4" />
                        Open Deposit Link
                      </a>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Once your funds arrive your dashboard will unlock automatically.
                  </p>
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["wallet-balance", id] });
                    }}
                  >
                    I&apos;ve deposited — Refresh
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Amount{" "}
                      <span className="text-muted-foreground font-normal">
                        (min ${MIN_DEPOSIT})
                      </span>
                    </Label>
                    <Input
                      value={form.amount}
                      type="number"
                      min={MIN_DEPOSIT}
                      step="0.01"
                      disabled={walletActions.isPending}
                      onChange={(e) => {
                        setAmountError("");
                        setForm((p) => ({ ...p, amount: e.target.value }));
                      }}
                      placeholder={`e.g. $${MAX_DEPOSIT_HINT}.00`}
                      className="rounded-xl"
                    />
                    {amountError && (
                      <p className="text-xs text-destructive">{amountError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Deposit Type</Label>
                    <select
                      value={form.type}
                      disabled={walletActions.isPending}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          type: e.target.value as ReceiveType,
                        }))
                      }
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none"
                    >
                      {RECEIVE_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Game (optional)</Label>
                    <GamesSelect
                      value={form.game_id}
                      disabled={walletActions.isPending}
                      onChange={(game: GameOption | null) =>
                        setForm((p) => ({
                          ...p,
                          game_id: game?.id ?? "",
                          game_name: game?.name ?? "",
                        }))
                      }
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
                    disabled={walletActions.isPending}
                  >
                    {walletActions.isPending ? (
                      <Spinner className="size-4 mr-2" />
                    ) : (
                      <ArrowDownToLine className="size-4 mr-2" />
                    )}
                    {walletActions.isPending ? "Creating..." : "Create Deposit Address"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
                  >
                    Skip for now and continue to dashboard
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
