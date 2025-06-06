import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import TaskScreen from "./screens/TaskScreen";
import NewsScreen from "./screens/NewsScreen";
import CarbonCalculationScreen from "./screens/CarbonCalculationScreen";
import AdminLoginScreen from "./screens/AdminLoginScreen";
import AdminHomeScreen from "./screens/AdminHomeScreen";
import CreateTaskScreen from "./screens/CreateTaskScreen";
import ViewUserScreen from './screens/ViewUserScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Início" }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Perfil" }} />
        <Stack.Screen name="Tasks" component={TaskScreen} options={{ title: "Tarefas" }} />
        <Stack.Screen name="News" component={NewsScreen} options={{ title: "Notícias" }} />
        <Stack.Screen name="CarbonCalculation" component={CarbonCalculationScreen} options={{ title: "Cálculo de Carbono" }} />
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ title: "Admin Login" }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: "Admin Home" }} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: "Gerenciar Tarefas" }} />
        <Stack.Screen name="ViewUser" component={ViewUserScreen} options={{ title: "Lista de Usuários" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
