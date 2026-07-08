// src/components/CompactView.tsx
import { MotiView } from "moti";
import { useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { formatTime } from "../utils/helpers";

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

interface CompactViewProps {
  shipments: Shipment[];
  groupedData: { date: string; items: Shipment[] }[];
  theme?: any; // ✅ Добавляем
}

export default function CompactView({
  shipments,
  groupedData,
  theme,
}: CompactViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const groupByRequest = (items: Shipment[]) => {
    const groups: Record<
      string,
      { items: Shipment[]; total: number; consignee: string; division: string }
    > = {};

    items.forEach((item) => {
      const key = item.clientRequestNumber || item.id;
      if (!groups[key]) {
        groups[key] = {
          items: [],
          total: 0,
          consignee: item.consignee || "ПК",
          division: item.division,
        };
      }
      groups[key].items.push(item);
      groups[key].total += item.quantity;
    });

    return Object.values(groups);
  };

  const renderCompactItem = ({ item, index }: { item: any; index: number }) => {
    const isExpanded = expandedId === item.items[0]?.id;
    const bgColor = theme?.card || "#1a1a2e";
    const borderColor = theme?.cardBorder || "rgba(255,255,255,0.06)";
    const textColor = theme?.text || "#fff";
    const textSecondary = theme?.textSecondary || "#94a3b8";
    const factColor = theme?.text || "#e2e8f0";
    const planColor = theme?.textSecondary || "#94a3b8";

    return (
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 300, delay: index * 50 }}
        style={[styles.compactCard, { backgroundColor: bgColor, borderColor }]}
      >
        <TouchableOpacity
          style={styles.compactHeader}
          onPress={() => setExpandedId(isExpanded ? null : item.items[0]?.id)}
          activeOpacity={0.7}
        >
          <View style={styles.compactRow}>
            <Text style={[styles.compactTime, { color: textSecondary }]}>
              {item.items.length > 0
                ? formatTime(item.items[0]?.date)
                : "--:--"}
            </Text>
            <Text style={[styles.compactFact, { color: factColor }]}>
              {Math.round(item.total)}
            </Text>
            <Text style={[styles.compactSlash, { color: textSecondary }]}>
              /
            </Text>
            <Text style={[styles.compactPlan, { color: planColor }]}>
              {item.items.length > 0
                ? Math.round(item.items[0]?.quantity || 0)
                : "—"}
            </Text>
            <Text
              style={[styles.compactConsignee, { color: textColor }]}
              numberOfLines={1}
            >
              {item.consignee}
            </Text>
            <View
              style={[
                styles.factoryBadge,
                { backgroundColor: theme?.badgeBg || "rgba(74,222,128,0.12)" },
              ]}
            >
              <Text
                style={[
                  styles.factoryBadgeText,
                  { color: theme?.dotColor || "#4ade80" },
                ]}
              >
                {item.division}
              </Text>
            </View>
            <Text style={[styles.compactTrucks, { color: textSecondary }]}>
              {item.items.length}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View
            style={[styles.expandedContent, { borderTopColor: borderColor }]}
          >
            {item.items.map((shipment: Shipment, idx: number) => (
              <View key={idx} style={styles.vehicleItem}>
                <Text style={[styles.vehicleTime, { color: textSecondary }]}>
                  {formatTime(shipment.date)}
                </Text>
                <Text style={[styles.vehiclePlate, { color: textColor }]}>
                  {shipment.licensePlate || "—"}
                </Text>
                <Text style={[styles.vehicleDriver, { color: textSecondary }]}>
                  👤 {shipment.driver || "—"}
                </Text>
                <Text
                  style={[
                    styles.vehicleQuantity,
                    { color: theme?.quantityText || "#ffd93d" },
                  ]}
                >
                  {shipment.quantity.toFixed(1)} т
                </Text>
              </View>
            ))}
          </View>
        )}
      </MotiView>
    );
  };

  return (
    <FlatList
      data={groupedData}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <View style={styles.dateGroup}>
          <Text
            style={[
              styles.dateHeader,
              { color: theme?.dateHeader || "#94a3b8" },
            ]}
          >
            {item.date}
          </Text>
          <FlatList
            data={groupByRequest(item.items)}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderCompactItem}
            scrollEnabled={false}
          />
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 16,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    paddingBottom: 4,
  },
  compactCard: {
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    overflow: "hidden",
  },
  compactHeader: {
    padding: 10,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  compactTime: {
    fontSize: 11,
    width: 38,
  },
  compactFact: {
    fontSize: 13,
    fontWeight: "600",
    width: 30,
    textAlign: "right",
  },
  compactSlash: {
    fontSize: 13,
    width: 10,
    textAlign: "center",
  },
  compactPlan: {
    fontSize: 13,
    width: 40,
    textAlign: "right",
  },
  compactConsignee: {
    fontSize: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  factoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  factoryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  compactTrucks: {
    fontSize: 12,
    width: 20,
    textAlign: "center",
  },
  expandedContent: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
  },
  vehicleItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    gap: 6,
  },
  vehicleTime: {
    fontSize: 10,
    width: 38,
  },
  vehiclePlate: {
    fontSize: 11,
    fontWeight: "500",
    flex: 1,
  },
  vehicleDriver: {
    fontSize: 10,
    width: 60,
  },
  vehicleQuantity: {
    fontSize: 11,
    fontWeight: "600",
    width: 50,
    textAlign: "right",
  },
});

