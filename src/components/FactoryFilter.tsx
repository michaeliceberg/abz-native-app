// src/components/FactoryFilter.tsx
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface FactoryFilterProps {
  factories: string[];
  activeFactory: string;
  onFactoryChange: (factory: string) => void;
  theme?: any; // ✅ Добавляем
}

export default function FactoryFilter({
  factories,
  activeFactory,
  onFactoryChange,
  theme,
}: FactoryFilterProps) {
  const getFactoryLabel = (code: string) => {
    switch (code) {
      case "ЛХ":
        return "Луховицы";
      case "ЛЮ":
        return "Люберцы";
      case "СП":
        return "Сергиев Посад";
      case "Щ":
        return "Щёлково";
      default:
        return code;
    }
  };

  const allButtons = ["all", ...factories];
  const bgColor = theme?.badgeBg || "rgba(255,255,255,0.06)";
  const borderColor = theme?.cardBorder || "rgba(255,255,255,0.06)";
  const textColor = theme?.badgeText || "#94a3b8";
  const activeBgColor = "rgba(255,217,61,0.15)";
  const activeTextColor = "#ffd93d";

  return (
    <View style={styles.container}>
      {allButtons.map((factory) => (
        <TouchableOpacity
          key={factory}
          style={[
            styles.button,
            {
              backgroundColor:
                activeFactory === factory ? activeBgColor : bgColor,
              borderColor: activeFactory === factory ? "#ffd93d" : borderColor,
            },
          ]}
          onPress={() => onFactoryChange(factory)}
        >
          <Text
            style={[
              styles.text,
              {
                color: activeFactory === factory ? activeTextColor : textColor,
                fontWeight: activeFactory === factory ? "600" : "500",
              },
            ]}
            numberOfLines={1}
          >
            {factory === "all" ? "📦 Все" : getFactoryLabel(factory)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginHorizontal: 12,
    marginVertical: 4,
  },
  button: {
    flex: 1,
    minWidth: 60,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 28,
  },
  text: {
    fontSize: 10,
    lineHeight: 14,
  },
});

// // src/components/FactoryFilter.tsx
// import {
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View
// } from "react-native";

// interface FactoryFilterProps {
//   factories: string[];
//   activeFactory: string;
//   onFactoryChange: (factory: string) => void;
// }

// export default function FactoryFilter({
//   factories,
//   activeFactory,
//   onFactoryChange,
// }: FactoryFilterProps) {
//   const getFactoryLabel = (code: string) => {
//     switch (code) {
//       case "ЛХ":
//         return "Луховицы";
//       case "ЛЮ":
//         return "Люберцы";
//       case "СП":
//         return "Сергиев Посад";
//       case "Щ":
//         return "Щёлково";
//       default:
//         return code;
//     }
//   };

//   // Все кнопки: "Все" + заводы
//   const allButtons = ["all", ...factories];

//   return (
//     <View style={styles.container}>
//       {allButtons.map((factory) => (
//         <TouchableOpacity
//           key={factory}
//           style={[
//             styles.button,
//             activeFactory === factory && styles.activeButton,
//           ]}
//           onPress={() => onFactoryChange(factory)}
//         >
//           <Text
//             style={[
//               styles.text,
//               activeFactory === factory && styles.activeText,
//             ]}
//             numberOfLines={1}
//           >
//             {factory === "all" ? "📦 Все" : getFactoryLabel(factory)}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: "row",
//     flexWrap: "wrap",
//     gap: 4,
//     marginHorizontal: 12,
//     marginVertical: 4,
//   },
//   button: {
//     flex: 1,
//     minWidth: 60,
//     paddingVertical: 4, // ✅ уменьшено с 6 до 4
//     paddingHorizontal: 6,
//     borderRadius: 12,
//     backgroundColor: "rgba(255,255,255,0.06)",
//     borderWidth: 1,
//     borderColor: "rgba(255,255,255,0.06)",
//     justifyContent: "center",
//     alignItems: "center",
//     minHeight: 28, // ✅ уменьшено с 32 до 28
//   },
//   activeButton: {
//     backgroundColor: "rgba(255,217,61,0.15)",
//     borderColor: "#ffd93d",
//   },
//   text: {
//     color: "#94a3b8",
//     fontSize: 10, // ✅ уменьшено с 11 до 10
//     fontWeight: "500",
//     lineHeight: 14,
//   },
//   activeText: {
//     color: "#ffd93d",
//     fontWeight: "600",
//   },
// });
