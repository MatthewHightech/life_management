"use client";

import { useMutation, useQuery } from "@apollo/client";
import { useCallback } from "react";
import { CommentsSidebar } from "@/components/comments/comments-sidebar";
import {
  useComments,
  type CommentsTarget,
} from "@/components/comments/comments-context";
import {
  ADD_SHOPPING_ITEM_COMMENT_MUTATION,
  DELETE_SHOPPING_ITEM_COMMENT_MUTATION,
  MARK_SHOPPING_ITEM_COMMENTS_READ_MUTATION,
  SHOPPING_ITEM_COMMENTS_QUERY,
  SHOPPING_LIST_QUERY,
  type ShoppingItemCommentsQuery,
  type ShoppingItemCommentsQueryVariables,
} from "@/graphql";

const refetchOptions = {
  refetchQueries: [{ query: SHOPPING_LIST_QUERY }],
  awaitRefetchQueries: true,
};

export function ShoppingCommentsSidebar() {
  const { activeTarget, closeComments } = useComments();
  const { data, loading, refetch } = useQuery<
    ShoppingItemCommentsQuery,
    ShoppingItemCommentsQueryVariables
  >(SHOPPING_ITEM_COMMENTS_QUERY, {
    skip: !activeTarget,
    variables: { shoppingItemId: activeTarget?.id ?? "" },
    fetchPolicy: "network-only",
  });

  const [markRead] = useMutation(
    MARK_SHOPPING_ITEM_COMMENTS_READ_MUTATION,
    refetchOptions,
  );
  const [addComment, { loading: posting }] = useMutation(
    ADD_SHOPPING_ITEM_COMMENT_MUTATION,
    refetchOptions,
  );
  const [deleteComment] = useMutation(
    DELETE_SHOPPING_ITEM_COMMENT_MUTATION,
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
