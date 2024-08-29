import React from 'react';
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
      navigation.replace('Login');
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
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={({ navigation }) => ({
          header: () => <CustomHeader navigation={navigation} />,
        })}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ChapterList" component={ChapterListScreen}/>
        <Stack.Screen name="VerseList" component={VerseListScreen}/>
        <Stack.Screen name="Sloka" component={GitaSlokaScreen} />
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