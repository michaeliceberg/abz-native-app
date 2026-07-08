// src/components/ViewTabs.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ViewTab = "list" | "compact";

interface ViewTabsProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  theme?: any; // ✅ Добавляем
}

export default function ViewTabs({
  activeTab,
  onTabChange,
  theme,
}: ViewTabsProps) {
  const bgColor = theme?.tabBg || "#1a1a2e";
  const activeBgColor = theme?.tabActive || "rgba(255,217,61,0.15)";
  const textColor = theme?.textSecondary || "#94a3b8";
  const activeTextColor = theme?.text || "#ffd93d";

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "list" && { backgroundColor: activeBgColor },
        ]}
        onPress={() => onTabChange("list")}
      >
        <Text
          style={[
            styles.text,
            { color: textColor },
            activeTab === "list" && {
              color: activeTextColor,
              fontWeight: "600",
            },
          ]}
        >
          📋 Список
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === "compact" && { backgroundColor: activeBgColor },
        ]}
        onPress={() => onTabChange("compact")}
      >
        <Text
          style={[
            styles.text,
            { color: textColor },
            activeTab === "compact" && {
              color: activeTextColor,
              fontWeight: "600",
            },
          ]}
        >
          📊 Компактно
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});

// // src/components/ViewTabs.tsx
// import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// type ViewTab = "list" | "compact";

// interface ViewTabsProps {
//   activeTab: ViewTab;
//   onTabChange: (tab: ViewTab) => void;
// }

// export default function ViewTabs({ activeTab, onTabChange }: ViewTabsProps) {
//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.tab, activeTab === "list" && styles.activeTab]}
//         onPress={() => onTabChange("list")}
//       >
//         <Text style={[styles.text, activeTab === "list" && styles.activeText]}>
//           📋 Список
//         </Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         style={[styles.tab, activeTab === "compact" && styles.activeTab]}
//         onPress={() => onTabChange("compact")}
//       >
//         <Text
//           style={[styles.text, activeTab === "compact" && styles.activeText]}
//         >
//           📊 Компактно
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     backgroundColor: "#1a1a2e",
//     borderRadius: 8,
//     padding: 3,
//     marginHorizontal: 16,
//     marginVertical: 4,
//   },
//   tab: {
//     flex: 1,
//     paddingVertical: 6,
//     alignItems: "center",
//     borderRadius: 6,
//   },
//   activeTab: {
//     backgroundColor: "rgba(255,217,61,0.15)",
//   },
//   text: {
//     color: "#94a3b8",
//     fontSize: 13,
//     fontWeight: "500",
//   },
//   activeText: {
//     color: "#ffd93d",
//     fontWeight: "600",
//   },
// });
