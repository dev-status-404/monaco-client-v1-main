"use client";

import React, { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ShieldAlert, Wallet, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GamesSelect, { type GameOption } from "@/features/platforms/ui/select";
import { useUserInfo } from "@/helpers/use-user";
import { useWalletActions, useWalletBalance } from "@/hooks/wallet";
import { useWalletTransactions } from "@/hooks/wallet-transaction";

type ReceiveType = "lightning" | "onchain";
type DepositTab = "pointsmate" | "pixpay";
type PixPayMethod = "Cash App" | "Venmo" | "PayPal" | "Visa / Debit";

const RECEIVE_TYPE_OPTIONS: { value: ReceiveType; label: string }[] = [
  { value: "lightning", label: "Lightning" },
  { value: "onchain", label: "On-chain" },
];

const PIX_PAY_METHODS: PixPayMethod[] = [
  "Cash App",
  "Venmo",
  "PayPal",
  "Visa / Debit",
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
  const [activeTab, setActiveTab] = useState<DepositTab>("pointsmate");

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

  const [pixPayForm, setPixPayForm] = useState({
    amount: "",
    method: PIX_PAY_METHODS[0] as PixPayMethod,
    gameUsername: "",
    game_id: "",
    game_name: "",
  });
  const [pixPayErrors, setPixPayErrors] = useState<{
    amount?: string;
    gameUsername?: string;
  }>({});
  const [pixPayPending, setPixPayPending] = useState(false);
  const [pixPayCreated, setPixPayCreated] = useState<{
    orderId?: string;
    paymentUrl?: string;
    amount?: string;
    method?: PixPayMethod;
    gameUsername?: string;
  } | null>(null);

  const spendable = Number(
    (balanceData as any)?.data?.spendable ??
      (balanceData as any)?.spendable ??
      0,
  );

  const isLoading = balanceLoading;

  useEffect(() => {
    if (!id || isAdmin || dismissed) return;
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balance", id] });
    }, 6000);
    return () => clearInterval(interval);
  }, [id, isAdmin, dismissed, queryClient]);

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

  if (!id || isAdmin) return <>{children}</>;

  const needsDeposit = !isLoading && spendable < MIN_DEPOSIT;
  const showGate = !dismissed && (isLoading || needsDeposit);

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

  const handlePixPaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPixPayErrors({});

    const amount = Number(pixPayForm.amount);
    const nextErrors: { amount?: string; gameUsername?: string } = {};

    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) {
      nextErrors.amount = `Minimum deposit is $${MIN_DEPOSIT}.`;
    }

    if (!pixPayForm.gameUsername.trim()) {
      nextErrors.gameUsername = "Game username is required.";
    }

    if (nextErrors.amount || nextErrors.gameUsername) {
      setPixPayErrors(nextErrors);
      return;
    }

    const paymentWindow =
      typeof window !== "undefined" ? window.open("about:blank", "_blank") : null;

    setPixPayPending(true);

    try {
      const response = await api.post("/orders/pix-pay", {
        amount,
        method: pixPayForm.method,
        gameUsername: pixPayForm.gameUsername.trim(),
        gameName: pixPayForm.game_name || undefined,
      });

      const order = response?.data?.data?.order;
      const paymentUrl =
        response?.data?.paymentUrl ??
        response?.data?.data?.paymentUrl ??
        order?.payment_url ??
        "";

      if (paymentWindow) {
        if (paymentUrl) {
          paymentWindow.location.href = paymentUrl;
        } else {
          paymentWindow.close();
        }
      } else if (paymentUrl) {
        window.open(paymentUrl, "_blank");
      }

      setPixPayCreated({
        orderId: response?.data?.orderId ?? order?.id,
        paymentUrl,
        amount: amount.toFixed(2),
        method: pixPayForm.method,
        gameUsername: pixPayForm.gameUsername.trim(),
      });

      toast.success("PixPay order created. Complete payment in the new tab.");
    } catch (error: any) {
      if (paymentWindow && !paymentWindow.closed) {
        paymentWindow.close();
      }

      toast.error(
        error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          error?.message ||
          "Failed to create PixPay order.",
      );
    } finally {
      setPixPayPending(false);
    }
  };

  return (
    <>
      <div className="pointer-events-none select-none opacity-25 blur-sm">
        {children}
      </div>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-md space-y-5 rounded-2xl border border-white/10 bg-card p-6 shadow-2xl">
          {!isLoading && (
            <button
              onClick={() => setDismissed(true)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
              aria-label="Dismiss and continue to dashboard"
            >
              <X className="size-4" />
            </button>
          )}

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
              {isLoading ? (
                <Spinner className="size-7 text-emerald-400" />
              ) : (
                <Wallet className="size-7 text-emerald-400" />
              )}
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              {isLoading ? "Loading your wallet..." : "Deposit Required"}
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
                    ? `Current balance: $${spendable.toFixed(2)} - below the $${MIN_DEPOSIT} minimum.`
                    : `Your account balance is $0.00. Deposit $${MIN_DEPOSIT}-$${MAX_DEPOSIT_HINT} to unlock access.`}
                </div>
              </>
            )}
          </div>

          {!isLoading && (
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as DepositTab)}
              className="space-y-4"
            >
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-xl bg-white/5 p-1">
                <TabsTrigger value="pointsmate" className="rounded-lg">
                  PointsMate
                </TabsTrigger>
                <TabsTrigger value="pixpay" className="rounded-lg">
                  PixPay
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pointsmate" className="space-y-4">
                {depositCreated ? (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Deposit address created!
                    </p>
                    {depositCreated.address && (
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          Address
                        </div>
                        <div className="mt-1 break-all rounded-lg bg-black/20 p-2 font-mono text-xs text-foreground">
                          {depositCreated.address}
                        </div>
                      </div>
                    )}
                    {depositCreated.magic_link && (
                      <div>
                        <div className="mb-1.5 text-[11px] text-muted-foreground">
                          Magic Link
                        </div>
                        <a
                          href={depositCreated.magic_link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
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
                        queryClient.invalidateQueries({
                          queryKey: ["wallet-balance", id],
                        });
                      }}
                    >
                      I&apos;ve deposited - Refresh
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Amount{" "}
                        <span className="font-normal text-muted-foreground">
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
                          setForm((prev) => ({ ...prev, amount: e.target.value }));
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
                          setForm((prev) => ({
                            ...prev,
                            type: e.target.value as ReceiveType,
                          }))
                        }
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none"
                      >
                        {RECEIVE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
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
                          setForm((prev) => ({
                            ...prev,
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
                        <Spinner className="mr-2 size-4" />
                      ) : (
                        <ArrowDownToLine className="mr-2 size-4" />
                      )}
                      {walletActions.isPending
                        ? "Creating..."
                        : "Create Deposit Address"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      className="w-full py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Skip for now and continue to dashboard
                    </button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="pixpay" className="space-y-4">
                {pixPayCreated ? (
                  <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      PixPay order created!
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          Method
                        </div>
                        <div className="mt-1 rounded-lg bg-black/20 p-2 text-xs text-foreground">
                          {pixPayCreated.method}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground">
                          Amount
                        </div>
                        <div className="mt-1 rounded-lg bg-black/20 p-2 text-xs text-foreground">
                          ${pixPayCreated.amount}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <div className="text-[11px] text-muted-foreground">
                          Game Username
                        </div>
                        <div className="mt-1 rounded-lg bg-black/20 p-2 text-xs text-foreground">
                          {pixPayCreated.gameUsername}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Finish the payment in the new tab. PixPay stays pending
                      until an admin verifies the payment.
                    </p>

                    {pixPayCreated.paymentUrl ? (
                      <a
                        href={pixPayCreated.paymentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
                      >
                        <ArrowDownToLine className="size-4" />
                        Open PixPay
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      className="w-full py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Continue to dashboard
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePixPaySubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>
                        Amount{" "}
                        <span className="font-normal text-muted-foreground">
                          (min ${MIN_DEPOSIT})
                        </span>
                      </Label>
                      <Input
                        value={pixPayForm.amount}
                        type="number"
                        min={MIN_DEPOSIT}
                        step="0.01"
                        disabled={pixPayPending}
                        onChange={(e) => {
                          setPixPayErrors((prev) => ({
                            ...prev,
                            amount: undefined,
                          }));
                          setPixPayForm((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }));
                        }}
                        placeholder={`e.g. $${MAX_DEPOSIT_HINT}.00`}
                        className="rounded-xl"
                      />
                      {pixPayErrors.amount && (
                        <p className="text-xs text-destructive">
                          {pixPayErrors.amount}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <select
                        value={pixPayForm.method}
                        disabled={pixPayPending}
                        onChange={(e) =>
                          setPixPayForm((prev) => ({
                            ...prev,
                            method: e.target.value as PixPayMethod,
                          }))
                        }
                        className="h-10 w-full rounded-xl border border-border bg-background px-3 text-foreground outline-none"
                      >
                        {PIX_PAY_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Game Username</Label>
                      <Input
                        value={pixPayForm.gameUsername}
                        disabled={pixPayPending}
                        onChange={(e) => {
                          setPixPayErrors((prev) => ({
                            ...prev,
                            gameUsername: undefined,
                          }));
                          setPixPayForm((prev) => ({
                            ...prev,
                            gameUsername: e.target.value,
                          }));
                        }}
                        placeholder="Enter your in-game username"
                        className="rounded-xl"
                      />
                      {pixPayErrors.gameUsername && (
                        <p className="text-xs text-destructive">
                          {pixPayErrors.gameUsername}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Game (optional)</Label>
                      <GamesSelect
                        value={pixPayForm.game_id}
                        disabled={pixPayPending}
                        onChange={(game: GameOption | null) =>
                          setPixPayForm((prev) => ({
                            ...prev,
                            game_id: game?.id ?? "",
                            game_name: game?.name ?? "",
                          }))
                        }
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      You&apos;ll be sent to PixPay in a new tab. Your balance
                      updates after admin approval.
                    </p>

                    <Button
                      type="submit"
                      className="w-full rounded-xl bg-emerald-500 text-black hover:bg-emerald-400"
                      disabled={pixPayPending}
                    >
                      {pixPayPending ? (
                        <Spinner className="mr-2 size-4" />
                      ) : (
                        <ArrowDownToLine className="mr-2 size-4" />
                      )}
                      {pixPayPending ? "Creating..." : "Pay with PixPay"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setDismissed(true)}
                      className="w-full py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Skip for now and continue to dashboard
                    </button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </>
  );
}
