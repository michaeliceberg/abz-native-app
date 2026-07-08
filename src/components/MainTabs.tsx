// src/components/MainTabs.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MainTabsProps {
  activeTab: "incoming" | "shipment" | "shipmentConcrete";
  onTabChange: (tab: "incoming" | "shipment" | "shipmentConcrete") => void;
  showConcreteTab?: boolean;
  theme?: any; // ✅ Добавляем
}

export default function MainTabs({
  activeTab,
  onTabChange,
  showConcreteTab = false,
  theme,
}: MainTabsProps) {
  const tabs = [
    { key: "incoming", label: "🚢 Поступление" },
    { key: "shipment", label: "🚛 Отгрузка Асф" },
  ];

  if (showConcreteTab) {
    tabs.push({ key: "shipmentConcrete", label: "🧱 Отгрузка Бет" });
  }

  const bgColor = theme?.tabBg || "#1a1a2e";
  const activeBgColor = theme?.tabActive || "rgba(255,217,61,0.15)";
  const textColor = theme?.textSecondary || "#94a3b8";
  const activeTextColor = theme?.text || "#ffd93d";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tab,
            activeTab === tab.key && { backgroundColor: activeBgColor },
          ]}
          onPress={() => onTabChange(tab.key as any)}
        >
          <Text
            style={[
              styles.tabText,
              { color: textColor },
              activeTab === tab.key && {
                color: activeTextColor,
                fontWeight: "700",
              },
            ]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

// // src/components/MainTabs.tsx
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// interface MainTabsProps {
//   activeTab: "incoming" | "shipment" | "shipmentConcrete";
//   onTabChange: (tab: "incoming" | "shipment" | "shipmentConcrete") => void;
//   showConcreteTab?: boolean;
// }

// export default function MainTabs({
//   activeTab,
//   onTabChange,
//   showConcreteTab = false,
// }: MainTabsProps) {
//   const tabs = [
//     { key: "incoming", label: "🚢 Поступление" },
//     { key: "shipment", label: "🚛 Отгрузка Асф" },
//   ];

//   if (showConcreteTab) {
//     tabs.push({ key: "shipmentConcrete", label: "🧱 Отгрузка Бет" });
//   }

//   return (
//     <View style={styles.container}>
//       {tabs.map((tab) => (
//         <TouchableOpacity
//           key={tab.key}
//           style={[styles.tab, activeTab === tab.key && styles.activeTab]}
//           onPress={() => onTabChange(tab.key as any)}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               activeTab === tab.key && styles.activeTabText,
//             ]}
//           >
//             {tab.label}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     backgroundColor: "#1a1a2e",
//     borderRadius: 10,
//     padding: 4,
//     marginHorizontal: 16,
//     marginVertical: 8,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 8,
//     alignItems: "center",
//     borderRadius: 8,
//   },
//   activeTab: {
//     backgroundColor: "rgba(255,217,61,0.15)",
//   },
//   tabText: {
//     color: "#94a3b8",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   activeTabText: {
//     color: "#ffd93d",
//     fontWeight: "700",
//   },
// });
