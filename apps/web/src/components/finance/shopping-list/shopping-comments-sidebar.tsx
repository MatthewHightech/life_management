"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import {
  useComments,
  type CommentsTarget,
} from "@/components/comments/comments-context";
import {
  AddShoppingItemCommentDocument,
  DeleteShoppingItemCommentDocument,
  MarkShoppingItemCommentsReadDocument,
  ShoppingItemCommentsDocument,
  ShoppingListDocument,
  type ShoppingItemCommentsQuery,
  type ShoppingItemCommentsQueryVariables,
} from "@/graphql";

const refetchOptions = {
  refetchQueries: [{ query: ShoppingListDocument }],
  awaitRefetchQueries: true,
};

export function ShoppingCommentsSidebar() {
  const { activeTarget, closeComments } = useComments();
  const { data, loading, refetch } = useQuery<
    ShoppingItemCommentsQuery,
    ShoppingItemCommentsQueryVariables
  >(ShoppingItemCommentsDocument, {
    skip: !activeTarget,
    variables: { shoppingItemId: activeTarget?.id ?? "" },
    fetchPolicy: "network-only",
  });

  const [markRead] = useMutation(
    MarkShoppingItemCommentsReadDocument,
    refetchOptions,
  );
  const [addComment, { loading: posting }] = useMutation(
    AddShoppingItemCommentDocument,
    refetchOptions,
  );
  const [deleteComment] = useMutation(
    DeleteShoppingItemCommentDocument,
    refetchOptions,
  );

  const handleTargetVisible = useCallback(
    (target: CommentsTarget) => {
      void markRead({ variables: { shoppingItemId: target.id } });
      void refetch({ shoppingItemId: target.id });
    },
    [markRead, refetch],
  );

  return (
    <CommentsSidebar
      target={activeTarget}
      comments={data?.shoppingItemComments ?? []}
      loading={loading}
      posting={posting}
      onClose={closeComments}
      onTargetVisible={handleTargetVisible}
      onPost={async (target, body) => {
        await addComment({
          variables: { shoppingItemId: target.id, body },
        });
        await refetch({ shoppingItemId: target.id });
      }}
      onDelete={async (id) => {
        await deleteComment({ variables: { id } });
        await refetch();
      }}
    />
  );
}
