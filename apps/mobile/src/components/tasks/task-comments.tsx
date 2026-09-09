import { formatDateTime } from "@life/shared";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Avatar } from "@/src/components/avatar";
import { useTaskComments } from "@/src/data";
import { theme } from "@/constants/theme";

type TaskCommentsSectionProps = {
  taskId: string;
  onComposerFocus?: () => void;
  onComposerBlur?: () => void;
};

export function TaskCommentsSection({
  taskId,
  onComposerFocus,
  onComposerBlur,
}: TaskCommentsSectionProps) {
  const { comments, loading, posting, addComment, deleteComment, markRead } = useTaskComments(taskId);
  const [draft, setDraft] = useState("");
  const markedRef = useRef<string | null>(null);

  useEffect(() => {
    if (markedRef.current === taskId) {
      return;
    }
    markedRef.current = taskId;
    void markRead();
  }, [taskId, markRead]);

  async function handlePost() {
    const body = draft.trim();
    if (!body) {
      return;
    }
    await addComment(body);
    setDraft("");
  }

  function confirmDelete(id: string) {
    Alert.alert("Delete comment?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          void deleteComment(id);
        },
      },
    ]);
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Comments</Text>
      {loading ? <ActivityIndicator color={theme.primary} /> : null}
      {comments.map((comment) => (
        <View key={comment.id} style={styles.comment}>
          <Avatar user={comment.author} size={32} />
          <View style={styles.commentBody}>
            <View style={styles.commentHeader}>
              <Text style={styles.author}>{comment.author.name ?? comment.author.email}</Text>
              <Text style={styles.time}>{formatDateTime(comment.createdAt)}</Text>
            </View>
            <Text style={styles.body}>{comment.body}</Text>
            {comment.canDelete ? (
              <Pressable onPress={() => confirmDelete(comment.id)}>
                <Text style={styles.delete}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ))}
      {!loading && comments.length === 0 ? (
        <Text style={styles.empty}>No comments yet.</Text>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment…"
          placeholderTextColor={theme.textMuted}
          value={draft}
          onChangeText={setDraft}
          onFocus={onComposerFocus}
          onBlur={onComposerBlur}
          multiline
        />
        <Pressable
          style={[styles.post, (!draft.trim() || posting) && styles.postDisabled]}
          disabled={!draft.trim() || posting}
          onPress={() => void handlePost()}
        >
          {posting ? (
            <ActivityIndicator color={theme.onPrimary} />
          ) : (
            <Text style={styles.postText}>Post</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 14,
  },
  heading: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  comment: {
    flexDirection: "row",
    gap: 10,
  },
  commentBody: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  author: {
    fontWeight: "600",
    color: theme.text,
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    color: theme.textMuted,
  },
  body: {
    fontSize: 15,
    color: theme.text,
    lineHeight: 21,
  },
  delete: {
    fontSize: 13,
    color: theme.error,
    marginTop: 2,
  },
  empty: {
    color: theme.textMuted,
    fontSize: 14,
  },
  composer: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    backgroundColor: theme.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 72,
    textAlignVertical: "top",
    fontSize: 16,
    color: theme.text,
  },
  post: {
    alignSelf: "flex-end",
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: "center",
  },
  postDisabled: {
    opacity: 0.5,
  },
  postText: {
    color: theme.onPrimary,
    fontWeight: "600",
  },
});
