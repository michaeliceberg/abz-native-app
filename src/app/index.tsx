// src/app/index.tsx
import Header from "@/components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CompactView from "../components/CompactView";
import FactoryFilter from "../components/FactoryFilter";
import MainTabs from "../components/MainTabs";
import ModeSwitch from "../components/ModeSwitch";
import ViewTabs from "../components/ViewTabs";
import { fetchShipments, logout } from "../utils/api";
import { formatTime, getDateKey } from "../utils/helpers";

interface Shipment {
  id: string;
  date: string;
  licensePlate: string;
  consignee: string;
  quantity: number;
  material: string;
  division: string;
  driver?: string;
  clientRequestNumber?: string;
}

interface GroupedData {
  date: string;
  items: Shipment[];
}

const isConcreteMaterial = (material: string): boolean => {
  if (!material) return false;
  const lower = material.toLowerCase();
  const concreteMarkers = [
    "бст",
    "бетон",
    "раствор",
    "в25",
    "в30",
    "f200",
    "f300",
  ];
  for (const marker of concreteMarkers) {
    if (lower.includes(marker)) return true;
  }
  return false;
};

// ✅ Цветовая схема
const getTheme = (mode: "tas" | "iceberg") => {
  if (mode === "tas") {
    return {
      background: "#f1f5f9",
      card: "#ffffff",
      cardBorder: "rgba(0,0,0,0.06)",
      text: "#1a1a2e",
      textSecondary: "#64748b",
      headerBg: "#ffffff",
      headerBorder: "rgba(0,0,0,0.06)",
      dateHeader: "#64748b",
      tabBg: "#f1f5f9",
      tabActive: "#e2e8f0",
      badgeBg: "rgba(0,0,0,0.04)",
      badgeText: "#64748b",
      plateBg: "#f1f5f9",
      plateText: "#1a1a2e",
      quantityBg: "#f1f5f9",
      quantityText: "#1a1a2e",
      dotColor: "#22c55e",
    };
  } else {
    return {
      background: "#0f0f1a",
      card: "#1a1a2e",
      cardBorder: "rgba(255,255,255,0.06)",
      text: "#ffffff",
      textSecondary: "#94a3b8",
      headerBg: "#1a1a2e",
      headerBorder: "rgba(255,255,255,0.06)",
      dateHeader: "#94a3b8",
      tabBg: "#1a1a2e",
      tabActive: "rgba(255,217,61,0.15)",
      badgeBg: "rgba(255,255,255,0.06)",
      badgeText: "#94a3b8",
      plateBg: "rgba(255,255,255,0.06)",
      plateText: "#ffffff",
      quantityBg: "rgba(255,255,255,0.06)",
      quantityText: "#ffd93d",
      dotColor: "#4ade80",
    };
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "incoming" | "shipment" | "shipmentConcrete"
  >("shipment");
  const [mode, setMode] = useState<"tas" | "iceberg">("tas");
  const [activeFactory, setActiveFactory] = useState("all");
  const [viewTab, setViewTab] = useState<"list" | "compact">("compact");
  const [username, setUsername] = useState<string>("tas");

  const theme = getTheme(mode);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setUsername(parsed.username || "tas");
        }
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error);
      }
    };
    loadUser();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchShipments();
      setShipments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const toggleMode = () => {
    setMode(mode === "tas" ? "iceberg" : "tas");
    setActiveFactory("all");
  };

  const handleLogout = async () => {
    Alert.alert("Выход", "Вы уверены, что хотите выйти?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  // Фильтруем по режиму
  const validFactories = mode === "tas" ? ["ЛХ", "ЛЮ"] : ["СП", "Щ"];
  const modeFiltered = shipments.filter((item) =>
    validFactories.includes(item.division),
  );

  // Фильтруем по типу материала
  const filteredShipments = modeFiltered.filter((item) => {
    if (activeTab === "incoming") return true;
    if (activeTab === "shipment") return !isConcreteMaterial(item.material);
    if (activeTab === "shipmentConcrete")
      return isConcreteMaterial(item.material);
    return true;
  });

  // Фильтруем по заводу
  const factories = [
    ...new Set(modeFiltered.map((item) => item.division)),
  ].filter(Boolean);
  const filteredByFactory =
    activeFactory === "all"
      ? filteredShipments
      : filteredShipments.filter((item) => item.division === activeFactory);

  // Группируем по датам
  const grouped = filteredByFactory.reduce(
    (acc: Record<string, Shipment[]>, item: Shipment) => {
      const key = getDateKey(item.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  const groupedData: GroupedData[] = Object.keys(grouped)
    .sort((a, b) => {
      const [d1, m1, y1] = a.split(".").map(Number);
      const [d2, m2, y2] = b.split(".").map(Number);
      return (
        new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()
      );
    })
    .map((date) => ({
      date,
      items: grouped[date],
    }));

  const animationKey = `${activeTab}-${activeFactory}-${mode}-${viewTab}`;

  const renderItem = ({
    item: group,
    index,
  }: {
    item: GroupedData;
    index: number;
  }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400, delay: index * 50 }}
    >
      <View style={[styles.dateGroup, { borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.dateHeader, { color: theme.dateHeader }]}>
          {group.date}
        </Text>
        {group.items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
            onPress={() =>
              setExpandedId(expandedId === item.id ? null : item.id)
            }
            activeOpacity={0.7}
          >
            <View style={styles.cardRow}>
              <Text style={[styles.time, { color: theme.textSecondary }]}>
                {formatTime(item.date)}
              </Text>
              <Text
                style={[
                  styles.plate,
                  { color: theme.text, backgroundColor: theme.plateBg },
                ]}
              >
                {item.licensePlate || "—"}
              </Text>
              <Text
                style={[
                  styles.quantity,
                  {
                    color: theme.quantityText,
                    backgroundColor: theme.quantityBg,
                  },
                ]}
              >
                {item.quantity.toFixed(1)} т
              </Text>
            </View>
            <Text style={[styles.destination, { color: theme.textSecondary }]}>
              {item.consignee || "ПК"}
            </Text>
            {expandedId === item.id && (
              <View
                style={[styles.details, { borderTopColor: theme.cardBorder }]}
              >
                <Text
                  style={[styles.detailText, { color: theme.textSecondary }]}
                >
                  📦 Материал: {item.material}
                </Text>
                <Text
                  style={[styles.detailText, { color: theme.textSecondary }]}
                >
                  🏭 Завод: {item.division}
                </Text>
                {item.driver && (
                  <Text
                    style={[styles.detailText, { color: theme.textSecondary }]}
                  >
                    👤 Водитель: {item.driver}
                  </Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </MotiView>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator
          size="large"
          color={mode === "tas" ? "#22c55e" : "#ffd93d"}
        />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Загрузка...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={mode === "tas" ? "dark-content" : "light-content"}
        backgroundColor={theme.background}
      />

      {/* ✅ НОВЫЙ КОМПОНЕНТ HEADER */}
      <Header
        username={username}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onLogout={handleLogout}
        theme={theme}
      />

      <ModeSwitch mode={mode} onToggle={toggleMode} />

      <MainTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showConcreteTab={mode === "iceberg"}
        theme={theme}
      />

      <FactoryFilter
        factories={factories}
        activeFactory={activeFactory}
        onFactoryChange={setActiveFactory}
        theme={theme}
      />

      <ViewTabs activeTab={viewTab} onTabChange={setViewTab} theme={theme} />

      <MotiView
        key={animationKey}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        exit={{ opacity: 0, translateY: -20 }}
        transition={{ type: "timing", duration: 350 }}
        style={{ flex: 1 }}
      >
        {viewTab === "list" ? (
          <FlatList
            data={groupedData}
            keyExtractor={(item) => item.date}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={mode === "tas" ? "#22c55e" : "#ffd93d"}
                colors={[mode === "tas" ? "#22c55e" : "#ffd93d"]}
              />
            }
            ListEmptyComponent={
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Нет данных
              </Text>
            }
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <CompactView
            shipments={filteredByFactory}
            groupedData={groupedData}
            theme={theme}
          />
        )}
      </MotiView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  dateGroup: {
    marginBottom: 16,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    paddingBottom: 4,
  },
  card: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    fontSize: 12,
    width: 40,
  },
  plate: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  quantity: {
    fontSize: 14,
    fontWeight: "700",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  destination: {
    fontSize: 12,
    marginTop: 2,
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});

// // src/app/index.tsx
// import { MotiView } from "moti";
// import { useEffect, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   RefreshControl,
//   StatusBar,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import CompactView from "../components/CompactView";
// import FactoryFilter from "../components/FactoryFilter";
// import MainTabs from "../components/MainTabs";
// import ModeSwitch from "../components/ModeSwitch";
// import ViewTabs from "../components/ViewTabs";
// import { fetchShipments } from "../utils/api";
// import { formatTime, getDateKey } from "../utils/helpers";

// interface Shipment {
//   id: string;
//   date: string;
//   licensePlate: string;
//   consignee: string;
//   quantity: number;
//   material: string;
//   division: string;
//   driver?: string;
//   clientRequestNumber?: string;
// }

// interface GroupedData {
//   date: string;
//   items: Shipment[];
// }

// const isConcreteMaterial = (material: string): boolean => {
//   if (!material) return false;
//   const lower = material.toLowerCase();
//   const concreteMarkers = [
//     "бст",
//     "бетон",
//     "раствор",
//     "в25",
//     "в30",
//     "f200",
//     "f300",
//   ];
//   for (const marker of concreteMarkers) {
//     if (lower.includes(marker)) return true;
//   }
//   return false;
// };

// // ✅ ЦВЕТОВАЯ СХЕМА
// const getTheme = (mode: "tas" | "iceberg") => {
//   if (mode === "tas") {
//     return {
//       background: "#f1f5f9",
//       card: "#ffffff",
//       cardBorder: "rgba(0,0,0,0.06)",
//       text: "#1a1a2e",
//       textSecondary: "#64748b",
//       headerBg: "#ffffff",
//       headerBorder: "rgba(0,0,0,0.06)",
//       dateHeader: "#64748b",
//       tabBg: "#f1f5f9",
//       tabActive: "#e2e8f0",
//       badgeBg: "rgba(0,0,0,0.04)",
//       badgeText: "#64748b",
//       plateBg: "#f1f5f9",
//       plateText: "#1a1a2e",
//       quantityBg: "#f1f5f9",
//       quantityText: "#1a1a2e",
//       dotColor: "#22c55e",
//     };

//     // if (mode === "tas") {
//     //   return {
//     //     background: "#f8fafc",
//     //     card: "#ffffff",
//     //     cardBorder: "rgba(0,0,0,0.06)",
//     //     text: "#1a1a2e",
//     //     textSecondary: "#475569",
//     //     headerBg: "#ffffff",
//     //     headerBorder: "rgba(0,0,0,0.06)",
//     //     dateHeader: "#64748b",
//     //     tabBg: "#f1f5f9",
//     //     tabActive: "#e2e8f0",
//     //     badgeBg: "rgba(0,0,0,0.06)",
//     //     badgeText: "#475569",
//     //     plateBg: "#f1f5f9",
//     //     plateText: "#1a1a2e",
//     //     quantityBg: "#f1f5f9",
//     //     quantityText: "#1a1a2e",
//     //     dotColor: "#22c55e",
//     //   };
//   } else {
//     return {
//       background: "#0f0f1a",
//       card: "#1a1a2e",
//       cardBorder: "rgba(255,255,255,0.06)",
//       text: "#ffffff",
//       textSecondary: "#94a3b8",
//       headerBg: "#1a1a2e",
//       headerBorder: "rgba(255,255,255,0.06)",
//       dateHeader: "#94a3b8",
//       tabBg: "#1a1a2e",
//       tabActive: "rgba(255,217,61,0.15)",
//       badgeBg: "rgba(255,255,255,0.06)",
//       badgeText: "#94a3b8",
//       plateBg: "rgba(255,255,255,0.06)",
//       plateText: "#ffffff",
//       quantityBg: "rgba(255,255,255,0.06)",
//       quantityText: "#ffd93d",
//       dotColor: "#4ade80",
//     };
//   }
// };

// export default function HomeScreen() {
//   const [shipments, setShipments] = useState<Shipment[]>([]);
//   const [expandedId, setExpandedId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeTab, setActiveTab] = useState<
//     "incoming" | "shipment" | "shipmentConcrete"
//   >("shipment");
//   const [mode, setMode] = useState<"tas" | "iceberg">("tas");
//   const [activeFactory, setActiveFactory] = useState("all");
//   const [viewTab, setViewTab] = useState<"list" | "compact">("compact");

//   const theme = getTheme(mode);

//   const loadData = async () => {
//     try {
//       const data = await fetchShipments();
//       setShipments(data);
//     } catch (error) {
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   const onRefresh = async () => {
//     setRefreshing(true);
//     await loadData();
//     setRefreshing(false);
//   };

//   const toggleMode = () => {
//     setMode(mode === "tas" ? "iceberg" : "tas");
//     setActiveFactory("all");
//   };

//   // Фильтруем по режиму
//   const validFactories = mode === "tas" ? ["ЛХ", "ЛЮ"] : ["СП", "Щ"];
//   const modeFiltered = shipments.filter((item) =>
//     validFactories.includes(item.division),
//   );

//   // Фильтруем по типу материала
//   const filteredShipments = modeFiltered.filter((item) => {
//     if (activeTab === "incoming") return true;
//     if (activeTab === "shipment") return !isConcreteMaterial(item.material);
//     if (activeTab === "shipmentConcrete")
//       return isConcreteMaterial(item.material);
//     return true;
//   });

//   // Фильтруем по заводу
//   const factories = [
//     ...new Set(modeFiltered.map((item) => item.division)),
//   ].filter(Boolean);
//   const filteredByFactory =
//     activeFactory === "all"
//       ? filteredShipments
//       : filteredShipments.filter((item) => item.division === activeFactory);

//   // Группируем по датам
//   const grouped = filteredByFactory.reduce(
//     (acc: Record<string, Shipment[]>, item: Shipment) => {
//       const key = getDateKey(item.date);
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(item);
//       return acc;
//     },
//     {},
//   );

//   const groupedData: GroupedData[] = Object.keys(grouped)
//     .sort((a, b) => {
//       const [d1, m1, y1] = a.split(".").map(Number);
//       const [d2, m2, y2] = b.split(".").map(Number);
//       return (
//         new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()
//       );
//     })
//     .map((date) => ({
//       date,
//       items: grouped[date],
//     }));

//   const animationKey = `${activeTab}-${activeFactory}-${mode}-${viewTab}`;

//   const renderItem = ({
//     item: group,
//     index,
//   }: {
//     item: GroupedData;
//     index: number;
//   }) => (
//     <MotiView
//       from={{ opacity: 0, translateY: 20 }}
//       animate={{ opacity: 1, translateY: 0 }}
//       transition={{ type: "timing", duration: 400, delay: index * 50 }}
//     >
//       <View style={[styles.dateGroup, { borderBottomColor: theme.cardBorder }]}>
//         <Text style={[styles.dateHeader, { color: theme.dateHeader }]}>
//           {group.date}
//         </Text>
//         {group.items.map((item) => (
//           <TouchableOpacity
//             key={item.id}
//             style={[
//               styles.card,
//               {
//                 backgroundColor: theme.card,
//                 borderColor: theme.cardBorder,
//               },
//             ]}
//             onPress={() =>
//               setExpandedId(expandedId === item.id ? null : item.id)
//             }
//             activeOpacity={0.7}
//           >
//             <View style={styles.cardRow}>
//               <Text style={[styles.time, { color: theme.textSecondary }]}>
//                 {formatTime(item.date)}
//               </Text>
//               <Text
//                 style={[
//                   styles.plate,
//                   { color: theme.text, backgroundColor: theme.plateBg },
//                 ]}
//               >
//                 {item.licensePlate || "—"}
//               </Text>
//               <Text
//                 style={[
//                   styles.quantity,
//                   {
//                     color: theme.quantityText,
//                     backgroundColor: theme.quantityBg,
//                   },
//                 ]}
//               >
//                 {item.quantity.toFixed(1)} т
//               </Text>
//             </View>
//             <Text style={[styles.destination, { color: theme.textSecondary }]}>
//               {item.consignee || "ПК"}
//             </Text>
//             {expandedId === item.id && (
//               <View
//                 style={[styles.details, { borderTopColor: theme.cardBorder }]}
//               >
//                 <Text
//                   style={[styles.detailText, { color: theme.textSecondary }]}
//                 >
//                   📦 Материал: {item.material}
//                 </Text>
//                 <Text
//                   style={[styles.detailText, { color: theme.textSecondary }]}
//                 >
//                   🏭 Завод: {item.division}
//                 </Text>
//                 {item.driver && (
//                   <Text
//                     style={[styles.detailText, { color: theme.textSecondary }]}
//                   >
//                     👤 Водитель: {item.driver}
//                   </Text>
//                 )}
//               </View>
//             )}
//           </TouchableOpacity>
//         ))}
//       </View>
//     </MotiView>
//   );

//   if (loading) {
//     return (
//       <View style={[styles.center, { backgroundColor: theme.background }]}>
//         <ActivityIndicator
//           size="large"
//           color={mode === "tas" ? "#22c55e" : "#ffd93d"}
//         />
//         <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
//           Загрузка...
//         </Text>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: theme.background }]}
//       edges={["top", "left", "right"]}
//     >
//       <StatusBar
//         barStyle={mode === "tas" ? "dark-content" : "light-content"}
//         backgroundColor={theme.background}
//       />

//       <MotiView
//         from={{ opacity: 0, translateY: -20 }}
//         animate={{ opacity: 1, translateY: 0 }}
//         transition={{ type: "spring", duration: 500 }}
//       >
//         <View
//           style={[
//             styles.header,
//             {
//               backgroundColor: theme.headerBg,
//               borderBottomColor: theme.headerBorder,
//             },
//           ]}
//         >
//           <Text style={[styles.headerTitle, { color: theme.text }]}>
//             🏭 АБЗ Контроль
//           </Text>
//           <Text style={[styles.headerCount, { color: theme.textSecondary }]}>
//             {filteredByFactory.length} отгрузок
//           </Text>
//         </View>
//       </MotiView>

//       <ModeSwitch mode={mode} onToggle={toggleMode} />

//       <MainTabs
//         activeTab={activeTab}
//         onTabChange={setActiveTab}
//         showConcreteTab={mode === "iceberg"}
//         theme={theme}
//       />

//       <FactoryFilter
//         factories={factories}
//         activeFactory={activeFactory}
//         onFactoryChange={setActiveFactory}
//         theme={theme}
//       />

//       <ViewTabs activeTab={viewTab} onTabChange={setViewTab} theme={theme} />

//       <MotiView
//         key={animationKey}
//         from={{ opacity: 0, translateY: 20 }}
//         animate={{ opacity: 1, translateY: 0 }}
//         exit={{ opacity: 0, translateY: -20 }}
//         transition={{ type: "timing", duration: 350 }}
//         style={{ flex: 1 }}
//       >
//         {viewTab === "list" ? (
//           <FlatList
//             data={groupedData}
//             keyExtractor={(item) => item.date}
//             renderItem={renderItem}
//             contentContainerStyle={styles.listContent}
//             refreshControl={
//               <RefreshControl
//                 refreshing={refreshing}
//                 onRefresh={onRefresh}
//                 tintColor={mode === "tas" ? "#22c55e" : "#ffd93d"}
//                 colors={[mode === "tas" ? "#22c55e" : "#ffd93d"]}
//               />
//             }
//             ListEmptyComponent={
//               <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
//                 Нет данных
//               </Text>
//             }
//             showsVerticalScrollIndicator={false}
//           />
//         ) : (
//           <CompactView
//             shipments={filteredByFactory}
//             groupedData={groupedData}
//             theme={theme}
//           />
//         )}
//       </MotiView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   headerTitle: {
//     fontSize: 18,
//     fontWeight: "700",
//   },
//   headerCount: {
//     fontSize: 14,
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 20,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//   },
//   dateGroup: {
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     paddingBottom: 4,
//   },
//   dateHeader: {
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 8,
//     paddingBottom: 4,
//   },
//   card: {
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 8,
//     borderWidth: 1,
//   },
//   cardRow: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   time: {
//     fontSize: 12,
//     width: 40,
//   },
//   plate: {
//     fontSize: 14,
//     fontWeight: "600",
//     flex: 1,
//     marginLeft: 8,
//     paddingHorizontal: 4,
//     borderRadius: 4,
//   },
//   quantity: {
//     fontSize: 14,
//     fontWeight: "700",
//     paddingHorizontal: 4,
//     borderRadius: 4,
//   },
//   destination: {
//     fontSize: 12,
//     marginTop: 2,
//   },
//   details: {
//     marginTop: 8,
//     paddingTop: 8,
//     borderTopWidth: 1,
//   },
//   detailText: {
//     fontSize: 12,
//     marginBottom: 2,
//   },
//   emptyText: {
//     fontSize: 16,
//     textAlign: "center",
//     marginTop: 40,
//   },
// });

// // // src/app/index.tsx (полный файл с исправлениями)

// // import { MotiView } from "moti";
// // import { useEffect, useState } from "react";
// // import {
// //   ActivityIndicator,
// //   FlatList,
// //   RefreshControl,
// //   StatusBar,
// //   StyleSheet,
// //   Text,
// //   TouchableOpacity,
// //   View,
// // } from "react-native";
// // import { SafeAreaView } from "react-native-safe-area-context";
// // import CompactView from "../components/CompactView";
// // import FactoryFilter from "../components/FactoryFilter";
// // import MainTabs from "../components/MainTabs";
// // import ModeSwitch from "../components/ModeSwitch";
// // import ViewTabs from "../components/ViewTabs";
// // import { fetchShipments } from "../utils/api";
// // import { formatTime, getDateKey } from "../utils/helpers";

// // // ✅ Цветовая схема
// // const getTheme = (mode: "tas" | "iceberg") => {
// //   if (mode === "tas") {
// //     return {
// //       background: "#f8fafc",
// //       card: "#ffffff",
// //       cardBorder: "rgba(0,0,0,0.06)",
// //       text: "#1a1a2e",
// //       textSecondary: "#475569",
// //       headerBg: "#ffffff",
// //       headerBorder: "rgba(0,0,0,0.06)",
// //       dateHeader: "#64748b",
// //       tabBg: "#f1f5f9",
// //       tabActive: "#e2e8f0",
// //       badgeBg: "rgba(0,0,0,0.06)",
// //       badgeText: "#475569",
// //     };
// //   } else {
// //     return {
// //       background: "#0f0f1a",
// //       card: "#1a1a2e",
// //       cardBorder: "rgba(255,255,255,0.06)",
// //       text: "#ffffff",
// //       textSecondary: "#94a3b8",
// //       headerBg: "#1a1a2e",
// //       headerBorder: "rgba(255,255,255,0.06)",
// //       dateHeader: "#94a3b8",
// //       tabBg: "#1a1a2e",
// //       tabActive: "rgba(255,217,61,0.15)",
// //       badgeBg: "rgba(255,255,255,0.06)",
// //       badgeText: "#94a3b8",
// //     };
// //   }
// // };

// // // Все стили заменяем на динамические через theme

// // interface Shipment {
// //   id: string;
// //   date: string;
// //   licensePlate: string;
// //   consignee: string;
// //   quantity: number;
// //   material: string;
// //   division: string;
// //   driver?: string;
// //   clientRequestNumber?: string;
// // }

// // interface GroupedData {
// //   date: string;
// //   items: Shipment[];
// // }

// // const isConcreteMaterial = (material: string): boolean => {
// //   if (!material) return false;
// //   const lower = material.toLowerCase();
// //   const concreteMarkers = [
// //     "бст",
// //     "бетон",
// //     "раствор",
// //     "в25",
// //     "в30",
// //     "f200",
// //     "f300",
// //   ];
// //   for (const marker of concreteMarkers) {
// //     if (lower.includes(marker)) return true;
// //   }
// //   return false;
// // };

// // export default function HomeScreen() {
// //   const [shipments, setShipments] = useState<Shipment[]>([]);
// //   const [expandedId, setExpandedId] = useState<string | null>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [activeTab, setActiveTab] = useState<
// //     "incoming" | "shipment" | "shipmentConcrete"
// //   >("shipment");
// //   const [mode, setMode] = useState<"tas" | "iceberg">("tas");
// //   const [activeFactory, setActiveFactory] = useState("all");
// //   const [viewTab, setViewTab] = useState<"list" | "compact">("compact");

// //   // Внутри компонента, после useState:
// //   const theme = getTheme(mode);

// //   const loadData = async () => {
// //     try {
// //       const data = await fetchShipments();
// //       setShipments(data);
// //     } catch (error) {
// //       console.error(error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadData();
// //   }, []);

// //   const onRefresh = async () => {
// //     setRefreshing(true);
// //     await loadData();
// //     setRefreshing(false);
// //   };

// //   const toggleMode = () => {
// //     setMode(mode === "tas" ? "iceberg" : "tas");
// //     setActiveFactory("all");
// //   };

// //   // Фильтруем по режиму (ТАС или Айсберг)
// //   const validFactories = mode === "tas" ? ["ЛХ", "ЛЮ"] : ["СП", "Щ"];
// //   const modeFiltered = shipments.filter((item) =>
// //     validFactories.includes(item.division),
// //   );

// //   // ✅ ПРАВИЛЬНАЯ ФИЛЬТРАЦИЯ ПО ТИПУ МАТЕРИАЛА
// //   const filteredShipments = modeFiltered.filter((item) => {
// //     if (activeTab === "incoming") return true;
// //     if (activeTab === "shipment") return !isConcreteMaterial(item.material);
// //     if (activeTab === "shipmentConcrete")
// //       return isConcreteMaterial(item.material);
// //     return true;
// //   });

// //   // Фильтруем по заводу
// //   const factories = [
// //     ...new Set(modeFiltered.map((item) => item.division)),
// //   ].filter(Boolean);
// //   const filteredByFactory =
// //     activeFactory === "all"
// //       ? filteredShipments
// //       : filteredShipments.filter((item) => item.division === activeFactory);

// //   // Группируем по датам
// //   const grouped = filteredByFactory.reduce(
// //     (acc: Record<string, Shipment[]>, item: Shipment) => {
// //       const key = getDateKey(item.date);
// //       if (!acc[key]) acc[key] = [];
// //       acc[key].push(item);
// //       return acc;
// //     },
// //     {},
// //   );

// //   const groupedData: GroupedData[] = Object.keys(grouped)
// //     .sort((a, b) => {
// //       const [d1, m1, y1] = a.split(".").map(Number);
// //       const [d2, m2, y2] = b.split(".").map(Number);
// //       return (
// //         new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()
// //       );
// //     })
// //     .map((date) => ({
// //       date,
// //       items: grouped[date],
// //     }));

// //   // ✅ КЛЮЧ ДЛЯ АНИМАЦИИ
// //   const animationKey = `${activeTab}-${activeFactory}-${mode}-${viewTab}`;

// //   const renderItem = ({
// //     item: group,
// //     index,
// //   }: {
// //     item: GroupedData;
// //     index: number;
// //   }) => (
// //     <MotiView
// //       from={{ opacity: 0, translateY: 20 }}
// //       animate={{ opacity: 1, translateY: 0 }}
// //       transition={{ type: "timing", duration: 400, delay: index * 50 }}
// //     >
// //       <View style={styles.dateGroup}>
// //         <Text style={styles.dateHeader}>{group.date}</Text>
// //         {group.items.map((item) => (
// //           <TouchableOpacity
// //             key={item.id}
// //             style={styles.card}
// //             onPress={() =>
// //               setExpandedId(expandedId === item.id ? null : item.id)
// //             }
// //             activeOpacity={0.7}
// //           >
// //             <View style={styles.cardRow}>
// //               <Text style={styles.time}>{formatTime(item.date)}</Text>
// //               <Text style={styles.plate}>{item.licensePlate || "—"}</Text>
// //               <Text style={styles.quantity}>{item.quantity.toFixed(1)} т</Text>
// //             </View>
// //             <Text style={styles.destination}>{item.consignee || "ПК"}</Text>
// //             {expandedId === item.id && (
// //               <View style={styles.details}>
// //                 <Text style={styles.detailText}>
// //                   📦 Материал: {item.material}
// //                 </Text>
// //                 <Text style={styles.detailText}>🏭 Завод: {item.division}</Text>
// //                 {item.driver && (
// //                   <Text style={styles.detailText}>
// //                     👤 Водитель: {item.driver}
// //                   </Text>
// //                 )}
// //               </View>
// //             )}
// //           </TouchableOpacity>
// //         ))}
// //       </View>
// //     </MotiView>
// //   );

// //   if (loading) {
// //     return (
// //       <View style={styles.center}>
// //         <ActivityIndicator size="large" color="#ffd93d" />
// //         <Text style={styles.loadingText}>Загрузка...</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
// //       <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

// //       <MotiView
// //         from={{ opacity: 0, translateY: -20 }}
// //         animate={{ opacity: 1, translateY: 0 }}
// //         transition={{ type: "spring", duration: 500 }}
// //       >
// //         <View style={styles.header}>
// //           <Text style={styles.headerTitle}>🏭 АБЗ Контроль</Text>
// //           <Text style={styles.headerCount}>
// //             {filteredByFactory.length} отгрузок
// //           </Text>
// //         </View>
// //       </MotiView>

// //       <ModeSwitch mode={mode} onToggle={toggleMode} />

// //       <MainTabs
// //         activeTab={activeTab}
// //         onTabChange={setActiveTab}
// //         showConcreteTab={mode === "iceberg"}
// //       />

// //       <FactoryFilter
// //         factories={factories}
// //         activeFactory={activeFactory}
// //         onFactoryChange={setActiveFactory}
// //       />

// //       <ViewTabs activeTab={viewTab} onTabChange={setViewTab} />

// //       <MotiView
// //         key={animationKey}
// //         from={{ opacity: 0, translateY: 20 }}
// //         animate={{ opacity: 1, translateY: 0 }}
// //         exit={{ opacity: 0, translateY: -20 }}
// //         transition={{ type: "timing", duration: 350 }}
// //         style={{ flex: 1 }}
// //       >
// //         {viewTab === "list" ? (
// //           <FlatList
// //             data={groupedData}
// //             keyExtractor={(item) => item.date}
// //             renderItem={renderItem}
// //             contentContainerStyle={styles.listContent}
// //             refreshControl={
// //               <RefreshControl
// //                 refreshing={refreshing}
// //                 onRefresh={onRefresh}
// //                 tintColor="#ffd93d"
// //                 colors={["#ffd93d"]}
// //               />
// //             }
// //             ListEmptyComponent={
// //               <Text style={styles.emptyText}>Нет данных</Text>
// //             }
// //             showsVerticalScrollIndicator={false}
// //           />
// //         ) : (
// //           <CompactView
// //             shipments={filteredByFactory}
// //             groupedData={groupedData}
// //           />
// //         )}
// //       </MotiView>
// //     </SafeAreaView>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     backgroundColor: "#0f0f1a",
// //   },
// //   header: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     alignItems: "center",
// //     paddingHorizontal: 16,
// //     paddingVertical: 12,
// //     backgroundColor: "#1a1a2e",
// //     borderBottomWidth: 1,
// //     borderBottomColor: "rgba(255,255,255,0.06)",
// //   },
// //   headerTitle: {
// //     color: "#fff",
// //     fontSize: 18,
// //     fontWeight: "700",
// //   },
// //   headerCount: {
// //     color: "#94a3b8",
// //     fontSize: 14,
// //   },
// //   listContent: {
// //     paddingHorizontal: 16,
// //     paddingTop: 8,
// //     paddingBottom: 20,
// //   },
// //   center: {
// //     flex: 1,
// //     justifyContent: "center",
// //     alignItems: "center",
// //     backgroundColor: "#0f0f1a",
// //   },
// //   loadingText: {
// //     color: "#94a3b8",
// //     marginTop: 12,
// //   },
// //   dateGroup: {
// //     marginBottom: 16,
// //   },
// //   dateHeader: {
// //     color: "#94a3b8",
// //     fontSize: 14,
// //     fontWeight: "600",
// //     marginBottom: 8,
// //     borderBottomWidth: 1,
// //     borderBottomColor: "rgba(255,255,255,0.06)",
// //     paddingBottom: 4,
// //   },
// //   card: {
// //     backgroundColor: "#1a1a2e",
// //     borderRadius: 10,
// //     padding: 12,
// //     marginBottom: 8,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.06)",
// //   },
// //   cardRow: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   time: {
// //     color: "#94a3b8",
// //     fontSize: 12,
// //     width: 40,
// //   },
// //   plate: {
// //     color: "#fff",
// //     fontSize: 14,
// //     fontWeight: "600",
// //     flex: 1,
// //     marginLeft: 8,
// //   },
// //   quantity: {
// //     color: "#ffd93d",
// //     fontSize: 14,
// //     fontWeight: "700",
// //   },
// //   destination: {
// //     color: "#94a3b8",
// //     fontSize: 12,
// //     marginTop: 2,
// //   },
// //   details: {
// //     marginTop: 8,
// //     paddingTop: 8,
// //     borderTopWidth: 1,
// //     borderTopColor: "rgba(255,255,255,0.06)",
// //   },
// //   detailText: {
// //     color: "#94a3b8",
// //     fontSize: 12,
// //     marginBottom: 2,
// //   },
// //   emptyText: {
// //     color: "#94a3b8",
// //     fontSize: 16,
// //     textAlign: "center",
// //     marginTop: 40,
// //   },
// // });
