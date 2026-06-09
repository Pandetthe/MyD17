import { useState, useEffect } from "react";
import { useFetchClient } from "@strapi/strapi/admin";
import { Box, Button, TextInput, Checkbox, Typography, Flex, Loader } from "@strapi/design-system";
import { PLUGIN_ID } from "../pluginId";

type Tag = {
  id: number;
  title: string;
};

export default function PushWidget() {
  const { get, post } = useFetchClient();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    get(`/${PLUGIN_ID}/tags`)
      .then((res: any) => setTags(res.data))
      .catch(() => setError("Failed to load tags"))
      .finally(() => setFetchLoading(false));
  }, []);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setSelected(
      selected.size === tags.length
        ? new Set()
        : new Set(tags.map((t) => t.id))
    );

  const handleSend = async () => {
    setError(null);
    setSuccess(null);
    setSending(true);
    try {
      await post(`/${PLUGIN_ID}/send`, {
        tagIds: Array.from(selected),
        title,
        body,
      });
      setSuccess("Notifications sent");
      setTitle("");
      setBody("");
      setSelected(new Set());
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.message ?? "Failed to send notifications");
    } finally {
      setSending(false);
    }
  };

  if (fetchLoading) {
    return (
      <Flex justifyContent="center" padding={6}>
        <Loader />
      </Flex>
    );
  }

  const allSelected = tags.length > 0 && selected.size === tags.length;
  const canSend = selected.size > 0 && title.trim().length > 0 && body.trim().length > 0;

  return (
    <Box padding={4}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Typography variant="sigma" textColor="neutral600">
          Tags
        </Typography>
        <Button variant="tertiary" size="S" onClick={toggleAll}>
          {allSelected ? "Deselect all" : "Select all"}
        </Button>
      </Flex>

      <Box
        marginBottom={4}
        style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #dcdce4", borderRadius: 4 }}
      >
        {tags.length === 0 ? (
          <Box padding={3}>
            <Typography textColor="neutral500">No tags found</Typography>
          </Box>
        ) : (
          tags.map((tag) => (
            <Box
              key={tag.id}
              padding={2}
              style={{ display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #f0f0f3" }}
            >
              <Checkbox
                checked={selected.has(tag.id)}
                onCheckedChange={() => toggle(tag.id)}
              />
              <Typography variant="pi">{tag.title}</Typography>
            </Box>
          ))
        )}
      </Box>

      <Box marginBottom={3}>
        <TextInput
          name="title"
          value={title}
          onChange={(e: any) => setTitle(e.target.value)}
          placeholder="Notification title"
        />
      </Box>

      <Box marginBottom={3}>
        <TextInput
          name="body"
          value={body}
          onChange={(e: any) => setBody(e.target.value)}
          placeholder="Notification body"
        />
      </Box>

      {error && (
        <Box marginBottom={2}>
          <Typography textColor="danger600">{error}</Typography>
        </Box>
      )}

      {success && (
        <Box marginBottom={2}>
          <Typography textColor="success600">{success}</Typography>
        </Box>
      )}

      <Button onClick={handleSend} disabled={!canSend || sending} fullWidth>
        {sending ? "Sending…" : "Send notifications"}
      </Button>
    </Box>
  );
}
