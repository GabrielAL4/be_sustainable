import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const XP_PER_TASK = 25; // XP ganho por cada tarefa concluída
const XP_TO_LEVEL_UP = 100; // XP necessário para subir de nível

const ProfileScreen = ({ navigation }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  // Carregar XP e nível salvos no AsyncStorage ao abrir a tela
  useFocusEffect(
    React.useCallback(() => {
      const loadData = async () => {
        try {
          const savedXp = await AsyncStorage.getItem("xp");
          const savedLevel = await AsyncStorage.getItem("level");

          if (savedXp !== null) setXp(parseInt(savedXp));
          if (savedLevel !== null) setLevel(parseInt(savedLevel));
        } catch (error) {
          console.error("Erro ao carregar dados:", error);
        }
      };
      loadData();
    }, [])
  );

  const completeTask = async () => {
    let newXp = xp + XP_PER_TASK;
    let newLevel = level;

    if (newXp >= XP_TO_LEVEL_UP) {
      newXp -= XP_TO_LEVEL_UP;
      newLevel += 1;
    }

    setXp(newXp);
    setLevel(newLevel);

    // Salvar no AsyncStorage
    try {
      await AsyncStorage.setItem("xp", newXp.toString());
      await AsyncStorage.setItem("level", newLevel.toString());
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Image source={require("../assets/logo-white.png")} style={styles.logo} />

      <Text style={styles.levelText}>Nível: {level}</Text>

      <View style={styles.xpBarContainer}>
        <View style={[styles.xpBar, { width: `${(xp / XP_TO_LEVEL_UP) * 100}%` }]} />
      </View>
      <Text style={styles.xpText}>{xp} / {XP_TO_LEVEL_UP} XP</Text>

      <TouchableOpacity style={styles.completeTaskButton} onPress={completeTask}>
        <Text style={styles.completeTaskButtonText}>Completar Tarefa (+{XP_PER_TASK} XP)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("Home")}>
        <Text style={styles.backButtonText}>Voltar ao Home</Text>
      </TouchableOpacity>
    </View>
  );
};

// Estilos da tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "top",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  levelText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  xpBarContainer: {
    width: "80%",
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  xpBar: {
    height: "100%",
    backgroundColor: "#34C759",
  },
  xpText: {
    fontSize: 16,
    marginBottom: 20,
  },
  completeTaskButton: {
    backgroundColor: "#34C759",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  completeTaskButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
