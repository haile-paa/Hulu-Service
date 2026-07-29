import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import TopBar from "../../components/TopBar";
import { api, buildChatSocketUrl } from "../../api/client";

interface ChatMessage {
  id: string;
  bookingId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

// How long to wait before trying to reconnect after a dropped socket.
const RECONNECT_DELAY_MS = 2500;

export default function ChatRoomScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bookingId: string = route?.params?.bookingId;
  const otherPartyName: string = route?.params?.otherPartyName || "";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [draft, setDraft] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    AsyncStorage.getItem("@hulu_user").then((raw) => {
      if (!raw) return;
      try {
        setMyUserId(JSON.parse(raw)?.id || null);
      } catch {
        // ignore malformed stored user; messages will just render as "theirs"
      }
    });
  }, []);

  // Load history once up front.
  useEffect(() => {
    if (!bookingId) return;
    api
      .get(`/bookings/${bookingId}/messages`)
      .then((res) => setMessages(res.data.messages || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const connect = useCallback(async () => {
    if (!bookingId) return;
    const url = await buildChatSocketUrl(bookingId);
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => {
      if (mountedRef.current) setConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === "message" && payload.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
      } catch {
        // ignore malformed frames
      }
    };

    const scheduleReconnect = () => {
      if (!mountedRef.current) return;
      setConnected(false);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    socket.onerror = scheduleReconnect;
    socket.onclose = scheduleReconnect;
  }, [bookingId]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      socketRef.current?.close();
    };
  }, [connect]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setDraft("");

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ text }));
    } else {
      // Socket not ready (still connecting/reconnecting) — fall back to REST
      // so the message isn't lost. The server broadcast will dedupe by id
      // for any device that's still connected via WS.
      api
        .post(`/bookings/${bookingId}/messages`, { text })
        .then((res) => {
          setMessages((prev) =>
            prev.some((m) => m.id === res.data.message.id)
              ? prev
              : [...prev, res.data.message],
          );
        })
        .catch(() => {});
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <TopBar
        title={otherPartyName || t("chat.title")}
        subtitle={connected ? t("chat.online") : t("chat.connecting")}
        onBack={() => navigation.goBack()}
      />

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accentSecondary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 14, gap: 8, flexGrow: 1 }}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: false })
          }
          renderItem={({ item }) => {
            const mine = item.senderId === myUserId;
            return (
              <View
                style={[
                  styles.bubble,
                  mine
                    ? { alignSelf: "flex-end", backgroundColor: colors.accent }
                    : {
                        alignSelf: "flex-start",
                        backgroundColor: colors.surface,
                        borderWidth: 1,
                        borderColor: colors.border,
                      },
                ]}
              >
                <Text
                  style={{
                    color: mine ? colors.onAccent : colors.text,
                    fontSize: 14.5,
                  }}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: colors.textFaint, fontSize: 13 }}>
                {t("chat.emptyThread")}
              </Text>
            </View>
          }
        />
      )}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder={t("chat.messagePlaceholder")}
          placeholderTextColor={colors.textFaint}
          style={[styles.input, { color: colors.text }]}
          multiline
        />
        <TouchableOpacity
          onPress={send}
          disabled={!draft.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor: draft.trim() ? colors.accent : colors.border,
            },
          ]}
        >
          <Ionicons
            name='arrow-up'
            size={18}
            color={draft.trim() ? colors.onAccent : colors.textFaint}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 14.5,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
