import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from 'axios';
import { API_URL } from '../src/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const menuItems = [
  { title: "Perfil", screen: "Profile", color: "#34C759" },
  { title: "Tasks", screen: "Tasks", color: "#34C759" },
  { title: "Notícias", screen: "News", color: "#34C759" },
  { title: "Cálculo Carbono", screen: "CarbonCalculation", color: "#34C759" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTopUsers();
  }, []);

  const loadTopUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/users');
      // Ordena os usuários por XP e pega os 10 primeiros
      const sortedUsers = response.data
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 10);
      setTopUsers(sortedUsers);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderRankingItem = ({ item, index }) => (
    <View style={styles.rankingItem}>
      <View style={styles.rankPosition}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userLevel}>Nível {item.level}</Text>
      </View>
      <View style={styles.xpContainer}>
        <Text style={styles.xpText}>{item.xp} XP</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <FlatList
        data={menuItems}
        numColumns={2}
        keyExtractor={(item) => item.screen}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.tile, { backgroundColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Text style={styles.text}>{item.title}</Text>
          </TouchableOpacity>
        )}
        scrollEnabled={false}
      />

      <View style={styles.rankingContainer}>
        <Text style={styles.rankingTitle}>Melhores usuários</Text>
        {loading ? (
          <ActivityIndicator color="#34C759" style={styles.loader} />
        ) : (
          <FlatList
            data={topUsers}
            renderItem={renderRankingItem}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  tile: {
    flex: 1,
    margin: 10,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  rankingContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
    textAlign: 'center',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rankPosition: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  userLevel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  xpContainer: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  loader: {
    marginVertical: 20,
  },
});

export default HomeScreen;
