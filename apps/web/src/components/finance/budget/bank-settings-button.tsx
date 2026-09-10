"use client";

import { useMutation, useQuery } from "@apollo/client";
import { Landmark, Settings2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { BankAccountSetupModal } from "@/components/finance/budget/bank-account-setup-modal";
import { PlaidLinkLauncher } from "@/components/finance/budget/plaid-link-launcher";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Modal } from "@/components/ui/modal";
import {
  BANK_CONNECTIONS_QUERY,
  COMPLETE_PLAID_UPDATE_MUTATION,
  CREATE_PLAID_UPDATE_LINK_TOKEN_MUTATION,
  DISCONNECT_BANK_CONNECTION_MUTATION,
  SYNC_BANK_CONNECTION_NOW_MUTATION,
} from "@/graphql";
import type { BankConnectionsQuery } from "@/graphql";
import { apolloErrorMessage } from "@/lib/apollo-error";
import { BANK_CONNECTIONS_REFETCH } from "@/lib/budget-queries";
import { formatShortDate } from "@life/shared";
import { cn } from "@/lib/cn";
import { useDemoMode } from "@/demo/demo-context";
import { DEMO_UNAVAILABLE_MESSAGE } from "@/demo/mode";

function isItemLoginRequiredMessage(message: string | null | undefined) {
  return Boolean(message?.includes("ITEM_LOGIN_REQUIRED"));
}

function needsBankReconnect(
  connection: BankConnectionsQuery["bankConnections"][number],
  syncError?: string,
) {
  return (
    isItemLoginRequiredMessage(connection.lastError) ||
    isItemLoginRequiredMessage(syncError)
  );
}

