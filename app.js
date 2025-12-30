// App.js
import React from 'react';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView 
      source={{ uri: 'https://yourwebsite.com' }}
      style={{ marginTop: 20 }}
    />
  );
}
