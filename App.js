// Import statements
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './HomeScreen';
import GitaSlokaScreen from './GitaSlokaScreen'; 

// Create the stack navigator
const Stack = createNativeStackNavigator();

// Modify the App component to use NavigationContainer
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{
    headerShown: false}}/>
        <Stack.Screen
        name="Sloka"
        component={GitaSlokaScreen}
        options={{
          title: '', 
          headerBackTitleVisible: false,
          headerTransparent: true,
        }}
      />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
