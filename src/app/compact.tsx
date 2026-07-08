// src/app/compact.tsx

import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // ✅ Правильный импорт
import { fetchShipments } from "../utils/api";
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

export default function CompactView() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Группируем по датам
  const grouped = shipments.reduce(
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

  const renderItem = ({ item: group }: { item: GroupedData }) => (
    <View style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{group.date}</Text>

      {group.items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.card}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.cardRow}>
            <Text style={styles.time}>{formatTime(item.date)}</Text>
            <Text style={styles.plate}>{item.licensePlate || "—"}</Text>
            <Text style={styles.quantity}>{item.quantity.toFixed(1)} т</Text>
          </View>

          <Text style={styles.destination}>{item.consignee || "ПК"}</Text>

          {expandedId === item.id && (
            <View style={styles.details}>
              <Text style={styles.detailText}>
                📦 Материал: {item.material}
              </Text>
              <Text style={styles.detailText}>🏭 Завод: {item.division}</Text>
              {item.driver && (
                <Text style={styles.detailText}>
                  👤 Водитель: {item.driver}
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffd93d" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <FlatList
        data={groupedData}
        keyExtractor={(item) => item.date}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffd93d"
            colors={["#ffd93d"]}
          />
        }
        ListEmptyComponent={<Text style={styles.emptyText}>Нет данных</Text>}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 12,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 4,
  },
  card: {
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  time: {
    color: "#94a3b8",
    fontSize: 12,
    width: 40,
  },
  plate: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  quantity: {
    color: "#ffd93d",
    fontSize: 14,
    fontWeight: "700",
  },
  destination: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 2,
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  detailText: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 2,
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },
});
