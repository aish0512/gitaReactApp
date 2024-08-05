// LoginScreen.js
import React  from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import BootSplash from "react-native-bootsplash";
import { useEffect } from "react";
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


const LoginScreen = ({ navigation }) => {
    useEffect(() => {
        const init = async () => {
        };
    
        init().finally(async () => {
          await BootSplash.hide({ fade: true });
          console.log("BootSplash has been hidden successfully");
        });
        GoogleSignin.configure({
            webClientId: '816437624261-kegltatut9d6jv9sb6me72r80338un7f.apps.googleusercontent.com',
          });
      
        }, []
    );


    async function onGoogleButtonPress() {
      try{
        // Check if your device supports Google Play
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken, user } = await GoogleSignin.signIn();
        console.log(user)
        Alert.alert("success")
        navigation.replace('Home');
        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        

        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
      }
      catch(error){
        console.log(error)
      }
    }
    const handleLogin = () => {
        // Add your login logic here
        // For now, we'll navigate to the Home screen after login
        navigation.replace('Home');
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title="Login" onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});

export default LoginScreen;
