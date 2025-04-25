import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TaskScreen = ({ navigation }) => {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tasks, setTasks] = useState([
    { id: "1", title: "Reciclar plástico" },
    { id: "2", title: "Usar transporte público" },
    { id: "3", title: "Economizar água" },
    { id: "4", title: "Desligar luzes desnecessárias" },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedXp = await AsyncStorage.getItem("xp");
        const savedLevel = await AsyncStorage.getItem("level");

        setXp(savedXp ? parseInt(savedXp) : 0);
        setLevel(savedLevel ? parseInt(savedLevel) : 1);
      } catch (error) {
        console.log("Erro ao carregar XP e nível:", error);
      }
    };
    loadData();
  }, []);

  const saveData = async (newXp, newLevel) => {
    try {
      await AsyncStorage.setItem("xp", newXp.toString());
      await AsyncStorage.setItem("level", newLevel.toString());
    } catch (error) {
      console.log("Erro ao salvar XP e nível:", error);
    }
  };

  const completeTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newTasks = tasks.filter((t) => t.id !== id);
    setTasks(newTasks);

    let newXp = xp + 25;
    let newLevel = level;

    if (newXp >= 100) {
      newXp -= 100;
      newLevel += 1;
    }

    setXp(newXp);
    setLevel(newLevel);
    saveData(newXp, newLevel);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas Sustentáveis</Text>
      <Text style={styles.level}>Nível: {level}</Text>
      <Text style={styles.xp}>XP: {xp} / 100</Text>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.taskItem} onPress={() => completeTask(item.id)}>
            <Text style={styles.taskText}>{item.title}</Text>
            <Text style={styles.check}>✅</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  level: { fontSize: 18, textAlign: "center", color: "#FFA500", marginBottom: 5 },
  xp: { fontSize: 16, textAlign: "center", marginBottom: 15, color: "#34C759" },
  taskItem: { flexDirection: "row", justifyContent: "space-between", padding: 15, backgroundColor: "#fff", borderRadius: 8, marginBottom: 10, elevation: 2 },
  taskText: { fontSize: 16 },
  check: { fontSize: 18 },
});

export default TaskScreen;
