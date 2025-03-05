import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      {/* Botão de Configuração */}
      <TouchableOpacity style={styles.settingsButton}>
        <Ionicons name="settings-outline" size={24} color="black" />
      </TouchableOpacity>

      {/* Campo de E-mail */}
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      {/* Campo de Senha Corrigido */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Botão de Login */}
      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  settingsButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
  },
  input: {
    width: 278,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white', // Garante uma boa aparência
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 278,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
    justifyContent: 'space-between', // Mantém o ícone no canto direito
  },
  passwordInput: {
    flex: 1, // Faz o campo ocupar todo o espaço disponível
    height: '100%',
  },
  eyeIcon: {
    padding: 8, // Ajusta o espaçamento do ícone
  },
  loginButton: {
    backgroundColor: '#34C759',
    width: 278,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Removido o valor incorreto
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
