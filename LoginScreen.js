import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import BootSplash from "react-native-bootsplash";
import auth from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    const init = async () => {
      try {
        await configureGoogleSignIn();
        await BootSplash.hide({ fade: true });
        console.log("BootSplash has been hidden successfully");
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    init();
  }, []);

  const configureGoogleSignIn = async () => {
    try {
      await GoogleSignin.configure({
        webClientId: '816437624261-kegltatut9d6jv9sb6me72r80338un7f.apps.googleusercontent.com',
        offlineAccess: true,
      });
      console.log("Google Sign-In configured successfully");
    } catch (error) {
      console.error("Google Sign-In configuration error:", error);
    }
  };

  const onGoogleButtonPress = async () => {
    try {
      console.log("Google Sign-In button pressed");
      
      // Check if Google Play Services is available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log("Google Play Services is available");
  
      // Attempt to sign in
      const { idToken, user } = await GoogleSignin.signIn();
      console.log("Google Sign-In successful", user);
  
      // Create a credential
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      console.log("Google credential created");
  
      // Sign in to Firebase
      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log("Firebase sign-in successful", userCredential.user.displayName);
  
      // Navigate to Home screen
      navigation.replace('Home');
    } catch (error) {
      console.error("Google Sign-In error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert("Sign-In Cancelled", "The sign-in process was cancelled.");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert("Sign-In in Progress", "The sign-in process is already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert("Play Services Not Available", "Google Play Services is not available or outdated.");
      } else {
        Alert.alert("Sign-In Error", `An unexpected error occurred. Error code: ${error.code}\nError message: ${error.message}`);
      }
  
      // Additional error information logging
      if (error.response) {
        console.error("Error response:", error.response);
      }
      if (error.request) {
        console.error("Error request:", error.request);
      }
      if (error.config) {
        console.error("Error config:", error.config);
      }
    }
  };
  
  return (
    <ImageBackground
      source={require('./assets/Login_1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={onGoogleButtonPress}
          >
            <Image
              source={require('./assets/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  buttonContainer: {
    marginBottom: 40, // Adjust this value to position the button correctly
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignSelf: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LoginScreen;