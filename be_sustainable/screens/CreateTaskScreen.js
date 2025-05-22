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

const api = axios.create({
  baseURL: 'http://10.0.2.2:3000',
  timeout: 10000,
});

const CreateTaskScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

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

    try {
      setLoading(true);
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        points: pointsNum,
        completed: false
      };

      console.log('Enviando dados:', taskData); // Debug

      let response;
      if (editingTask) {
        response = await api.put(`/api/tasks/${editingTask.id}`, taskData);
        console.log('Resposta da atualização:', response.data); // Debug
        Alert.alert('Sucesso', 'Tarefa atualizada com sucesso!');
      } else {
        response = await api.post('/api/tasks', taskData);
        console.log('Resposta da criação:', response.data); // Debug
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
  };

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setPoints('');
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
            <Text style={styles.taskPoints}>{task.points} pontos</Text>
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
});

export default CreateTaskScreen; 