import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { GiftedChat, Time, Day, Bubble } from 'react-native-gifted-chat';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BootSplash from "react-native-bootsplash";
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from 'react-native-google-signin';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [messages, setMessage] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoGreetings, setShowLogoGreetings] = useState(true);

  useEffect(() => {
    BootSplash.hide({ fade: true }).then(() => {
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: styles.userMessage,
        left: styles.botMessage,
      }}
      textStyle={{
        right: styles.userMessageText,
        left: styles.botMessageText,
      }}
    />
  );

  const renderTime = (timeProps) => (
    <Time
      {...timeProps}
      timeTextStyle={{
        right: { color: '#000' },
        left: { color: '#595959' },
      }}
    />
  );

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage.length === 0) return;

    setInputMessage('');
    setShowSuggestions(false);
    setShowLogoGreetings(false);

    const newMessage = {
      _id: Math.random().toString(36).substring(7),
      text: trimmedMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };
    setMessage((previousMessages) => GiftedChat.append(previousMessages, [newMessage]));

    try {
      const response = await fetch('https://gita-chat-beta2.azurewebsites.net/api/gita_assistant_v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: trimmedMessage }),
      });
      const data = await response.text();
      const botMessage = {
        _id: Math.random().toString(36).substring(7),
        text: data.trim(),
        createdAt: new Date(),
        user: { _id: 2, avatar: require('./assets/orange_logo.png') },
      };
      setMessage((previousMessages) => GiftedChat.append(previousMessages, [botMessage]));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <View style={styles.container}>
      {showLogoGreetings && (
        <View style={styles.fullScreenCenter}>
          <Image
            source={require('./assets/g_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.greetingsMsg}>
            <Text style={styles.greetingsText}>
              "Greetings, seeker of wisdom. You've entered a realm where ancient knowledge meets modern dilemmas. Inspired by the profound teachings of the Bhagavad Gita, I'm here to help you reflect, understand, and find peace in your answers."
            </Text>
          </View>
        </View>
      )}

      <GiftedChat
        messages={messages}
        onSend={(messages) => setMessage((previousMessages) => GiftedChat.append(previousMessages, messages))}
        user={{ _id: 1 }}
        renderBubble={renderBubble}
        renderTime={renderTime}
        renderDay={() => null}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={(text) => {
            setInputMessage(text);
            setShowSuggestions(false);
            setShowLogoGreetings(false);
          }}
          placeholder="Type here..."
          editable={!isLoading}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#000" />
        ) : (
          <TouchableOpacity onPress={sendMessage} disabled={!inputMessage.trim()} style={styles.sendButton}>
            <Image
              source={require('./assets/send_button_blue.png')} 
              style={{ width: 25, height: 25 }}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
  },
  fullScreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  greetingsMsg: {
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  greetingsText: {
    textAlign: 'center',
    color: '#595959',
  },
  userMessage: {
    backgroundColor: '#449afb',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    padding: 10,
    marginVertical: 5,
  },
  botMessage: {
    backgroundColor: '#FFE9D4',
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    padding: 10,
    marginVertical: 5,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

