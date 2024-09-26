import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import HomeScreen from './HomeScreen';
import GitaSlokaScreen from './GitaSlokaScreen';
import LoginScreen from './LoginScreen';
import VerseListScreen from './VerseListScreen';
import ChapterListScreen from './ChapterListScreen';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import BootSplash from "react-native-bootsplash";

// Import images
import GitaLogo from './assets/gitaGPT.png';
import EllipsisIcon from './assets/dot.png';
import UserIcon from './assets/user_icon.png';

const Stack = createNativeStackNavigator();

const CustomHeader = ({ navigation }) => {
  const signOut = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await auth().signOut();
    } catch (error) {
      console.error(error);
      Alert.alert('An error occurred while signing out');
    }
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.ellipsisButton}
        onPress={() => navigation.navigate('ChapterList')}
      >
        <Image
          source={EllipsisIcon}
          style={styles.iconStyle}
        />
      </TouchableOpacity>
      <Image
        source={GitaLogo}
        style={styles.logo}
      />
      <TouchableOpacity 
        style={styles.userButton}
        onPress={signOut}
      >
        <Image
          source={UserIcon}
          style={styles.iconStyle}
        />
      </TouchableOpacity>
    </View>
  );
};

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initApp = async () => {
      try {
        console.log("Starting app initialization");

        // Initialize Firebase Auth
        if (auth().native) {
          console.log("Firebase Auth initialized");
        } else {
          console.error("Firebase Auth not initialized properly");
        }

        // Configure GoogleSignin
        await GoogleSignin.configure({
          webClientId: '816437624261-kegltatut9d6jv9sb6me72r80338un7f.apps.googleusercontent.com',
        });
        console.log("Google Sign-In configured");

        // Set up auth state listener
        const unsubscribe = auth().onAuthStateChanged((user) => {
          setUser(user);
          setInitializing(false);
          console.log("Auth state changed. User:", user ? "Logged in" : "Not logged in");
        });

        // Set a timeout to hide the splash screen and set initializing to false
        const splashTimeout = setTimeout(() => {
          BootSplash.hide({ fade: true });
          setInitializing(false);
          console.log("Splash screen hidden by timeout");
        }, 3000); // Adjust this timeout as needed

        return () => {
          unsubscribe();
          clearTimeout(splashTimeout);
        };
      } catch (error) {
        console.error("App initialization error:", error);
        setInitializing(false);
        BootSplash.hide({ fade: true });
      }
    };

    initApp();
  }, []);

  if (initializing) {
    return null; // Return null to keep showing the native splash screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />,
        })}
      >
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="ChapterList" component={ChapterListScreen}/>
            <Stack.Screen name="VerseList" component={VerseListScreen}/>
            <Stack.Screen name="Sloka" component={GitaSlokaScreen} />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 60,
    paddingHorizontal: 10,
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
  },
  ellipsisButton: {
    position: 'absolute',
    left: 10,
    padding: 5,
  },
  userButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
  },
  iconStyle: {
    resizeMode: 'contain',
  },
});

export default App;