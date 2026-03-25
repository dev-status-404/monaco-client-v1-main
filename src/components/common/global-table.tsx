"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Plus, ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type ColumnDef<T> = {
  key: keyof T | string; // string for computed columns
  title: string;
  render?: (row: T) => React.ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
};

export type ModalMode = "add" | "edit" | "custom";

export type RenderFormProps<T> = {
  mode: ModalMode;
  row: T | null;
  onClose: () => void;
  onSuccess: () => void; // close + refresh trigger
};

export type RowAction<T> = {
  key: string;
  label: string;
  icon?: React.ReactNode;
  destructive?: boolean;

  /** show/hide/disable per row */
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;

  /** action handler */
  onClick: (row: T) => void | Promise<void>;

  /** optional: opens modal in custom mode */
  openModal?: {
    title?: string | ((row: T) => string);
    description?: string | ((row: T) => string);
    render?: (props: RenderFormProps<T>) => React.ReactNode; // custom modal content
  };
};

type GlobalTableProps<T> = {
  title?: string;

  columns: ColumnDef<T>[];
  data: T[];

  /** Row actions (flexible per dataset) */
  actions?: RowAction<T>[];

  /** Keep old booleans */
  showActions?: boolean;

  /** Add button */
  enableAdd?: boolean;
  addButtonLabel?: string;

  /** Your form (for add/edit) */
  renderForm?: (props: RenderFormProps<T>) => React.ReactNode;

  /** Custom modal title/description for add/edit */
  addModalTitle?: string;
  addModalDescription?: string;
  editModalTitle?: string;
  editModalDescription?: string;

  /** Optional: row click */
  onRowClick?: (row: T) => void;

  /** Optional: for invalidating queries, refetch etc. */
  onAfterSuccess?: () => void;

  /** Table height */
  heightClassName?: string; // e.g. "h-[380px]"

  /**
   * ✅ Optional "View all" link (top-right)
   * showViewAll: controls visibility
   * viewAllHref: where to navigate
   * viewAllLabel: button text
   */
  showViewAll?: boolean;
  viewAllHref?: string;
  viewAllLabel?: string;
};

export function GlobalDataTable<T extends { id: string | number }>(
  props: GlobalTableProps<T>,
) {
  const {
    title,
    columns,
    data,
    actions = [],
    showActions = true,

    enableAdd = true,
    addButtonLabel = "Add",

    renderForm,
    addModalTitle = "Add",
    addModalDescription = "Create a new record.",
    editModalTitle = "Edit",
    editModalDescription = "Update this record.",

    onRowClick,
    onAfterSuccess,
    heightClassName = "h-[380px]",

    showViewAll = false,
    viewAllHref = "#",
    viewAllLabel = "View all",
  } = props;

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>("add");
  const [row, setRow] = useState<T | null>(null);

  // optional custom modal content triggered by an action
  const [customModal, setCustomModal] = useState<{
    title?: string;
    description?: string;
    render?: (p: RenderFormProps<T>) => React.ReactNode;
  } | null>(null);

  const openAdd = () => {
    setMode("add");
    setRow(null);
    setCustomModal(null);
    setOpen(true);
  };

  const openEdit = (r: T) => {
    setMode("edit");
    setRow(r);
    setCustomModal(null);
    setOpen(true);
  };

  const openCustom = (r: T, cfg?: RowAction<T>["openModal"]) => {
    setMode("custom");
    setRow(r);
    setCustomModal({
      title: typeof cfg?.title === "function" ? cfg?.title(r) : cfg?.title,
      description:
        typeof cfg?.description === "function"
          ? cfg?.description(r)
          : cfg?.description,
      render: cfg?.render,
    });
    setOpen(true);
  };

  const onClose = () => setOpen(false);

  const onSuccess = () => {
    setOpen(false);
    onAfterSuccess?.();
  };

  const resolvedActions = useMemo(() => {
    return (actions ?? []).filter(Boolean);
  }, [actions]);

  const modalTitle =
    mode === "add"
      ? addModalTitle
      : mode === "edit"
      ? editModalTitle
      : customModal?.title ?? "Details";

  const modalDesc =
    mode === "add"
      ? addModalDescription
      : mode === "edit"
      ? editModalDescription
      : customModal?.description ?? "";

  const modalBody = () => {
    if (mode === "custom" && customModal?.render) {
      return customModal.render({ mode, row, onClose, onSuccess });
    }
    if (renderForm) return renderForm({ mode, row, onClose, onSuccess });
    return null;
  };

  const showHeaderRow = Boolean(title || (enableAdd && renderForm) || showViewAll);

  return (
    <div className="space-y-3">
      {showHeaderRow && (
        <div className="md:flex items-center md:justify-between gap-2">
          {title ? <h3 className="text-sm font-semibold">{title}</h3> : <div />}

          <div className="flex items-center gap-2">
            {/* ✅ View all link (optional) */}
            {showViewAll && viewAllHref && viewAllHref !== "#" && (
              <Button asChild variant="secondary" size="sm" className="rounded-2xl">
                <Link href={viewAllHref}>
                  {viewAllLabel}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            {/* Add button */}
            {enableAdd && renderForm && (
              <Button className="rounded-2xl" onClick={openAdd}>
                <Plus className="mr-2 h-4 w-4" />
                {addButtonLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={cn("rounded-lg border border-border bg-transparent max-h-[380px] overflow-y-auto", heightClassName)}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={String(col.key)}
                  className={cn(
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "",
                    col.headerClassName,
                  )}
                >
                  {col.title}
                </TableHead>
              ))}
              {showActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="py-8 text-center text-muted-foreground"
                >
                  No data found
                </TableCell>
              </TableRow>
            )}

            {data.map((r) => (
              <TableRow
                key={r.id}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={() => onRowClick?.(r)}
              >
                {columns.map((col) => (
                  <TableCell
                    key={String(col.key)}
                    className={cn(
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "",
                      col.className,
                    )}
                    onClick={(e) => {
                      if (onRowClick) e.stopPropagation();
                    }}
                  >
                    {col.render ? col.render(r) : String((r as any)[col.key] ?? "-")}
                  </TableCell>
                ))}

                {showActions && (
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {/* Built-in Edit (only if renderForm exists) */}
                        {renderForm && (
                          <>
                            <DropdownMenuItem onClick={() => openEdit(r)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            {resolvedActions.length > 0 && <DropdownMenuSeparator />}
                          </>
                        )}

                        {/* Custom actions */}
                        {resolvedActions.map((a) => {
                          if (a.visible && !a.visible(r)) return null;
                          const disabled = a.disabled?.(r) ?? false;

                          return (
                            <DropdownMenuItem
                              key={a.key}
                              disabled={disabled}
                              onClick={async () => {
                                if (disabled) return;

                                if (a.openModal?.render) {
                                  openCustom(r, a.openModal);
                                  return;
                                }

                                await a.onClick(r);
                              }}
                              className={cn(a.destructive && "text-destructive")}
                            >
                              {a.icon ? <span className="mr-2">{a.icon}</span> : null}
                              {a.label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal (add/edit/custom) */}
      {(renderForm || customModal?.render) && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[560px]">
            <DialogHeader>
              <DialogTitle>{modalTitle}</DialogTitle>
              {modalDesc ? <DialogDescription>{modalDesc}</DialogDescription> : null}
            </DialogHeader>

            {modalBody()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}