// src/components/Header.tsx
import { MotiView } from "moti";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface HeaderProps {
  username: string;
  refreshing: boolean;
  onRefresh: () => void;
  onLogout: () => void;
  theme: any;
}

export default function Header({
  username,
  refreshing,
  onRefresh,
  onLogout,
  theme,
}: HeaderProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "spring", duration: 500 }}
    >
      <View style={[styles.headerWrapper, { backgroundColor: theme.headerBg }]}>
        <View
          style={[styles.headerContainer, { borderColor: theme.cardBorder }]}
        >
          {/* Левая часть: логотип */}
          <View style={styles.headerLeft}>
            <View
              style={[styles.logoBadge, { backgroundColor: theme.badgeBg }]}
            >
              <Text style={[styles.logoAbz, { color: "#ffd93d" }]}>АБЗ</Text>
              <Text
                style={[styles.logoLightning, { color: theme.textSecondary }]}
              >
                ⚡
              </Text>
              <Text style={[styles.logoControl, { color: theme.text }]}>
                Контроль
              </Text>
            </View>
            <Text style={[styles.usernameText, { color: theme.textSecondary }]}>
              {username}
            </Text>
          </View>

          {/* Правая часть: кнопки */}
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={onRefresh}
              disabled={refreshing}
              style={styles.headerButton}
            >
              <Text
                style={[
                  styles.headerButtonText,
                  { color: theme.textSecondary },
                ]}
              >
                {refreshing ? "⏳" : "🔄"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onLogout} style={styles.headerButton}>
              <Text
                style={[
                  styles.headerButtonText,
                  { color: theme.textSecondary },
                ]}
              >
                🚪
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 2,
  },
  logoAbz: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  logoLightning: {
    fontSize: 13,
    fontWeight: "300",
  },
  logoControl: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  usernameText: {
    fontSize: 10,
    fontWeight: "500",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
  },
  headerButtonText: {
    fontSize: 15,
  },
});
