import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CarbonCalculationScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem vindo à Tela de Cálculo de Carbono!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CarbonCalculationScreen;
