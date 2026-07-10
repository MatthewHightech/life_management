"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { BankAccountSetupModal } from "@/components/finance/budget/bank-account-setup-modal";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  BANK_CONNECTIONS_QUERY,
  COMPLETE_PLAID_LINK_MUTATION,
  CREATE_PLAID_LINK_TOKEN_MUTATION,
  SYNC_BANK_CONNECTION_NOW_MUTATION,
} from "@/graphql";
import type { BankConnectionsQuery, CompletePlaidLinkMutation } from "@/graphql";
import { BANK_CONNECTIONS_REFETCH } from "@/lib/budget-queries";

type BankConnection = BankConnectionsQuery["bankConnections"][number];

type SyncCreditCardButtonProps = {
  className?: string;
};

export function SyncCreditCardButton({ className }: SyncCreditCardButtonProps) {
  const [introOpen, setIntroOpen] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [setupConnection, setSetupConnection] = useState<BankConnection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, loading: loadingConnections } = useQuery<BankConnectionsQuery>(BANK_CONNECTIONS_QUERY);
  const connections = data?.bankConnections ?? [];
  const hasBankConnection = connections.length > 0;

  const [createLinkToken, { loading: creatingToken }] = useMutation(CREATE_PLAID_LINK_TOKEN_MUTATION);
  const [completeLink, { loading: completing }] = useMutation(COMPLETE_PLAID_LINK_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
  });
  const [syncNow, { loading: syncing }] = useMutation(SYNC_BANK_CONNECTION_NOW_MUTATION, {
    refetchQueries: [...BANK_CONNECTIONS_REFETCH],
    awaitRefetchQueries: true,
  });

  const onSuccess = useCallback(
    (publicToken: string) => {
      void completeLink({ variables: { publicToken } })
        .then((result) => {
          const connection = (result.data as CompletePlaidLinkMutation | undefined)?.completePlaidLink;
          if (connection) {
            setSetupConnection(connection);
          }
          setIntroOpen(false);
          setLinkToken(null);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Could not complete bank connection.");
        });
    },
    [completeLink],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    onExit: () => {
      setLinkToken(null);
    },
  });

  useEffect(() => {
    if (!linkToken || !ready) {
      return;
    }

    // Wait for our Radix intro modal to fully unmount — it sets pointer-events:none on
    // the rest of the document while open, which blocks clicks on the Plaid iframe.
    const timer = window.setTimeout(() => {
      open();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [linkToken, ready, open]);

  async function startLink() {
    setError(null);
    // Close first so Dialog releases its scroll/pointer lock before Plaid mounts.
    setIntroOpen(false);

    try {
      const result = await createLinkToken();
      const token = result.data?.createPlaidLinkToken?.linkToken as string | undefined;
      if (!token) {
        throw new Error("Could not create Plaid link token.");
      }
      setLinkToken(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start bank connection.");
      setIntroOpen(true);
    }
  }

  async function syncConnectedBanks() {
    setError(null);
    try {
      await Promise.all(
        connections.map((connection) =>
          syncNow({ variables: { connectionId: connection.id } }),
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sync credit cards.");
    }
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (hasBankConnection) {
      void syncConnectedBanks();
      return;
    }
    setError(null);
    setIntroOpen(true);
  }

  const busy = creatingToken || completing || syncing || Boolean(linkToken);

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className={className ?? "px-3 py-1.5 text-xs"}
        disabled={loadingConnections || busy}
        title={error && !introOpen ? error : undefined}
        onClick={handleClick}
      >
        {syncing ? "Syncing…" : "Sync Credit Card"}
      </Button>

      <Modal
        open={introOpen}
        onOpenChange={setIntroOpen}
        title="Sync credit card purchases"
        description="Connect a card so purchases appear in your inbox automatically."
        className="w-[min(100%-2rem,36rem)]"
      >
        <div className="space-y-3 text-sm text-text-main">
          <p>
            This uses <strong>Plaid</strong>, a read-only bank connection service. You sign in on
            your bank&apos;s (or Plaid&apos;s) secure page — this app never sees your online banking
            password.
          </p>
          <ul className="list-disc space-y-1.5 pl-5 text-text-muted">
            <li>Only transaction history is requested — no payment or transfer access.</li>
            <li>Access tokens are encrypted and stored on the server so you do not re-link often.</li>
            <li>After connecting, you choose which credit accounts to sync.</li>
            <li>Posted card purchases for the current month appear in the purchases inbox.</li>
            <li>Sync runs when you finish setup, then every evening at 9pm Pacific.</li>
          </ul>
          {error ? <p className="text-sm text-error">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIntroOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={creatingToken || completing || Boolean(linkToken)}
              onClick={() => void startLink()}
            >
              {creatingToken || linkToken ? "Opening bank sign-in…" : "Continue to bank sign-in"}
            </Button>
          </div>
        </div>
      </Modal>

      <BankAccountSetupModal
        connection={setupConnection}
        open={setupConnection !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSetupConnection(null);
          }
        }}
      />
    </>
  );
}
