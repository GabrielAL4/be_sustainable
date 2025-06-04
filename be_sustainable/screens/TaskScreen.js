import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
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
      const allTasks = response.data || [];
      console.log('Todas as tarefas:', allTasks);

      // Primeiro, separamos as tarefas por tipo
      let dailyTasks = allTasks.filter(task => task.type === 'daily' || !task.type);
      let weeklyTasks = allTasks.filter(task => task.type === 'weekly');

      console.log('Tarefas diárias antes do limite:', dailyTasks);
      console.log('Tarefas semanais antes do limite:', weeklyTasks);

      // Limitamos as tarefas diárias às 4 primeiras
      dailyTasks = dailyTasks.slice(0, 4);

      // Limitamos a uma tarefa semanal
      weeklyTasks = weeklyTasks.slice(0, 1);

      // Combinamos as tarefas na ordem correta
      const organizedTasks = [...dailyTasks, ...weeklyTasks];
      console.log('Tarefas organizadas final:', organizedTasks);

      setTasks(organizedTasks);
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
        await updateApiBaseUrl();
        const storedUser = await AsyncStorage.getItem('@BeSustainable:user');
        console.log('Usuário armazenado:', storedUser);
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('Usuário parseado:', parsedUser);
          setUser(parsedUser);
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

  const completeTask = async (task) => {
    try {
      setLoading(true);
      
      if (task.type === 'weekly') {
        // Para tarefas semanais, incrementamos o contador
        const currentCount = task.current_completions || 0;
        const requiredCount = task.required_completions || 1;

        // Verifica se já atingiu o limite
        if (currentCount >= requiredCount) {
          Alert.alert('Aviso', 'Você já completou esta tarefa o número máximo de vezes!');
          return;
        }

        // Incrementa o contador
        const newCount = currentCount + 1;
        console.log(`Atualizando progresso da tarefa ${task.id}: ${newCount}/${requiredCount}`);

        await api.put(`/api/tasks/${task.id}/complete`, { 
          user_id: user.id,
          current_completions: newCount,
          completed: newCount >= requiredCount
        });
      } else {
        // Para tarefas diárias, apenas marca como completa
        await api.put(`/api/tasks/${task.id}/complete`, { 
          user_id: user.id,
          completed: true
        });
      }
      
      // Recarrega as tasks do usuário após completar
      if (user && user.id) {
        await loadTasks(user.id);
      }

      Alert.alert('Sucesso', 'Progresso registrado com sucesso!');
    } catch (error) {
      console.error('Erro ao completar task:', error);
      Alert.alert('Erro', 'Não foi possível registrar o progresso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderTaskProgress = (task) => {
    if (task.type === 'weekly') {
      const current = task.current_completions || 0;
      const required = task.required_completions || 1;
      return (
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Progresso: {current}/{required}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(current / required) * 100}%` }
              ]} 
            />
          </View>
        </View>
      );
    }
    return null;
  };

  const renderTaskSection = (sectionTasks, title) => {
    if (!sectionTasks || sectionTasks.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sectionTasks.map((task) => (
          <TouchableOpacity 
            key={task.id}
            style={[
              styles.taskItem,
              task.completed && styles.taskCompleted,
              task.type === 'weekly' && styles.weeklyTask
            ]}
            onPress={() => !task.completed && completeTask(task)}
            disabled={task.completed}
          >
            <View style={styles.taskContent}>
              <Text style={[styles.taskText, task.completed && styles.taskTextCompleted]}>
                {task.title}
              </Text>
              <Text style={styles.pointsText}>{task.points} pontos</Text>
              {renderTaskProgress(task)}
            </View>
            {task.completed ? (
              <Text style={styles.completedCheck}>✓</Text>
            ) : (
              <Text style={styles.points}>
                {task.type === 'weekly' ? 'Progredir' : 'Completar'}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#34C759" />
      </View>
    );
  }

  // Separa as tarefas em diárias e semanais para renderização
  const dailyTasks = tasks.filter(task => task.type === 'daily' || !task.type);
  const weeklyTasks = tasks.filter(task => task.type === 'weekly');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas Sustentáveis</Text>
      
      {!Array.isArray(tasks) ? (
        <Text style={styles.emptyText}>Erro ao carregar tarefas</Text>
      ) : tasks.length === 0 ? (
        <Text style={styles.emptyText}>Nenhuma tarefa disponível</Text>
      ) : (
        <ScrollView style={styles.scrollView}>
          {renderTaskSection(dailyTasks, 'Tarefas Diárias')}
          {renderTaskSection(weeklyTasks, 'Tarefas Semanais')}
        </ScrollView>
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
  },
  weeklyTask: {
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  taskType: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E1E1E1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  scrollView: {
    flex: 1,
  },
});

export default TaskScreen;
