import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const adminMenuItems = [
  { title: "Criar Task", screen: "CreateTask", color: "#34C759" },
  { title: "Criar Usuário", screen: "CriarUsuario", color: "#34C759" },
  { title: "Ver Lista de Usuários", screen: "ListaUsuarios", color: "#34C759" },
  { title: "Mudar Notícias", screen: "MudarNoticias", color: "#34C759" },
];

const AdminHomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        data={adminMenuItems}
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
      />
    </View>
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
    textAlign: "center",
  },
});

export default AdminHomeScreen;
