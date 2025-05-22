import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000
});

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!email || !password || (isRegistering && !name)) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isRegistering ? '/api/users/register' : '/api/users/login';
      const data = isRegistering 
        ? { name, email, password }
        : { email, password };

      console.log('Tentando login com:', { endpoint, data });
      const response = await api.post(endpoint, data);
      const { user, token } = response.data;
      
      // Salvar token e dados do usuário
      await AsyncStorage.setItem('@BeSustainable:token', token);
      await AsyncStorage.setItem('@BeSustainable:user', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id.toString());

      // Navegar para a Home
      navigation.navigate("Home");
    } catch (error) {
      console.error('Erro:', error);
      Alert.alert(
        "Erro",
        error.response?.data?.message || "Erro ao processar sua solicitação. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => navigation.navigate("AdminLogin")}
      >
        <Ionicons name="settings-outline" size={24} color="black" />
      </TouchableOpacity>

      <Image source={require("../assets/logo.png")} style={styles.logo} />

      {isRegistering && (
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={24} color="black" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? "Carregando..." : (isRegistering ? "Cadastrar" : "Login")}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
        <Text style={styles.toggleText}>
          {isRegistering ? "Já tem uma conta? Faça login" : "Não tem uma conta? Cadastre-se"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  settingsButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    width: 278,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "white",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: 278,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: "white",
    justifyContent: "space-between",
  },
  passwordInput: {
    flex: 1,
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: "#34C759",
    width: 278,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: "#a0a0a0",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    marginTop: 15,
    padding: 10,
  },
  toggleText: {
    color: "#34C759",
    fontSize: 14,
  },
});

export default LoginScreen;
