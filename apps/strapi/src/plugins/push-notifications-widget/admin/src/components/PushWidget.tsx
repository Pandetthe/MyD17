import { useState, useEffect } from "react";
import { useFetchClient } from "@strapi/strapi/admin";
import { useIntl } from "react-intl";
import {
  Box,
  Button,
  TextInput,
  Checkbox,
  Typography,
  Flex,
  Loader,
} from "@strapi/design-system";
import { PLUGIN_ID } from "../pluginId";

type Tag = {
  id: number;
  title: string;
};

export default function PushWidget() {
  const { get, post } = useFetchClient();
  const { formatMessage } = useIntl();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const t = (id: string) => formatMessage({ id, defaultMessage: id });

  useEffect(() => {
    get(`/${PLUGIN_ID}/tags`)
      .then((res: any) => setTags(res.data))
      .catch(() =>
        setError(t("push-notifications-widget.widget.push.errorLoadTags")),
      )
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
        : new Set(tags.map((t) => t.id)),
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
      setSuccess(t("push-notifications-widget.widget.push.success"));
      setTitle("");
      setBody("");
      setSelected(new Set());
    } catch (err: any) {
      setError(
        err?.response?.data?.error?.message ??
          err?.message ??
          t("push-notifications-widget.widget.push.errorSend"),
      );
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
  const canSend =
    selected.size > 0 && title.trim().length > 0 && body.trim().length > 0;

  return (
    <Box padding={4}>
      <Flex justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Typography variant="sigma" textColor="neutral600">
          {t("push-notifications-widget.widget.push.tags")}
        </Typography>
        <Button variant="tertiary" size="S" onClick={toggleAll}>
          {allSelected
            ? t("push-notifications-widget.widget.push.deselectAll")
            : t("push-notifications-widget.widget.push.selectAll")}
        </Button>
      </Flex>

      <Box
        marginBottom={4}
        style={{
          maxHeight: 180,
          overflowY: "auto",
          border: "1px solid #dcdce4",
          borderRadius: 4,
        }}
      >
        {tags.length === 0 ? (
          <Box padding={3}>
            <Typography textColor="neutral500">
              {t("push-notifications-widget.widget.push.noTags")}
            </Typography>
          </Box>
        ) : (
          tags.map((tag) => (
            <Box
              key={tag.id}
              padding={2}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderBottom: "1px solid #f0f0f3",
              }}
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
          placeholder={t(
            "push-notifications-widget.widget.push.titlePlaceholder",
          )}
        />
      </Box>

      <Box marginBottom={3}>
        <TextInput
          name="body"
          value={body}
          onChange={(e: any) => setBody(e.target.value)}
          placeholder={t(
            "push-notifications-widget.widget.push.bodyPlaceholder",
          )}
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
        {sending
          ? t("push-notifications-widget.widget.push.sending")
          : t("push-notifications-widget.widget.push.send")}
      </Button>
    </Box>
  );
}
