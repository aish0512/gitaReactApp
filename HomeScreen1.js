import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { GiftedChat, Time, Day, Bubble } from 'react-native-gifted-chat';
import BootSplash from 'react-native-bootsplash';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import firestore from '@react-native-firebase/firestore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chapterVerses, setChapterVerses] = useState([]);

  const loadMessages = () => {
    const userId = auth().currentUser?.uid;
    if (!userId) {
      console.log('No user logged in');
      return;
    }
  
    const userMessagesRef = firestore()
      .collection('users')
      .doc(userId)
      .collection('messages')
      .orderBy('createdAt', 'desc');
  
    userMessagesRef.onSnapshot(snapshot => {
      if (snapshot.empty) {
        setMessages([{
          _id: 1,
          text: "How can I assist you?",
          createdAt: new Date(),
          user: {
            _id: 2,
            name: "Bot",
            avatar: require('./assets/orange_logo.png'),
          },
        }]);
      } else {
        const fetchedMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            _id: doc.id,
            text: data.text,
            createdAt: data.createdAt.toDate(),
            user: data.user,
          };
        });
        setMessages(fetchedMessages);
      }
    }, error => {
      console.error("Error loading messages: ", error);
      Alert.alert("Error loading messages", error.message);
    });
  };
  
  
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        loadMessages();
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, []);
  
  
  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) {
      console.log('Cannot send empty message.');
      return;
    }
    setIsLoading(true);
    const userId = auth().currentUser.uid;
    const message = {
      _id: Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: { _id: 1, name: 'User'},
    };
    setMessages(previousMessages => GiftedChat.append(previousMessages, [message]));
    setInputMessage('');
    setShowSuggestions(false);

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
        user: { _id: 2, name: 'Bot', avatar: require('./assets/orange_logo.png') },
      };
      setMessages(previousMessages => GiftedChat.append(previousMessages, [botMessage]));

      // Save messages to Firestore
      const userMessagesRef = firestore().collection('users').doc(userId).collection('messages');
      await userMessagesRef.add(message);
      await userMessagesRef.add(botMessage);

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

  // const signOut = async () => {
  //   try {
  //     const isSignedIn = await GoogleSignin.isSignedIn();
  //     if (isSignedIn) {
  //       await GoogleSignin.revokeAccess();
  //       await GoogleSignin.signOut();
  //       await auth().signOut();
  //       // Alert.alert('Signed out');
  //       navigation.replace('Login');
  //     } else {
  //       Alert.alert('You are not signed in');
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    const isBotMessage = currentMessage.user._id === 2;

    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: isBotMessage ? styles.botMessage : styles.userMessage,
          right: isBotMessage ? styles.userMessage : styles.userMessage,
        }}
        textStyle={{
          left: isBotMessage ? styles.botMessageText : styles.userMessageText,
          right: isBotMessage ? styles.userMessageText : styles.userMessageText,
        }}
      >
        <View style={isBotMessage ? styles.botMessage : styles.userMessage}>
          {isBotMessage && (
            <Image
              source={require('./assets/orange_logo.png')}
              style={styles.botImage}
            />
          )}
          <Text style={isBotMessage ? styles.botMessageText : styles.userMessageText}>
            {currentMessage.text}
          </Text>
        </View>
      </Bubble>
    );
  };

  
  return (
    <View style={styles.container}>
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
              right: { color: '#fff' }
            }}
          />
        )}
        // renderDay={() => null}
        // renderDay={(props) => (
        //   <Day
        //     {...props}
        //     textStyle={{ color: '#f9f9f9' }} 
        //   />
        // )}
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
    color: '#fff',
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
