import React from 'react';
import { SafeAreaView } from 'react-native';
import LoginScreen from './screens/LoginScreen'; // Importa a tela de login

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LoginScreen />
    </SafeAreaView>
  );
}
