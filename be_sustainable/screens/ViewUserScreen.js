import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import { API_URL } from '../src/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const ViewUserScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      console.log('Usuários carregadas:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error.response?.data || error.message);
      Alert.alert('Erro', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lista de Usuários</Text>
      {loading ? (
        <ActivityIndicator color="#34C759" />
      ) : (
        users.map(user => (
          <View key={user.id} style={styles.userItem}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userXp}>{user.xp}</Text>
            <Text style={styles.userLevel}>{user.level}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  userItem: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: '#666', marginTop: 5 },
  userXp: { fontSize: 14, color: '#666', marginTop: 5 },
  userLevel: { fontSize: 14, color: '#666', marginTop: 5 },
});

export default ViewUserScreen;