import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import TopBar from "../../components/TopBar";
import EmptyState from "../../components/EmptyState";
import { api } from "../../api/client";
import { formatCategoryPrice, PriceType } from "../../utils/pricing";

interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  icon: string;
  priceType?: PriceType;
  price?: number;
}

interface Provider {
  id: string;
  fullName: string;
  phone: string;
  workAreas?: string[];
  categories?: Category[];
  yearsExperience?: number;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
}

export default function ProviderListScreen({ route, navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const categoryId = route?.params?.categoryId;
  const area = route?.params?.area;
  const initialSearch = route?.params?.search || "";
  const categoryLabel =
    route?.params?.categoryLabel || t("providerList.defaultTitle");

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [bookingTarget, setBookingTarget] = useState<Provider | null>(null);
  const [bookingDescription, setBookingDescription] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (categoryId) params.categoryId = categoryId;
    if (area) params.area = area;
    if (searchQuery.trim()) params.q = searchQuery.trim();

    // Debounce so we're not firing a request on every keystroke.
    setLoading(true);
    const timeout = setTimeout(() => {
      api
        .get("/providers", { params })
        .then((res) => setProviders(res.data.providers || []))
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timeout);
  }, [categoryId, area, searchQuery]);

  const call = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const openBookingModal = (provider: Provider) => {
    setBookingDescription("");
    setBookingAddress("");
    setBookingTarget(provider);
  };

  const submitBooking = async () => {
    if (!bookingTarget) return;
    setSubmittingBooking(true);
    try {
      await api.post("/customer/bookings", {
        providerId: bookingTarget.id,
        categoryId: bookingTarget.categories?.[0]?.id,
        description: bookingDescription.trim(),
        address: bookingAddress.trim(),
      });
      setBookingTarget(null);
      Alert.alert(
        t("bookings.requestSentTitle"),
        t("bookings.requestSentBody"),
        [
          {
            text: t("common.ok"),
            onPress: () =>
              navigation.navigate("CustomerHome", { screen: "Bookings" }),
          },
        ],
      );
    } catch (e: any) {
      Alert.alert(
        t("common.error"),
        e?.response?.data?.error || t("bookings.requestFailed"),
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={categoryLabel} />
      <View
        style={[
          styles.searchBar,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <Ionicons
          name='search-outline'
          size={16}
          color={colors.textSecondary}
        />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t("home.searchPlaceholder")}
          placeholderTextColor={colors.textFaint}
          style={[styles.searchInput, { color: colors.text }]}
        />
        {!!searchQuery && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name='close-circle' size={16} color={colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>
      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator color={colors.accentSecondary} />
        </View>
      ) : (
        <FlatList
          data={providers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon='search-outline'
              title={
                searchQuery.trim()
                  ? t("providerList.noSearchResults")
                  : t("providerList.emptyTitle")
              }
              subtitle={
                searchQuery.trim()
                  ? t("providerList.tryDifferentSearch")
                  : t("providerList.emptySubtitle")
              }
            />
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>
                    {item.fullName}
                  </Text>
                  <View style={styles.statusRow}>
                    <View
                      style={[
                        styles.statusDot,
                        item.isAvailable
                          ? {
                              backgroundColor: colors.success,
                              shadowColor: colors.success,
                            }
                          : { backgroundColor: colors.textFaint },
                      ]}
                    />
                    <Text
                      style={{
                        color: item.isAvailable
                          ? colors.success
                          : colors.textFaint,
                        fontSize: 12,
                        fontWeight: "500",
                      }}
                    >
                      {item.isAvailable
                        ? t("providerList.availableNow")
                        : t("providerList.offline")}
                    </Text>
                  </View>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name='star' size={12} color={colors.accent} />
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontSize: 12,
                      fontWeight: "500",
                    }}
                  >
                    {item.ratingAvg?.toFixed(1) || "0.0"} (
                    {item.ratingCount || 0})
                  </Text>
                </View>
              </View>

              {(!!item.categories?.length ||
                !!item.yearsExperience ||
                !!item.phone) && (
                <View style={styles.workRow}>
                  {!!item.phone && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name='call-outline'
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 12.5,
                          fontWeight: "500",
                        }}
                      >
                        {item.phone}
                      </Text>
                    </View>
                  )}
                  {!!item.categories?.length && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name='briefcase-outline'
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 12.5,
                          fontWeight: "500",
                          flexShrink: 1,
                        }}
                        numberOfLines={1}
                      >
                        {item.categories.map((c) => c.nameAm).join(", ")}
                      </Text>
                    </View>
                  )}
                  {!!item.yearsExperience && (
                    <View style={styles.metaItem}>
                      <Ionicons
                        name='ribbon-outline'
                        size={13}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: 12.5,
                          fontWeight: "500",
                        }}
                      >
                        {item.yearsExperience} {t("profile.yearsExperience")}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {!!item.categories?.length && (
                <View style={styles.priceRow}>
                  {item.categories.map((cat) => (
                    <View
                      key={cat.id}
                      style={[
                        styles.priceChip,
                        {
                          backgroundColor:
                            cat.priceType === "negotiable"
                              ? colors.surfaceRaised
                              : colors.accentDim,
                          borderColor:
                            cat.priceType === "negotiable"
                              ? colors.border
                              : colors.accent + "40",
                        },
                      ]}
                    >
                      <Ionicons
                        name='pricetag-outline'
                        size={11}
                        color={
                          cat.priceType === "negotiable"
                            ? colors.textSecondary
                            : colors.accent
                        }
                      />
                      <Text
                        style={{
                          color:
                            cat.priceType === "negotiable"
                              ? colors.textSecondary
                              : colors.accent,
                          fontSize: 11.5,
                          fontWeight: "600",
                        }}
                      >
                        {formatCategoryPrice(cat, t, language)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!!item.workAreas?.length && (
                <View style={styles.areaRow}>
                  {item.workAreas.map((area) => (
                    <View
                      key={area}
                      style={[
                        styles.areaChip,
                        { backgroundColor: colors.surfaceRaised },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 10.5,
                          color: colors.textSecondary,
                          fontWeight: "600",
                        }}
                      >
                        {area.toUpperCase()}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => openBookingModal(item)}
                  activeOpacity={0.85}
                  style={[styles.bookButton, { borderColor: colors.accent }]}
                >
                  <Ionicons
                    name='calendar-outline'
                    size={15}
                    color={colors.accent}
                  />
                  <Text
                    style={{
                      color: colors.accent,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {t("bookings.bookNow")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => call(item.phone)}
                  activeOpacity={0.85}
                  style={styles.callButtonWrap}
                >
                  <LinearGradient
                    colors={[colors.accentSecondary, colors.accentTertiary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.callButton}
                  >
                    <Ionicons
                      name='call-outline'
                      size={15}
                      color={colors.onAccentSecondary}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <Modal
        visible={!!bookingTarget}
        transparent
        animationType='fade'
        onRequestClose={() => setBookingTarget(null)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => !submittingBooking && setBookingTarget(null)}
        >
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => {}}
          >
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {t("bookings.requestFrom")} {bookingTarget?.fullName}
              </Text>
              <TouchableOpacity
                onPress={() => !submittingBooking && setBookingTarget(null)}
              >
                <Ionicons name='close' size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t("bookings.descriptionLabel")}
            </Text>
            <TextInput
              value={bookingDescription}
              onChangeText={setBookingDescription}
              placeholder={t("bookings.descriptionPlaceholder")}
              placeholderTextColor={colors.textFaint}
              multiline
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                  height: 80,
                  textAlignVertical: "top",
                },
              ]}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              {t("bookings.addressLabel")}
            </Text>
            <TextInput
              value={bookingAddress}
              onChangeText={setBookingAddress}
              placeholder={t("bookings.addressPlaceholder")}
              placeholderTextColor={colors.textFaint}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <TouchableOpacity
              onPress={submitBooking}
              disabled={submittingBooking}
              style={[styles.submitButton, { backgroundColor: colors.accent }]}
            >
              {submittingBooking ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text
                  style={{
                    color: colors.onAccent,
                    fontWeight: "700",
                    fontSize: 15,
                  }}
                >
                  {t("bookings.sendRequest")}
                </Text>
              )}
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchInput: { flex: 1, fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 18, padding: 15, marginBottom: 12 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOpacity: 0.6,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  workRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  priceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  priceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  areaRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
  areaChip: { borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 13,
  },
  bookButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 11,
  },
  callButtonWrap: { borderRadius: 12, overflow: "hidden" },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 46,
    height: 44,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
  },
});
