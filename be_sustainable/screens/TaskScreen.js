import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  timeout: 10000
});

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUserAndTasks();
  }, []);

  const loadUserAndTasks = async () => {
    try {
      // Carregar dados do usuário do AsyncStorage
      const userStr = await AsyncStorage.getItem('@BeSustainable:user');
      if (!userStr) {
        console.log('Nenhum usuário encontrado no AsyncStorage');
        Alert.alert('Erro', 'Usuário não encontrado');
        return;
      }

      const userData = JSON.parse(userStr);
      console.log('Dados do usuário:', userData);
      setUser(userData);

      // Carregar tasks do usuário
      const response = await api.get(`/api/tasks/user/${userData.id}`);
      console.log('Resposta da API:', response.data);
      setTasks(response.data || []); // Garante que sempre será um array

      // Log após atualizar o estado
      console.log('Estado de tasks atualizado:', tasks);
    } catch (error) {
      console.error('Erro ao carregar tasks:', error);
      console.error('Detalhes do erro:', error.response?.data);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as tarefas. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      await api.put(`/api/tasks/${taskId}/complete`, { user_id: user.id });
      
      // Recarregar as tasks do usuário após completar
      if (user) {
        const response = await api.get(`/api/tasks/user/${user.id}`);
        console.log('Tasks após completar:', response.data);
        setTasks(response.data || []); // Garante que sempre será um array
      }

      Alert.alert('Sucesso', 'Tarefa concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao completar task:', error);
      Alert.alert(
        'Erro',
        'Não foi possível completar a tarefa. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Log quando o componente renderiza
  console.log('Renderizando TaskScreen. Tasks:', tasks);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas Sustentáveis</Text>
      
      {!Array.isArray(tasks) ? (
        <Text style={styles.emptyText}>Erro ao carregar tarefas</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma tarefa disponível</Text>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.taskItem, item.completed && styles.taskCompleted]}
              onPress={() => !item.completed && completeTask(item.id)}
              disabled={item.completed}
            >
              <View style={styles.taskContent}>
                <Text style={[styles.taskText, item.completed && styles.taskTextCompleted]}>
                  {item.title}
                </Text>
                <Text style={styles.pointsText}>{item.points} pontos</Text>
              </View>
              {item.completed ? (
                <Text style={styles.completedCheck}>✓</Text>
              ) : (
                <Text style={styles.points}>Completar</Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  taskCompleted: {
    backgroundColor: '#f8f8f8',
    borderColor: '#34C759',
    borderWidth: 1,
  },
  taskContent: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
    marginBottom: 5,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  pointsText: {
    fontSize: 14,
    color: '#666',
  },
  points: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  completedCheck: {
    color: '#34C759',
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default TaskScreen;
