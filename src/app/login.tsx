// src/app/login.tsx
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { login } from "../utils/api";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("tas");
  const [password, setPassword] = useState("5050");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Ошибка", "Введите логин и пароль");
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      router.replace("/"); // Переход на главный экран
    } catch (error) {
      Alert.alert("Ошибка", "Неверный логин или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <View style={styles.content}>
        <Text style={styles.logo}>🏭</Text>
        <Text style={styles.title}>АБЗ Контроль</Text>
        <Text style={styles.subtitle}>Вход в систему</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Логин"
            placeholderTextColor="#64748b"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#64748b"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a2e" />
            ) : (
              <Text style={styles.buttonText}>Войти</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f1a",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginBottom: 32,
  },
  form: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  input: {
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: 14,
    color: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ffd93d",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#1a1a2e",
    fontSize: 16,
    fontWeight: "600",
  },
});
