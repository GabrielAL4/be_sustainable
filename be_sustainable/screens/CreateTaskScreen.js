import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import { API_URL } from '../src/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const CreateTaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskType, setTaskType] = useState('daily'); // 'daily' ou 'weekly'
  const [requiredCompletions, setRequiredCompletions] = useState('1');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tasks');
      console.log('Tasks carregadas:', response.data); // Debug
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao carregar tasks:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar as tarefas');
    } finally {
      setLoading(false);
    }
  };

  const validateTaskLimits = async () => {
    try {
      const response = await api.get('/api/tasks');
      const existingTasks = response.data || [];
      
      const dailyTasks = existingTasks.filter(task => task.type === 'daily');
      const weeklyTasks = existingTasks.filter(task => task.type === 'weekly');

      if (taskType === 'weekly' && weeklyTasks.length >= 1 && !editingTask) {
        Alert.alert('Limite Atingido', 'Você já possui uma tarefa semanal. Remova a tarefa existente antes de adicionar uma nova.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao validar limites:', error);
      Alert.alert('Erro', 'Não foi possível validar os limites de tarefas.');
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !points) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    const pointsNum = parseInt(points);
    if (isNaN(pointsNum) || pointsNum <= 0) {
      Alert.alert('Erro', 'Os pontos devem ser um número positivo');
      return;
    }

    if (taskType === 'weekly') {
      const completionsNum = parseInt(requiredCompletions);
      if (isNaN(completionsNum) || completionsNum <= 0) {
        Alert.alert('Erro', 'O número de completações deve ser um número positivo');
        return;
      }
    }

    // Validar limites antes de criar/editar
    const canProceed = await validateTaskLimits();
    if (!canProceed) {
      return;
    }

    try {
      setLoading(true);
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        points: pointsNum,
        type: taskType,
        required_completions: taskType === 'weekly' ? parseInt(requiredCompletions) : 1,
        current_completions: 0,
        completed: false
      };

      console.log('Enviando dados:', taskData);

      let response;
      if (editingTask) {
        response = await api.put(`/api/tasks/${editingTask.id}`, taskData);
        console.log('Resposta da atualização:', response.data);
        Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
      } else {
        response = await api.post('/api/tasks', taskData);
        console.log('Resposta da criação:', response.data);
        Alert.alert('Sucesso', 'Tarefa criada com sucesso!');
      }
      
      clearForm();
      loadTasks();
    } catch (error) {
      console.error('Erro ao salvar task:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Não foi possível salvar a tarefa';
      const errorDetails = error.response?.data?.error?.details;
      
      if (errorDetails) {
        // Se temos detalhes específicos do erro, mostramos eles
        const errorMessages = Object.entries(errorDetails)
          .filter(([_, value]) => value !== null)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        Alert.alert('Erro', errorMessages);
      } else {
        // Caso contrário, mostramos a mensagem genérica
        Alert.alert('Erro', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    Alert.alert(
      'Confirmar',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await api.delete(`/api/tasks/${taskId}`);
              Alert.alert('Sucesso', 'Tarefa excluída com sucesso!');
              loadTasks();
            } catch (error) {
              console.error('Erro ao excluir task:', error.response?.data || error.message);
              Alert.alert('Erro', 'Não foi possível excluir a tarefa');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setPoints(task.points.toString());
    setTaskType(task.type || 'daily');
    setRequiredCompletions(task.required_completions?.toString() || '1');
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setPoints('');
    setTaskType('daily');
    setRequiredCompletions('1');
    setEditingTask(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {editingTask ? 'Editar Tarefa' : 'Criar Nova Tarefa'}
      </Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Título da tarefa"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição da tarefa"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              taskType === 'daily' && styles.typeButtonSelected
            ]}
            onPress={() => setTaskType('daily')}
          >
            <Text style={[
              styles.typeButtonText,
              taskType === 'daily' && styles.typeButtonTextSelected
            ]}>Diária</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeButton,
              taskType === 'weekly' && styles.typeButtonSelected
            ]}
            onPress={() => setTaskType('weekly')}
          >
            <Text style={[
              styles.typeButtonText,
              taskType === 'weekly' && styles.typeButtonTextSelected
            ]}>Semanal</Text>
          </TouchableOpacity>
        </View>

        {taskType === 'weekly' && (
          <TextInput
            style={styles.input}
            placeholder="Número de completações necessárias"
            value={requiredCompletions}
            onChangeText={setRequiredCompletions}
            keyboardType="numeric"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Pontos"
          value={points}
          onChangeText={setPoints}
          keyboardType="numeric"
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {editingTask ? 'Atualizar' : 'Criar'}
            </Text>
          )}
        </TouchableOpacity>

        {editingTask && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={clearForm}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.listTitle}>Lista de Tarefas</Text>

      {tasks.map((task) => (
        <View key={task.id} style={styles.taskItem}>
          <View style={styles.taskInfo}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
            <View style={styles.taskMetaInfo}>
              <Text style={styles.taskPoints}>{task.points} pontos</Text>
              <Text style={[
                styles.taskType,
                task.type === 'weekly' ? styles.weeklyType : styles.dailyType
              ]}>
                {task.type === 'weekly' ? 'Semanal' : 'Diária'}
              </Text>
              {task.type === 'weekly' && (
                <Text style={styles.completionsText}>
                  Completações: {task.required_completions}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEdit(task)}
            >
              <Text style={styles.actionButtonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(task.id)}
            >
              <Text style={styles.actionButtonText}>Excluir</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskInfo: {
    marginBottom: 10,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  taskPoints: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: 'bold',
    marginTop: 5,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  typeButtonSelected: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  typeButtonText: {
    color: '#666',
  },
  typeButtonTextSelected: {
    color: '#fff',
  },
  taskMetaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  taskType: {
    fontSize: 12,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dailyType: {
    backgroundColor: '#E8E8E8',
    color: '#666',
  },
  weeklyType: {
    backgroundColor: '#007AFF20',
    color: '#007AFF',
  },
  completionsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
});

export default CreateTaskScreen; 