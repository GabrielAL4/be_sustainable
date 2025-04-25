import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from 'react-native-webview';

const NewsScreen = () => {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://www.sosma.org.br/noticias/edital-rppns-medio-tiete' }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default NewsScreen;
