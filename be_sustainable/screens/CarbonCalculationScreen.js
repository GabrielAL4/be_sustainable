import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function CarbonCalculatorScreen() {
  const [vehicleType, setVehicleType] = useState('');
  const [numComputers, setNumComputers] = useState('');
  const [fridgeSize, setFridgeSize] = useState('');
  const [totalCO2, setTotalCO2] = useState(null);

  const calcularEmissao = () => {
    let co2 = 0;

    if (vehicleType === 'carro') co2 += 250;
    else if (vehicleType === 'moto') co2 += 100;

    co2 += parseFloat(numComputers || 0) * 0.0136 * 30;

    if (fridgeSize === 'pequena') co2 += 20;
    else if (fridgeSize === 'media') co2 += 30;
    else if (fridgeSize === 'grande') co2 += 50;

    setTotalCO2(co2);
  };

  const calcularMudas = () => {
    if (!totalCO2) return 0;
    return Math.ceil(totalCO2 / 15);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Calculadora de Emissão de Carbono</Text>

      <Text style={styles.label}>Tipo de veículo:</Text>
      <View style={styles.options}>
        {['carro', 'moto', 'nenhum'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.option,
              vehicleType === type && styles.selectedOption,
            ]}
            onPress={() => setVehicleType(type)}
          >
            <Text style={styles.optionText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Quantas horas por dia você usa o computador?</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={numComputers}
        onChangeText={setNumComputers}
        placeholder="Ex: 4"
      />

      <Text style={styles.label}>Qual o tamanho da sua geladeira?</Text>
      <View style={styles.options}>
        {['pequena', 'media', 'grande'].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.option,
              fridgeSize === size && styles.selectedOption,
            ]}
            onPress={() => setFridgeSize(size)}
          >
            <Text style={styles.optionText}>{size}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={calcularEmissao}>
        <Text style={styles.buttonText}>Calcular</Text>
      </TouchableOpacity>

      {totalCO2 !== null && (
        <View style={styles.result}>
          <Text style={styles.resultText}>
            Sua emissão estimada é de {totalCO2} kg de CO₂ por mês.
          </Text>
          <Text style={styles.resultText}>
            Para compensar, você precisa plantar {calcularMudas()} mudas por mês.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    marginTop: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  options: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  option: {
    backgroundColor: '#eee',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: '#28A745',
  },
  optionText: {
    color: '#000',
  },
  button: {
    backgroundColor: '#28A745',
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  result: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