// // src/components/CompactView.tsx
// import { useState } from "react";
// import {
//     FlatList,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import { formatTime } from "../utils/helpers";

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

// interface CompactViewProps {
//   shipments: Shipment[];
//   groupedData: { date: string; items: Shipment[] }[];
// }

// export default function CompactView({
//   shipments,
//   groupedData,
// }: CompactViewProps) {
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   // Группируем по clientRequestNumber (заявкам)
//   const groupByRequest = (items: Shipment[]) => {
//     const groups: Record<
//       string,
//       { items: Shipment[]; total: number; consignee: string; division: string }
//     > = {};

//     items.forEach((item) => {
//       const key = item.clientRequestNumber || item.id;
//       if (!groups[key]) {
//         groups[key] = {
//           items: [],
//           total: 0,
//           consignee: item.consignee || "ПК",
//           division: item.division,
//         };
//       }
//       groups[key].items.push(item);
//       groups[key].total += item.quantity;
//     });

//     return Object.values(groups);
//   };

//   const renderCompactItem = ({ item }: { item: any }) => {
//     const isExpanded = expandedId === item.items[0]?.id;

//     return (
//       <View style={styles.compactCard}>
//         <TouchableOpacity
//           style={styles.compactHeader}
//           onPress={() => setExpandedId(isExpanded ? null : item.items[0]?.id)}
//           activeOpacity={0.7}
//         >
//           <View style={styles.compactRow}>
//             <Text style={styles.compactTime}>
//               {item.items.length > 0
//                 ? formatTime(item.items[0]?.date)
//                 : "--:--"}
//             </Text>
//             <Text style={styles.compactFact}>{Math.round(item.total)}</Text>
//             <Text style={styles.compactSlash}>/</Text>
//             <Text style={styles.compactPlan}>
//               {item.items.length > 0
//                 ? Math.round(item.items[0]?.quantity || 0)
//                 : "—"}
//             </Text>
//             <Text style={styles.compactConsignee} numberOfLines={1}>
//               {item.consignee}
//             </Text>
//             <View style={styles.factoryBadge}>
//               <Text style={styles.factoryBadgeText}>{item.division}</Text>
//             </View>
//             <Text style={styles.compactTrucks}>{item.items.length}</Text>
//           </View>
//         </TouchableOpacity>

