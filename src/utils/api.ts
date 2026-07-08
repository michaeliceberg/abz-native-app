// src/utils/api.ts
// ВРЕМЕННО: без AsyncStorage (для теста)

const API_BASE = "https://abziceberg.ru/api";

// Простое хранилище в памяти
let memoryToken: string | null = null;
let memoryUser: any = null;

export async function fetchShipments() {
  try {
    const token = memoryToken;
    console.log("🔵 Token:", token ? "есть" : "нет");

    const response = await fetch(`${API_BASE}/all-data`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("🔵 Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Ошибка ответа:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("🔵 Данных:", data.shipments?.length || 0);
    return data.shipments || [];
  } catch (error) {
    console.error("❌ Ошибка fetchShipments:", error);
    throw error;
  }
}

export async function login(username: string, password: string) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log("🔵 Login response:", data);

    if (response.ok && data.token) {
      memoryToken = data.token;
      memoryUser = data.user;
      return data;
    }
    throw new Error(data.error || "Login failed");
  } catch (error) {
    console.error("❌ Login error:", error);
    throw error;
  }
}

export async function logout() {
  memoryToken = null;
  memoryUser = null;
}

export async function getToken() {
  return memoryToken;
}

// // src/utils/api.ts
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const API_BASE = "https://abziceberg.ru/api";

// export async function fetchShipments() {
//   try {
//     const token = await AsyncStorage.getItem("token");
//     const response = await fetch(`${API_BASE}/all-data`, {
//       headers: {
//         Authorization: token ? `Bearer ${token}` : "",
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const data = await response.json();
//     return data.shipments || [];
//   } catch (error) {
//     console.error("Error fetching shipments:", error);
//     throw error;
//   }
// }

// export async function login(username: string, password: string) {
//   const response = await fetch(`${API_BASE}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ username, password }),
//   });

//   const data = await response.json();
//   if (response.ok && data.token) {
//     await AsyncStorage.setItem("token", data.token);
//     await AsyncStorage.setItem("user", JSON.stringify(data.user));
//     return data;
//   }
//   throw new Error(data.error || "Login failed");
// }

// export async function logout() {
//   await AsyncStorage.removeItem("token");
//   await AsyncStorage.removeItem("user");
// }

// export async function getToken() {
//   return await AsyncStorage.getItem("token");
// }
