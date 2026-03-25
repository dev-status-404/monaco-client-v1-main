"use client";

import React, { useMemo, useState } from "react";
import { useUserInfo } from "@/helpers/use-user";
import { useUpdateUser } from "@/hooks/user";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import {
  Mail,
  Phone,
  Shield,
  User as UserIcon,
  CalendarDays,
  MapPin,
  Pencil,
  Save,
  X,
  CheckCircle2,
} from "lucide-react";
import { queryClient } from "@/providers/react-query";
import { useDispatch } from "react-redux";
import { updateProfile } from "@/redux/slices/user";

const ProfileLayout = () => {
  const { user, isLoading } = useUserInfo() as any;
  const updateUser = useUpdateUser() as any;
  const disptach = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const safeUser = user ?? {};
  const fullName = useMemo(() => {
    const fn = String(safeUser.firstName ?? safeUser.first_name ?? "").trim();
    const ln = String(safeUser.lastName ?? safeUser.last_name ?? "").trim();
    const display = String(safeUser.displayName ?? safeUser.name ?? "").trim();
    return [fn, ln].filter(Boolean).join(" ") || display || "User";
  }, [safeUser]);

  const role = String(safeUser.role ?? safeUser.user_role ?? "").trim();
  const status = String(
    safeUser.status ?? safeUser.account_status ?? "",
  ).trim();
  const email = String(safeUser.email ?? "").trim();
  const phone = String(safeUser.phone ?? safeUser.phoneNumber ?? "").trim();
  const country = String(
    safeUser.country ?? safeUser.location?.country ?? "",
  ).trim();
  const city = String(safeUser.city ?? safeUser.location?.city ?? "").trim();
  const createdAt = safeUser.createdAt ?? safeUser.created_at ?? null;

  const [form, setForm] = useState({
    firstName: String(safeUser.firstName ?? safeUser.first_name ?? ""),
    lastName: String(safeUser.lastName ?? safeUser.last_name ?? ""),
    email: email,
    phone: phone,
  });

  // keep form in sync if user arrives later
  React.useEffect(() => {
    setForm({
      firstName: String(safeUser.firstName ?? safeUser.first_name ?? ""),
      lastName: String(safeUser.lastName ?? safeUser.last_name ?? ""),
      email: String(safeUser.email ?? ""),
      phone: String(safeUser.phone ?? safeUser.phoneNumber ?? ""),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeUser?.id, safeUser?._id, safeUser?.email]);

  const save = async () => {
    const payload: any = {
      id: safeUser.id ?? safeUser._id,
      firstName: form.firstName?.trim(),
      lastName: form.lastName?.trim(),
      email: form.email?.trim(),
      phone: form.phone?.trim(),
    };

    // remove empty keys to avoid overwriting with ""
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "" || payload[k] == null) delete payload[k];
    });

    try {
      // common patterns: mutate / mutateAsync
      if (typeof updateUser.mutateAsync === "function") {
        await updateUser.mutateAsync(payload, {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            disptach(updateProfile(payload)); // update Redux store with new profile data
          },
        });
      } else if (typeof updateUser.mutate === "function") {
        updateUser.mutate(payload);
      }
      setIsEditing(false);
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Update failed");
    }
  };

  const cancel = () => {
    setForm({
      firstName: String(safeUser.firstName ?? safeUser.first_name ?? ""),
      lastName: String(safeUser.lastName ?? safeUser.last_name ?? ""),
      email: String(safeUser.email ?? ""),
      phone: String(safeUser.phone ?? safeUser.phoneNumber ?? ""),
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-10 text-slate-900 dark:text-white flex items-center justify-center h-full">
        <Spinner className="size-12" />
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-6">
      {/* Profile Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: avatar + name */}
          <div className="flex items-start gap-4">
            <div className="grid size-14 place-items-center rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5">
              <UserIcon className="size-6 text-slate-600 dark:text-white/70" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xl font-semibold text-slate-900 dark:text-white">
                  {fullName}
                </div>

                {role ? (
                  <Badge variant="secondary" className="rounded-xl">
                    <Shield className="mr-1 size-3" />
                    {role}
                  </Badge>
                ) : null}

                {status ? (
                  <Badge
                    variant={
                      String(status).toLowerCase() === "active"
                        ? "success"
                        : "secondary"
                    }
                    className="rounded-xl"
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    {status}
                  </Badge>
                ) : null}
              </div>

              <div className="mt-1 text-sm text-slate-600 dark:text-white/50">{email || "—"}</div>

              {(city || country) && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-white/50">
                  <MapPin className="size-4 text-slate-500 dark:text-white/40" />
                  <span>{[city, country].filter(Boolean).join(", ")}</span>
                </div>
              )}

              {createdAt ? (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-600 dark:text-white/50">
                  <CalendarDays className="size-4 text-slate-500 dark:text-white/40" />
                  <span>
                    Joined{" "}
                    {new Date(createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap items-center gap-2">
            {!isEditing ? (
              <Button
                className="rounded-2xl"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
            ) : (
              <>
                <Button
                  className="rounded-2xl"
                  onClick={save}
                  disabled={updateUser?.isPending || updateUser?.isLoading}
                >
                  <Save className="mr-2 size-4" />
                  Save
                </Button>
                <Button
                  variant="secondary"
                  className="rounded-2xl"
                  onClick={cancel}
                >
                  <X className="mr-2 size-4" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
              <Mail className="size-4 text-slate-500 dark:text-white/40" />
              Email
            </div>

            {!isEditing ? (
              <div className="mt-2 text-slate-900 dark:text-white">{email || "—"}</div>
            ) : (
              <div className="mt-2 space-y-2">
                <Label className="text-slate-700 dark:text-white/70">Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                  className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                  placeholder="name@email.com"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
              <UserIcon className="size-4 text-slate-500 dark:text-white/40" />
              First name
            </div>

            {!isEditing ? (
              <div className="mt-2 text-slate-900 dark:text-white">
                {String(safeUser.firstName ?? safeUser.first_name ?? "—")}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <Label className="text-slate-700 dark:text-white/70">First name</Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                  placeholder="First name"
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
              <UserIcon className="size-4 text-slate-500 dark:text-white/40" />
              Last name
            </div>

            {!isEditing ? (
              <div className="mt-2 text-slate-900 dark:text-white">
                {String(safeUser.lastName ?? safeUser.last_name ?? "—")}
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <Label className="text-slate-700 dark:text-white/70">Last name</Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/30"
                  placeholder="Last name"
                />
              </div>
            )}
          </div>
        </div>

        {/* Meta footer */}
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-white/40">
          <span className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-slate-700 dark:text-slate-300">
            ID: {String(safeUser.id ?? safeUser._id ?? "—")}
          </span>
          {safeUser.auth_provider ? (
            <span className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-slate-700 dark:text-slate-300">
              Provider: {String(safeUser.auth_provider)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
