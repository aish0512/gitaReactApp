// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { GiftedChat, Time, Bubble } from 'react-native-gifted-chat';
import BootSplash from 'react-native-bootsplash';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    {
      _id: 1,
      text: "What life questions can I assist you with today?",
      createdAt: new Date(),
      user: {
        _id: 2,
        name: "Gita Bot",
        avatar: require('./assets/orange_logo.png'),
      },
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chapterVerses, setChapterVerses] = useState([]);
  const [showLogoGreetings, setShowLogoGreetings] = useState(true);

  useEffect(() => {
    const init = async () => {};

    GoogleSignin.configure({
      webClientId: '816437624261-kegltatut9d6jv9sb6me72r80338un7f.apps.googleusercontent.com',
    });

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log('BootSplash has been hidden successfully');
    });
  }, []);

  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) {
      console.log('Cannot send empty message.');
      return;
    }
    setIsLoading(true);
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1 },
    };
    setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
    setInputMessage('');
    setShowSuggestions(false);
    setShowLogoGreetings(false);

    try {
      const response = await fetch('https://gita-chat-beta2.azurewebsites.net/api/gita_assistant_v1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputMessage }),
      });
      const data = await response.json();
      const botMessage = {
        _id: Math.random().toString(36).substring(7),
        text: data.trim(),
        createdAt: new Date(),
        user: { _id: 2, avatar: require('./assets/orange_logo.png') },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));

      const regex = /Chapter \d+, Verse \d+/g;
      const found = data.match(regex) || [];
      setChapterVerses(found);

      await fetch('https://getgitadata.azurewebsites.net/api/storeDataDB?', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: inputMessage,
          bot_response: botMessage.text
        }),
      });
    } catch (error) {
      console.error('Error fetching data: ', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  const handleReferencePress = (reference) => {
    const sloka_id = reference;
    navigation.navigate('Sloka', { sloka_id });
  };

  const signOut = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
        await auth().signOut();
        Alert.alert('Signed out');
        navigation.replace('Login');
      } else {
        Alert.alert('You are not signed in');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        left: styles.botMessage,
        right: styles.userMessage,
      }}
      textStyle={{
        left: styles.botMessageText,
        right: styles.userMessageText,
      }}
    />
  );

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
        onSend={messages => setMessages(previousMessages => GiftedChat.append(previousMessages, messages))}
        user={{ _id: 1 }}
        renderInputToolbar={() => null}
        renderBubble={renderBubble}
        renderTime={(timeProps) => (
          <Time
            {...timeProps}
            timeTextStyle={{
              left: { color: '#000' },
              right: { color: '#000' }
            }}
          />
        )}
        renderDay={() => null}
      />
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <TouchableOpacity
            onPress={() => handleSuggestionPress('What is the purpose of life?')}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>What is the purpose of life?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSuggestionPress('Who is Krishna?')}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>Who is Krishna?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      )}
      {chapterVerses.length > 0 && (
        <View style={styles.chapterContainer}>
          {chapterVerses.map((reference, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleReferencePress(reference)}
              style={[styles.suggestionButton, { margin: 5 }]}>
              <Text style={styles.suggestionButtonText}>{reference}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={(text) => {
            setInputMessage(text);
            setShowSuggestions(false);
            setChapterVerses([]);
            setShowLogoGreetings(false);
          }}
          placeholder="Type here.."
          editable={!isLoading}
        />
        {isLoading ? (
          <ActivityIndicator size="small" color="#0000ff" />
        ) : (
          <TouchableOpacity
            onPress={sendMessage}
            style={[styles.sendButton, inputMessage.trim() ? {} : styles.disabledButton]}
            disabled={!inputMessage.trim()}
          >
            <Image
              source={require('./assets/send_button_blue.png')}
              style={[styles.sendButton, inputMessage.trim() ? {} : styles.disabledButton]}
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
    justifyContent: 'justify',
    alignItems: 'center',
    marginTop: 50,
  },
  greetingsText: {
    textAlign: 'center',
    color: '#595959',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#449afb',
    borderRadius: 20,
    borderBottomRightRadius: 0,
    padding: 10,
    marginVertical: 5,
  },
  botMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFE9D4',
    borderRadius: 20,
    borderBottomLeftRadius: 0,
    padding: 10,
    marginVertical: 5,
  },
  greetingsMsg: {
    paddingHorizontal: 30,
    paddingVertical: 5,
  },
  botImage: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  logo: {
    marginBottom: '5px',
  },
  userMessageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#0577fa',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
    color: '#404040',
  },
  sendButton: {
    borderRadius: 9999,
    padding: 12,
    width: 50,
    height: 50,
    justifyContent: 'center',
  },
  suggestionsContainer: {
    justifyContent: 'center',
  },
  suggestionButton: {
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    height: 49,
    borderColor: '#ff9633',
    borderWidth: 1,
  },
  suggestionButtonText: {
    color: '#ff881a',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chapterContainer: {
    padding: 10,
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
