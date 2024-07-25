// Import statements
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, StyleSheet } from 'react-native'; // Import Image and StyleSheet components
import HomeScreen from './HomeScreen';
import GitaSlokaScreen from './GitaSlokaScreen';
import LoginScreen from './LoginScreen'; // Import LoginScreen

// Import Gita logo image
import GitaLogo from './assets/gitaGPT.png'; 

// Create the stack navigator
const Stack = createNativeStackNavigator();

// Custom header component with Gita logo
const CustomHeader = () => (
  <Image
    source={GitaLogo}
    style={styles.logo}
  />
);

// Define styles
const styles = StyleSheet.create({
  logo: {
    width: 150, // Set the width of the logo
    height: 50, // Set the height of the logo
    resizeMode: 'contain', // Ensure the logo retains its aspect ratio
  },
});

// Modify the App component to use NavigationContainer
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login" // Set the initial route to Login
        screenOptions={{
          headerTitleAlign: 'center', 
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} // Hide the header on the login screen
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => <CustomHeader />, 
          }}
        />
        <Stack.Screen
          name="Sloka"
          component={GitaSlokaScreen}
          options={{
            headerTitle: () => <CustomHeader />, 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
