import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from '../src/config';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // Primeiro tentar pegar o userId diretamente
      let userId = await AsyncStorage.getItem("userId");
      
      // Se não encontrar, tentar pegar do objeto user
      if (!userId) {
        const userJson = await AsyncStorage.getItem("@BeSustainable:user");
        if (userJson) {
          const user = JSON.parse(userJson);
          userId = user.id.toString();
          // Salvar o userId separadamente para futuras consultas
          await AsyncStorage.setItem("userId", userId);
        }
      }

      if (!userId) {
        throw new Error("Usuário não encontrado. Por favor, faça login novamente.");
      }

      const response = await axios.get(`${API_URL}/api/users/${userId}/level`);
      setUserData(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.message === "Usuário não encontrado. Por favor, faça login novamente."
        ? err.message
        : "Erro ao carregar dados do perfil. Tente novamente.";
      
      setError(errorMessage);
      console.error("Erro ao carregar dados:", err);
      
      if (err.message === "Usuário não encontrado. Por favor, faça login novamente.") {
        Alert.alert(
          "Sessão Expirada",
          "Por favor, faça login novamente.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login")
            }
          ]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Image source={require("../assets/logo-white.png")} style={styles.logo} />

      <View style={styles.levelCard}>
        <Text style={styles.levelName}>{userData?.level?.current?.name || "Carregando..."}</Text>
        <Text style={styles.pointsText}>{userData?.user?.points || 0} pontos totais</Text>
        <Text style={styles.xpText}>{userData?.user?.xp || 0} XP</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.xpBarContainer}>
          <View 
            style={[
              styles.xpBar, 
              { width: `${userData?.level?.progress?.percentage || 0}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {userData?.level?.progress?.current || 0} / {userData?.level?.progress?.total || 0} XP para o próximo nível
        </Text>
      </View>

      {userData?.level?.next && (
        <View style={styles.nextLevelCard}>
          <Text style={styles.nextLevelTitle}>Próximo Nível:</Text>
          <Text style={styles.nextLevelName}>{userData.level.next.name}</Text>
          <Text style={styles.nextLevelPoints}>
            Faltam {userData.level.next.points_needed} XP
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.backButtonText}>Voltar ao Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "top",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#2c3e50",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  levelCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    width: "90%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  levelName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  pointsText: {
    fontSize: 18,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  xpText: {
    fontSize: 16,
    color: "#95a5a6",
  },
  progressSection: {
    width: "90%",
    marginBottom: 20,
  },
  xpBarContainer: {
    width: "100%",
    height: 20,
    backgroundColor: "#ecf0f1",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  xpBar: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  progressText: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
  },
  nextLevelCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    width: "90%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  nextLevelTitle: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  nextLevelName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#34C759",
    marginBottom: 5,
  },
  nextLevelPoints: {
    fontSize: 14,
    color: "#95a5a6",
  },
  backButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