//         {isExpanded && (
//           <View style={styles.expandedContent}>
//             {item.items.map((shipment: Shipment, idx: number) => (
//               <View key={idx} style={styles.vehicleItem}>
//                 <Text style={styles.vehicleTime}>
//                   {formatTime(shipment.date)}
//                 </Text>
//                 <Text style={styles.vehiclePlate}>
//                   {shipment.licensePlate || "—"}
//                 </Text>
//                 <Text style={styles.vehicleDriver}>
//                   👤 {shipment.driver || "—"}
//                 </Text>
//                 <Text style={styles.vehicleQuantity}>
//                   {shipment.quantity.toFixed(1)} т
//                 </Text>
//               </View>
//             ))}
//           </View>
//         )}
//       </View>
//     );
//   };

//   return (
//     <FlatList
//       data={groupedData}
//       keyExtractor={(item) => item.date}
//       renderItem={({ item }) => (
//         <View style={styles.dateGroup}>
//           <Text style={styles.dateHeader}>{item.date}</Text>
//           <FlatList
//             data={groupByRequest(item.items)}
//             keyExtractor={(_, index) => index.toString()}
//             renderItem={renderCompactItem}
//             scrollEnabled={false}
//           />
//         </View>
//       )}
//       contentContainerStyle={styles.listContent}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   listContent: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//     paddingBottom: 20,
//   },
//   dateGroup: {
//     marginBottom: 16,
//   },
//   dateHeader: {
//     color: "#94a3b8",
//     fontSize: 14,
//     fontWeight: "600",
//     marginBottom: 8,
//     borderBottomWidth: 1,
//     borderBottomColor: "rgba(255,255,255,0.06)",
//     paddingBottom: 4,
//   },
//   compactCard: {
//     backgroundColor: "#1a1a2e",
//     borderRadius: 10,
//     marginBottom: 6,
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//     overflow: "hidden",
//   },
//   compactHeader: {
//     padding: 10,
//   },
//   compactRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 6,
//   },
//   compactTime: {
//     color: "#94a3b8",
//     fontSize: 11,
//     width: 38,
//   },
//   compactFact: {
//     color: "#e2e8f0",
//     fontSize: 13,
//     fontWeight: "600",
//     width: 30,
//     textAlign: "right",
//   },
//   compactSlash: {
//     color: "#64748b",
//     fontSize: 13,
//     width: 10,
//     textAlign: "center",
//   },
//   compactPlan: {
//     color: "#94a3b8",
//     fontSize: 13,
//     width: 40,
//     textAlign: "right",
//   },
//   compactConsignee: {
//     color: "#e2e8f0",
//     fontSize: 12,
//     flex: 1,
//     marginHorizontal: 4,
//   },
//   factoryBadge: {
//     backgroundColor: "rgba(74,222,128,0.12)",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//   },
//   factoryBadgeText: {
//     color: "#4ade80",
//     fontSize: 10,
//     fontWeight: "600",
//   },
//   compactTrucks: {
//     color: "#94a3b8",
//     fontSize: 12,
//     width: 20,
//     textAlign: "center",
//   },
//   expandedContent: {
//     paddingHorizontal: 10,
//     paddingBottom: 10,
//     borderTopWidth: 1,
//     borderTopColor: "rgba(255,255,255,0.04)",
//   },
//   vehicleItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingVertical: 3,
//     gap: 6,
//   },
//   vehicleTime: {
//     color: "#64748b",
//     fontSize: 10,
//     width: 38,
//   },
//   vehiclePlate: {
//     color: "#e2e8f0",
//     fontSize: 11,
//     fontWeight: "500",
//     flex: 1,
//   },
//   vehicleDriver: {
//     color: "#64748b",
//     fontSize: 10,
//     width: 60,
//   },
//   vehicleQuantity: {
//     color: "#ffd93d",
//     fontSize: 11,
//     fontWeight: "600",
//     width: 50,
//     textAlign: "right",
//   },
// });
