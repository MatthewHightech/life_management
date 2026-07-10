"use client";

import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { UPDATE_BANK_ACCOUNT_SYNC_MUTATION } from "@/graphql";
import type { BankConnectionsQuery } from "@/graphql";
import { BANK_CONNECTIONS_REFETCH } from "@/lib/budget-queries";
import { cn } from "@/lib/cn";

type BankConnection = BankConnectionsQuery["bankConnections"][number];

type BankAccountSetupModalProps = {
  connection: BankConnection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
};

export function BankAccountSetupModal({
  connection,
  open,
  onOpenChange,
  title = "Choose credit cards to sync",
}: BankAccountSetupModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [updateSync, { loading }] = useMutation(UPDATE_BANK_ACCOUNT_SYNC_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    if (!connection) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(
      connection.accounts.filter((account) => account.syncEnabled).map((account) => account.id),
    );
    setError(null);
  }, [connection]);

  const creditAccounts = connection?.accounts.filter((account) => account.isCreditCard) ?? [];

  async function handleSave() {
    if (!connection) {
      return;
    }
    setError(null);
    try {
      await updateSync({
        variables: {
          connectionId: connection.id,
          enabledAccountIds: selectedIds,
        },
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save account selection.");
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={
        connection
          ? `Select which ${connection.institutionName} credit accounts should feed the purchases inbox.`
          : undefined
      }
    >
      {creditAccounts.length === 0 ? (
        <p className="text-sm text-text-muted">
          No credit card accounts were found on this connection. You can disconnect it from Bank
          settings and try another institution.
        </p>
      ) : (
        <ul className="space-y-2">
          {creditAccounts.map((account) => {
            const checked = selectedIds.includes(account.id);
            return (
              <li key={account.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2",
                    checked ? "border-primary bg-primary/5" : "border-border-subtle bg-background",
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={checked}
                    onChange={(event) => {
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, account.id]
                          : current.filter((id) => id !== account.id),
                      );
                    }}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-text-main">
                      {account.officialName ?? account.name}
                      {account.mask ? ` ····${account.mask}` : ""}
                    </span>
                    <span className="block text-xs text-text-muted">
                      {account.subtype ?? account.type}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}

      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          type="button"
          disabled={loading || !connection || creditAccounts.length === 0}
          onClick={() => void handleSave()}
        >
          {loading ? "Saving & syncing…" : "Save & sync now"}
        </Button>
      </div>
    </Modal>
  );
}