export function BankSettingsButton() {
  const demoMode = useDemoMode();
  const [open, setOpen] = useState(false);
  const [editConnectionId, setEditConnectionId] = useState<string | null>(null);
  const [disconnectId, setDisconnectId] = useState<string | null>(null);
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({});
  const [updateConnectionId, setUpdateConnectionId] = useState<string | null>(null);
  const updateConnectionIdRef = useRef<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [reconnecting, setReconnecting] = useState(false);

  const { data, loading, refetch } = useQuery<BankConnectionsQuery>(BANK_CONNECTIONS_QUERY);
  const connections = data?.bankConnections ?? [];

  const [disconnect, { loading: disconnecting }] = useMutation(DISCONNECT_BANK_CONNECTION_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
    onCompleted: () => setDisconnectId(null),
  });

  const [syncNow, { loading: syncing }] = useMutation(SYNC_BANK_CONNECTION_NOW_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
  });

  const [createUpdateToken] = useMutation(CREATE_PLAID_UPDATE_LINK_TOKEN_MUTATION);
  const [completeUpdate] = useMutation(COMPLETE_PLAID_UPDATE_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
  });

  const handleUpdateSuccess = useCallback(() => {
    const connectionId = updateConnectionIdRef.current;
    if (!connectionId) {
      setLinkToken(null);
      return;
    }
    void completeUpdate({ variables: { connectionId } })
      .then(() => {
        setSyncErrors((current) => {
          const next = { ...current };
          delete next[connectionId];
          return next;
        });
      })
      .catch((error: unknown) => {
        const message = apolloErrorMessage(error, "Could not finish bank reconnection.");
        setSyncErrors((current) => ({ ...current, [connectionId]: message }));
        setOpen(true);
      })
      .finally(() => {
        setLinkToken(null);
        setUpdateConnectionId(null);
        updateConnectionIdRef.current = null;
        setReconnecting(false);
      });
  }, [completeUpdate]);

  const handleUpdateExit = useCallback(() => {
    setLinkToken(null);
    setUpdateConnectionId(null);
    updateConnectionIdRef.current = null;
    setReconnecting(false);
  }, []);

  if (demoMode) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-sm font-medium text-text-muted opacity-60 shadow-sm"
        aria-label={DEMO_UNAVAILABLE_MESSAGE}
        title={DEMO_UNAVAILABLE_MESSAGE}
      >
        <Settings2 className="h-4 w-4" />
        <span className="hidden sm:inline">Bank settings</span>
      </button>
    );
  }

  if (!loading && connections.length === 0) {
    return null;
  }

  const editConnection = connections.find((connection) => connection.id === editConnectionId) ?? null;
  const disconnectTarget =
    connections.find((connection) => connection.id === disconnectId) ?? null;

  async function handleSyncNow(connectionId: string) {
    setSyncErrors((current) => {
      const next = { ...current };
      delete next[connectionId];
      return next;
    });
    try {
      await syncNow({ variables: { connectionId } });
    } catch (error) {
      const message = apolloErrorMessage(error, "Could not sync this bank connection.");
      setSyncErrors((current) => ({ ...current, [connectionId]: message }));
      void refetch();
    }
  }

  async function handleReconnect(connectionId: string) {
    setSyncErrors((current) => {
      const next = { ...current };
      delete next[connectionId];
      return next;
    });
    setReconnecting(true);
    setUpdateConnectionId(connectionId);
    updateConnectionIdRef.current = connectionId;
    // Close first so Dialog releases its scroll/pointer lock before Plaid mounts.
    setOpen(false);
    try {
      const result = await createUpdateToken({ variables: { connectionId } });
      const token = result.data?.createPlaidUpdateLinkToken?.linkToken as string | undefined;
      if (!token) {
        throw new Error("Could not start bank reconnection.");
      }
      setLinkToken(token);
    } catch (error) {
      const message = apolloErrorMessage(error, "Could not start bank reconnection.");
      setSyncErrors((current) => ({ ...current, [connectionId]: message }));
      setUpdateConnectionId(null);
      updateConnectionIdRef.current = null;
      setReconnecting(false);
      setOpen(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-sm font-medium text-text-main shadow-sm transition hover:border-primary/30 hover:bg-sage/40 hover:shadow"
        aria-label="Bank settings"
        title="Bank settings"
      >
        <Settings2 className="h-4 w-4 text-primary" />
        <span className="hidden sm:inline">Bank settings</span>
      </button>

      {linkToken ? (
        <PlaidLinkLauncher
          token={linkToken}
          onSuccess={() => handleUpdateSuccess()}
          onExit={handleUpdateExit}
        />
      ) : null}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title="Bank settings"
        description="Manage synced credit accounts or disconnect a bank."
        className="w-[min(100%-2rem,40rem)]"
      >
        {loading ? (
          <p className="text-sm text-text-muted">Loading connections…</p>
        ) : connections.length === 0 ? (
          <p className="text-sm text-text-muted">No banks connected yet.</p>
        ) : (
          <ul className="space-y-3">
            {connections.map((connection) => {
              const enabledCount = connection.accounts.filter((account) => account.syncEnabled).length;
              const syncError = syncErrors[connection.id] ?? connection.lastError;
              const showReconnect = needsBankReconnect(connection, syncErrors[connection.id]);
              return (
                <li
                  key={connection.id}
                  className="rounded-lg border border-border-subtle bg-background p-3"
                >
                  <div className="flex items-start gap-3">
                    <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-text-main">{connection.institutionName}</p>
                      <p className="text-xs text-text-muted">
                        {enabledCount} card{enabledCount === 1 ? "" : "s"} syncing
                        {connection.lastSyncedAt
                          ? ` · Last sync ${formatShortDate(connection.lastSyncedAt)}`
                          : " · Not synced yet"}
                        {connection.status === "ERROR" ? " · Needs attention" : ""}
                      </p>
                      {syncError ? (
                        <p className="mt-1 break-words text-xs text-error">{syncError}</p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {showReconnect ? (
                          <Button
                            type="button"
                            className="gap-1.5 px-3 py-1.5 text-xs"
                            disabled={reconnecting || Boolean(linkToken)}
                            onClick={() => void handleReconnect(connection.id)}
                          >
                            {reconnecting && updateConnectionId === connection.id
                              ? "Opening bank sign-in…"
                              : "Reconnect bank"}
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          onClick={() => setEditConnectionId(connection.id)}
                        >
                          Edit synced cards
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3 py-1.5 text-xs"
                          disabled={syncing || enabledCount === 0 || showReconnect}
                          onClick={() => void handleSyncNow(connection.id)}
                        >
                          Sync now
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          className={cn("px-3 py-1.5 text-xs text-error")}
                          onClick={() => setDisconnectId(connection.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>

      <BankAccountSetupModal
        connection={editConnection}
        open={editConnectionId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditConnectionId(null);
          }
        }}
        title="Edit synced credit cards"
      />

      <ConfirmModal
        open={disconnectId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setDisconnectId(null);
          }
        }}
        title="Disconnect bank?"
        description={
          disconnectTarget
            ? `"${disconnectTarget.institutionName}" will be removed. Imported purchases already in your budget stay; new transactions will stop syncing.`
            : "This bank will be removed."
        }
        confirmLabel="Disconnect"
        loadingLabel="Disconnecting…"
        loading={disconnecting}
        destructive
        onConfirm={() => {
          if (disconnectId) {
            void disconnect({ variables: { connectionId: disconnectId } });
          }
        }}
      />
    </>
  );
}
