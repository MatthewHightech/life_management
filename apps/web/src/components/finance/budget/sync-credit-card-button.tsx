"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useState, type MouseEvent } from "react";
import { BankAccountSetupModal } from "@/components/finance/budget/bank-account-setup-modal";
import { PlaidLinkLauncher } from "@/components/finance/budget/plaid-link-launcher";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  BankConnectionsDocument,
  CompletePlaidLinkDocument,
  CreatePlaidLinkTokenDocument,
  SyncBankConnectionNowDocument,
} from "@/graphql";
import type { BankConnectionsQuery } from "@/graphql";
import { BANK_CONNECTIONS_REFETCH } from "@/lib/refetch-queries";
import { apolloErrorMessage } from "@/lib/apollo-error";
import { useDemoMode } from "@/demo/demo-context";
import { DEMO_UNAVAILABLE_MESSAGE } from "@/demo/mode";

type BankConnection = BankConnectionsQuery["bankConnections"][number];

const bankMutationOptions = {
  refetchQueries: [...BANK_CONNECTIONS_REFETCH],
  awaitRefetchQueries: true,
};

export function SyncCreditCardButton() {
  const demoMode = useDemoMode();
  const [introOpen, setIntroOpen] = useState(false);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [setupConnection, setSetupConnection] = useState<BankConnection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, loading: loadingConnections } = useQuery<BankConnectionsQuery>(BankConnectionsDocument);
  const connections = data?.bankConnections ?? [];

  const [createLinkToken, { loading: creatingToken }] = useMutation(CreatePlaidLinkTokenDocument);
  const [completeLink, { loading: completing }] = useMutation(CompletePlaidLinkDocument, bankMutationOptions);
  const [syncNow, { loading: syncing }] = useMutation(SyncBankConnectionNowDocument, bankMutationOptions);

  function handleLinkSuccess(publicToken: string) {
    void completeLink({ variables: { publicToken } })
      .then((result) => {
        const connection = result.data?.completePlaidLink;
        if (connection) {
          setSetupConnection(connection);
        }
        setIntroOpen(false);
        setLinkToken(null);
      })
      .catch((err: unknown) => {
        setLinkToken(null);
        setError(apolloErrorMessage(err, "Could not complete bank connection."));
      });
  }

  async function startLink() {
    setError(null);
    setIntroOpen(false);

    try {
      const result = await createLinkToken();
      const token = result.data?.createPlaidLinkToken?.linkToken;
      if (!token) {
        throw new Error("Could not create Plaid link token.");
      }
      setLinkToken(token);
    } catch (err) {
      setError(apolloErrorMessage(err, "Could not start bank connection."));
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
      setError(apolloErrorMessage(err, "Could not sync credit cards."));
    }
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (connections.length > 0) {
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
        className="px-3 py-1.5 text-xs"
        disabled={demoMode || loadingConnections || busy}
        title={demoMode ? DEMO_UNAVAILABLE_MESSAGE : error && !introOpen ? error : undefined}
        onClick={handleClick}
      >
        {syncing ? "Syncing…" : "Sync Credit Card"}
      </Button>

      {linkToken ? (
        <PlaidLinkLauncher
          token={linkToken}
          onSuccess={handleLinkSuccess}
          onExit={() => setLinkToken(null)}
        />
      ) : null}

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
