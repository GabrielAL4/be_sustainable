import React from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const menuItems = [
  { title: "Perfil", screen: "Perfil", color: "#0078D7" },
  { title: "Tasks", screen: "Tasks", color: "#00A300" },
  { title: "Notícias", screen: "Noticias", color: "#F7630C" },
  { title: "Cálculo Carbono", screen: "CalculoCarbono", color: "#B91D47" },
];

const HomeScreen = () => {
  const navigation = useNavigation();
  const menuItems = [
    { title: "Perfil", screen: "Profile", color: "#34C759" },
    { title: "Tasks", screen: "Tasks", color: "#34C759" },
    { title: "Notícias", screen: "News", color: "#34C759" },
    { title: "Cálculo Carbono", screen: "CarbonCalculation", color: "#34C759" },
  ];
  return (
    <View style={styles.container}>
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
  },
});

export default HomeScreen;
