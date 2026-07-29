import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { useTheme } from "../../contexts/ThemeContext";
import { useLanguage } from "../../contexts/LanguageContext";
import TopBar from "../../components/TopBar";
import { api } from "../../api/client";
import { matchWorkArea } from "../../utils/areamap";

interface Category {
  id: string;
  nameEn: string;
  nameAm: string;
  icon: string;
}

interface Provider {
  id: string;
  fullName: string;
  phone: string;
  isAvailable: boolean;
  ratingAvg: number;
  ratingCount: number;
  categories?: Category[];
}

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  bulb: "bulb-outline",
  droplet: "water-outline",
  antenna: "wifi-outline",
  wash: "sparkles-outline",
  brush: "brush-outline",
  hammer: "hammer-outline",
  tools: "construct-outline",
  engine: "flash-outline",
  snowflake: "snow-outline",
  book: "book-outline",
  building: "business-outline",
  plant: "leaf-outline",
  truck: "car-outline",
  "solar-panel": "sunny-outline",
  camera: "videocam-outline",
};

export default function CustomerHomeScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locationLabel, setLocationLabel] = useState(t("home.locating"));
  const [matchedArea, setMatchedArea] = useState<string | null>(null);
  const [nearbyProviders, setNearbyProviders] = useState<Provider[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    api
      .get("/categories")
      .then((res) => setCategories(res.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationLabel(t("home.locationDenied"));
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({});
        const [place] = await Location.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        const fallback = language === "am" ? "አዲስ አበባ" : "Addis Ababa";
        const label =
          place?.district || place?.subregion || place?.city || fallback;
        setLocationLabel(label);
        setMatchedArea(matchWorkArea(place?.district || place?.subregion));
      } catch {
        setLocationLabel(t("home.locationError"));
      }
    })();
  }, [language]);

  // Once we know which of the app's work-area names the customer's GPS
  // location corresponds to, pull providers who cover that area — this is
  // the "based on the location they added" list, sourced straight from the
  // backend rather than anything hardcoded on the client.
  useEffect(() => {
    if (!matchedArea) {
      setNearbyProviders([]);
      return;
    }
    setLoadingNearby(true);
    api
      .get("/providers", {
        params: { area: matchedArea, availableOnly: "true" },
      })
      .then((res) => setNearbyProviders(res.data.providers || []))
      .catch(() => setNearbyProviders([]))
      .finally(() => setLoadingNearby(false));
  }, [matchedArea]);

  const categoryName = (cat: Category) =>
    language === "am" ? cat.nameAm : cat.nameEn;

  const openCategory = (cat: Category) => {
    navigation.navigate("ProviderList", {
      categoryId: cat.id,
      categoryLabel: categoryName(cat),
      area: matchedArea || undefined,
    });
  };

  const seeAllNearby = () => {
    navigation.navigate("ProviderList", {
      area: matchedArea || undefined,
      categoryLabel: locationLabel,
    });
  };

  const call = (phone: string) => Linking.openURL(`tel:${phone}`);

  const [bookingTarget, setBookingTarget] = useState<Provider | null>(null);
  const [bookingDescription, setBookingDescription] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

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

  const runSearch = () => {
    const query = searchQuery.trim();
    if (!query) return;
    navigation.navigate("ProviderList", {
      search: query,
      categoryLabel: `${t("home.searchResultsFor")} "${query}"`,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={t("common.appName")} />
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.locationRow,
            {
              backgroundColor: colors.accentSecondary + "1F",
              borderColor: colors.accentSecondary + "55",
            },
          ]}
        >
          <Ionicons
            name='location-outline'
            size={13}
            color={colors.accentSecondary}
          />
          <Text
            style={{
              color: colors.accentSecondary,
              fontSize: 12.5,
              fontWeight: "600",
            }}
          >
            {locationLabel}
          </Text>
        </View>

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
            onSubmitEditing={runSearch}
            returnKeyType='search'
            placeholder={t("home.searchPlaceholder")}
            placeholderTextColor={colors.textFaint}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {!!searchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name='close-circle'
                size={16}
                color={colors.textFaint}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t("home.categories")}
        </Text>
        <FlatList
          data={categories}
          numColumns={3}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{ gap: 10 }}
          contentContainerStyle={{ gap: 10, marginBottom: 26 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openCategory(item)}
              activeOpacity={0.8}
              style={[
                styles.categoryTile,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.categoryIconWrap,
                  { backgroundColor: colors.surfaceRaised },
                ]}
              >
                <Ionicons
                  name={iconMap[item.icon] || "ellipsis-horizontal-outline"}
                  size={19}
                  color={colors.accent}
                />
              </View>
              <Text
                style={[styles.categoryLabel, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {categoryName(item)}
              </Text>
            </TouchableOpacity>
          )}
        />

        {!!matchedArea && (
          <>
            <View style={styles.sectionHead}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginBottom: 0 },
                ]}
              >
                {t("home.topRated")}
              </Text>
              {!!nearbyProviders.length && (
                <TouchableOpacity onPress={seeAllNearby}>
                  <Text
                    style={{
                      color: colors.accentSecondary,
                      fontSize: 12,
                      fontWeight: "600",
                    }}
                  >
                    {t("home.seeAll")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {loadingNearby ? (
              <ActivityIndicator
                color={colors.accentSecondary}
                style={{ marginVertical: 20 }}
              />
            ) : nearbyProviders.length === 0 ? (
              <Text
                style={{
                  color: colors.textFaint,
                  fontSize: 12.5,
                  marginBottom: 10,
                }}
              >
                {t("providerList.emptySubtitle")}
              </Text>
            ) : (
              <FlatList
                data={nearbyProviders}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ gap: 12 }}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.providerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.providerRow}>
                      <View
                        style={[
                          styles.avatar,
                          { backgroundColor: colors.accentSecondary + "26" },
                        ]}
                      >
                        <Text
                          style={{
                            color: colors.accentSecondary,
                            fontWeight: "700",
                            fontSize: 13,
                          }}
                        >
                          {item.fullName?.[0]?.toUpperCase() || "?"}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 12.5,
                            fontWeight: "600",
                          }}
                          numberOfLines={1}
                        >
                          {item.fullName}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 3,
                            marginTop: 2,
                          }}
                        >
                          <Ionicons
                            name='star'
                            size={10}
                            color={colors.accent}
                          />
                          <Text
                            style={{
                              color: colors.textSecondary,
                              fontSize: 11,
                            }}
                          >
                            {item.ratingAvg?.toFixed(1) || "0.0"} (
                            {item.ratingCount || 0})
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.cardActionsRow}>
                      <TouchableOpacity
                        onPress={() => openBookingModal(item)}
                        activeOpacity={0.85}
                        style={[
                          styles.miniBookButton,
                          { borderColor: colors.accent },
                        ]}
                      >
                        <Ionicons
                          name='calendar-outline'
                          size={12}
                          color={colors.accent}
                        />
                        <Text
                          style={{
                            color: colors.accent,
                            fontWeight: "600",
                            fontSize: 11.5,
                          }}
                        >
                          {t("bookings.bookNow")}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => call(item.phone)}
                        activeOpacity={0.85}
                        style={{ flex: 1 }}
                      >
                        <LinearGradient
                          colors={[
                            colors.accentSecondary,
                            colors.accentTertiary,
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.callButton}
                        >
                          <Ionicons
                            name='call-outline'
                            size={12}
                            color={colors.onAccentSecondary}
                          />
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )}
          </>
        )}
      </ScrollView>

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
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 24,
  },
  searchInput: { flex: 1, fontSize: 14 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  categoryTile: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    minWidth: "30%",
  },
  categoryIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: { fontSize: 10.5, fontWeight: "500", textAlign: "center" },
  providerCard: {
    width: 190,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  miniBookButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  callButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
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
