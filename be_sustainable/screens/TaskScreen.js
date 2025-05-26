import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { getApiUrl, API_URL } from '../src/config';

// Criar uma instância do axios que será atualizada com a URL correta
let api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

// Função para atualizar a URL base do axios
const updateApiBaseUrl = async () => {
  try {
    const baseUrl = await getApiUrl();
    api = axios.create({
      baseURL: baseUrl,
      timeout: 10000
    });
  } catch (error) {
    console.error('Erro ao atualizar URL base:', error);
  }
};

const TaskScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadTasks = async (userId) => {
    try {
      setLoading(true);
      console.log('Carregando tarefas para usuário:', userId);
      const response = await api.get(`/api/tasks/user/${userId}`);
      console.log('Resposta do backend:', response.data);
      setTasks(response.data || []); // Garante que sempre será um array
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas. Tente novamente.');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await updateApiBaseUrl(); // Atualiza a URL base do axios
        const storedUser = await AsyncStorage.getItem('@BeSustainable:user');
        console.log('Usuário armazenado:', storedUser);
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuário parseado:', parsedUser);
          setUser(parsedUser);
          if (parsedUser && parsedUser.id) {
            await loadTasks(parsedUser.id);
          }
        }
      } catch (error) {
        console.error('Erro ao inicializar:', error);
        Alert.alert('Erro', 'Não foi possível inicializar o aplicativo. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Atualizar tarefas quando o usuário mudar
  useEffect(() => {
    if (user && user.id) {
      loadTasks(user.id);
    }
  }, [user]);

  const completeTask = async (taskId) => {
    try {
      setLoading(true);
      await api.put(`/api/tasks/${taskId}/complete`, { user_id: user.id });
      
      // Recarregar as tasks do usuário após completar
      if (user && user.id) {
        await loadTasks(user.id);
      }

      Alert.alert('Sucesso', 'Tarefa concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao completar task:', error);
      Alert.alert('Erro', 'Não foi possível completar a tarefa. Tente novamente.');
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
