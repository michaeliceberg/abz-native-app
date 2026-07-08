// src/components/ModeSwitch.tsx
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ModeSwitchProps {
  mode: "tas" | "iceberg";
  onToggle: () => void;
}

export default function ModeSwitch({ mode, onToggle }: ModeSwitchProps) {
  const [tasSyncTime, setTasSyncTime] = useState<string | null>(null);
  const [icebergSyncTime, setIcebergSyncTime] = useState<string | null>(null);

  const formatSyncTime = (timestamp: string | null): string => {
    if (!timestamp) return "никогда";
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}.${month} ${hours}:${minutes}`;
  };

  const getSyncBadgeStyle = (syncTime: string | null) => {
    if (!syncTime) {
      return { text: "никогда", color: "#fff", bgColor: "#dc3545" };
    }
    const now = new Date();
    const syncDate = new Date(syncTime);
    const diffMinutes = (now.getTime() - syncDate.getTime()) / (1000 * 60);
    if (diffMinutes < 25) {
      return {
        text: formatSyncTime(syncTime),
        color: "#155724",
        bgColor: "#d4edda",
      };
    } else {
      return {
        text: formatSyncTime(syncTime),
        color: "#721c24",
        bgColor: "#f8d7da",
      };
    }
  };

  const fetchSyncInfo = async () => {
    try {
      const [tasRes, icebergRes] = await Promise.all([
        fetch("https://abziceberg.ru/api/cron-info"),
        fetch("https://abziceberg.ru/api/last-import-info"),
      ]);
      const tasData = await tasRes.json();
      const icebergData = await icebergRes.json();
      if (tasData.lastSync) setTasSyncTime(tasData.lastSync);
      if (icebergData.lastImport) setIcebergSyncTime(icebergData.lastImport);
    } catch (error) {
      console.error("Ошибка загрузки времени синхронизации:", error);
    }
  };

  useEffect(() => {
    fetchSyncInfo();
    const interval = setInterval(fetchSyncInfo, 30000);
    return () => clearInterval(interval);
  }, []);

  const tasSync = getSyncBadgeStyle(tasSyncTime);
  const icebergSync = getSyncBadgeStyle(icebergSyncTime);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, mode === "tas" && styles.activeButton]}
        onPress={() => mode !== "tas" && onToggle()}
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.label, mode === "tas" && styles.activeLabel]}>
            ☀️ ТАС
          </Text>
          <Text style={styles.subLabel}>Транс-Авто-Сервис</Text>
          <View style={[styles.badge, { backgroundColor: tasSync.bgColor }]}>
            <Text style={[styles.badgeText, { color: tasSync.color }]}>
              🔄 {tasSync.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, mode === "iceberg" && styles.activeButton]}
        onPress={() => mode !== "iceberg" && onToggle()}
      >
        <View style={styles.buttonContent}>
          <Text
            style={[styles.label, mode === "iceberg" && styles.activeLabel]}
          >
            🏔️ Айсберг
          </Text>
          <Text style={styles.subLabel}>Щёлково • Сергиев Посад</Text>
          <View
            style={[styles.badge, { backgroundColor: icebergSync.bgColor }]}
          >
            <Text style={[styles.badgeText, { color: icebergSync.color }]}>
              🔄 {icebergSync.text}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#1a1a2e",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeButton: {
    backgroundColor: "rgba(255,217,61,0.12)",
  },
  buttonContent: {
    alignItems: "center",
    gap: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94a3b8",
  },
  activeLabel: {
    color: "#ffd93d",
  },
  subLabel: {
    fontSize: 9,
    fontWeight: "400",
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "500",
  },
});

// // src/components/ModeSwitch.tsx
// import React, { useEffect, useState } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// import { fetchSyncInfo } from '../utils/api';

// interface ModeSwitchProps {
//   mode: 'tas' | 'iceberg';
//   onToggle: () => void;
// }

// export default function ModeSwitch({ mode, onToggle }: ModeSwitchProps) {
//   const [tasSyncTime, setTasSyncTime] = useState<string | null>(null);
//   const [icebergSyncTime, setIcebergSyncTime] = useState<string | null>(null);

//   const formatSyncTime = (timestamp: string | null): string => {
//     if (!timestamp) return 'никогда';
//     const date = new Date(timestamp);
//     const day = date.getDate().toString().padStart(2, '0');
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const hours = date.getHours().toString().padStart(2, '0');
//     const minutes = date.getMinutes().toString().padStart(2, '0');
//     return `${day}.${month} ${hours}:${minutes}`;
//   };

//   const getSyncBadgeStyle = (syncTime: string | null) => {
//     if (!syncTime) {
//       return { text: 'никогда', color: '#fff', bgColor: '#dc3545' };
//     }
//     const now = new Date();
//     const syncDate = new Date(syncTime);
//     const diffMinutes = (now.getTime() - syncDate.getTime()) / (1000 * 60);
//     if (diffMinutes < 25) {
//       return { text: formatSyncTime(syncTime), color: '#155724', bgColor: '#d4edda' };
//     } else {
//       return { text: formatSyncTime(syncTime), color: '#721c24', bgColor: '#f8d7da' };
//     }
//   };

//   const fetchSyncInfo = async () => {
//     try {
//       // Используем ваши существующие API
//       const [tasRes, icebergRes] = await Promise.all([
//         fetch('https://abziceberg.ru/api/cron-info'),
//         fetch('https://abziceberg.ru/api/last-import-info'),
//       ]);
//       const tasData = await tasRes.json();
//       const icebergData = await icebergRes.json();
//       if (tasData.lastSync) setTasSyncTime(tasData.lastSync);
//       if (icebergData.lastImport) setIcebergSyncTime(icebergData.lastImport);
//     } catch (error) {
//       console.error('Ошибка загрузки времени синхронизации:', error);
//     }
//   };

//   useEffect(() => {
//     fetchSyncInfo();
//     const interval = setInterval(fetchSyncInfo, 30000); // каждые 30 секунд
//     return () => clearInterval(interval);
//   }, []);

//   const tasSync = getSyncBadgeStyle(tasSyncTime);
//   const icebergSync = getSyncBadgeStyle(icebergSyncTime);

//   return (
//     <View style={styles.container}>
//       {/* ТАС */}
//       <TouchableOpacity
//         style={[styles.button, mode === 'tas' && styles.activeButton]}
//         onPress={() => mode !== 'tas' && onToggle()}
//       >
//         <View style={styles.buttonContent}>
//           <Text style={[styles.label, mode === 'tas' && styles.activeLabel]}>
//             ☀️ ТАС
//           </Text>
//           <Text style={styles.subLabel}>Транс-Авто-Сервис</Text>
//           <View style={[styles.badge, { backgroundColor: tasSync.bgColor }]}>
//             <Text style={[styles.badgeText, { color: tasSync.color }]}>
//               🔄 {tasSync.text}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>

//       {/* Айсберг */}
//       <TouchableOpacity
//         style={[styles.button, mode === 'iceberg' && styles.activeButton]}
//         onPress={() => mode !== 'iceberg' && onToggle()}
//       >
//         <View style={styles.buttonContent}>
//           <Text style={[styles.label, mode === 'iceberg' && styles.activeLabel]}>
//             🏔️ Айсберг
//           </Text>
//           <Text style={styles.subLabel}>Щёлково • Сергиев Посад</Text>
//           <View style={[styles.badge, { backgroundColor: icebergSync.bgColor }]}>
//             <Text style={[styles.badgeText, { color: icebergSync.color }]}>
//               🔄 {icebergSync.text}
//             </Text>
//           </View>
//         </View>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     backgroundColor: '#1a1a2e',
//     borderRadius: 12,
//     padding: 4,
//     marginHorizontal: 16,
//     marginVertical: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.06)',
//   },
//   button: {
//     flex: 1,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     alignItems: 'center',
//     borderRadius: 10,
//   },
//   activeButton: {
//     backgroundColor: 'rgba(255,217,61,0.12)',
//   },
//   buttonContent: {
//     alignItems: 'center',
//     gap: 2,
//   },
//   label: {
//     color: '#94a3b8',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   activeLabel: {
//     color: '#ffd93d',
//   },
//   subLabel: {
//     color: '#64748b',
//     fontSize: 9,
//     fontWeight: '400',
//   },
//   badge: {
//     paddingHorizontal: 8,
//     paddingVertical: 1,
//     borderRadius: 10,
//     marginTop: 4,
//   },
//   badgeText: {
//     fontSize: 8,
//     fontWeight: '500',
//   },
// });

// // // src/components/ModeSwitch.tsx
// // import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// // interface ModeSwitchProps {
// //   mode: "tas" | "iceberg";
// //   onToggle: () => void;
// // }

// // export default function ModeSwitch({ mode, onToggle }: ModeSwitchProps) {
// //   return (
// //     <View style={styles.container}>
// //       <TouchableOpacity
// //         style={[styles.button, mode === "tas" && styles.activeButton]}
// //         onPress={() => mode !== "tas" && onToggle()}
// //       >
// //         <Text style={[styles.text, mode === "tas" && styles.activeText]}>
// //           ☀️ ТАС
// //         </Text>
// //       </TouchableOpacity>
// //       <TouchableOpacity
// //         style={[styles.button, mode === "iceberg" && styles.activeButton]}
// //         onPress={() => mode !== "iceberg" && onToggle()}
// //       >
// //         <Text style={[styles.text, mode === "iceberg" && styles.activeText]}>
// //           🏔️ Айсберг
// //         </Text>
// //       </TouchableOpacity>
// //     </View>
// //   );
// // }

// // const styles = StyleSheet.create({
// //   container: {
// //     flexDirection: "row",
// //     backgroundColor: "#1a1a2e",
// //     borderRadius: 10,
// //     padding: 4,
// //     marginHorizontal: 16,
// //     marginVertical: 8,
// //     borderWidth: 1,
// //     borderColor: "rgba(255,255,255,0.06)",
// //   },
// //   button: {
// //     flex: 1,
// //     paddingVertical: 8,
// //     alignItems: "center",
// //     borderRadius: 8,
// //   },
// //   activeButton: {
// //     backgroundColor: "rgba(255,217,61,0.15)",
// //   },
// //   text: {
// //     color: "#94a3b8",
// //     fontSize: 14,
// //     fontWeight: "500",
// //   },
// //   activeText: {
// //     color: "#ffd93d",
// //     fontWeight: "600",
// //   },
// // });
