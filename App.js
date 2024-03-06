import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GiftedChat } from 'react-native-gifted-chat';
import BootSplash from "react-native-bootsplash";
import { useEffect } from "react";


export default function App() {
  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  const welcomeMessage = {
    _id: 1,
    text: "Greetings, seeker of wisdom. You've entered a realm where ancient knowledge meets modern dilemmas. Inspired by the profound teachings of the Bhagavad Gita, I'm here to help you reflect, understand, and find peace in your answers. What life questions can I assist you with today?",
    createdAt: new Date(),
    user: {
      _id: 2, 
      name: "Gita Bot",
      avatar: require('./assets/logo.png'),
    },
  };
  const [messages, setMessage] = useState([welcomeMessage]); 
  const [inputMessage, setInputMessage] = useState(''); 
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    setIsLoading(true);
    const message = {
      _id:Math.random().toString(36).substring(7),
      text: inputMessage,
      createdAt: new Date(),
      user: {
        _id: 1,
      },
    };
    setMessage((previousMessages)=>
      GiftedChat.append(previousMessages, [message])
    )
    setInputMessage('');
    setShowSuggestions(false);
    
    try {
      const response = await fetch('https://gita-chat-beta2.azurewebsites.net/api/gita_assistant_v1?Content-Type=application/json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ "prompt": inputMessage }),
      });
      const data = await response.json();
      const botMessage = {
        _id: Math.random().toString(36).substring(7),
        text: data.trim(),
        createdAt: new Date(),
        user: { _id: 2, avatar: require('./assets/logo.png') },
      };
      setMessage(previousMessages => GiftedChat.append(previousMessages, [botMessage]));
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setInputMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={messages => setMessage(previousMessages => GiftedChat.append(previousMessages, messages))}
          user={{ _id: 1}}
          renderInputToolbar={() => null}
          style={styles.messagesContainer}
        />
        {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <TouchableOpacity
            onPress={() => handleSuggestionPress("What is the purpose of life?")}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>Purpose of Life</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSuggestionPress("Who is Krishna?")}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>Krishna</Text>
          </TouchableOpacity>
        </View>)}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Type a message"
            editable={!isLoading} // Disable input when loading
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
              <MaterialIcons name="send" size={25} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f4ec',
    marginTop: 10,
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "center",
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F7D6D0',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  botMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  botImage: {
    width: 40, 
    height: 40, 
    marginRight: 10, 
  },  
  messageText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    padding: 10,
    backgroundColor: '#fff',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: 'green',
    borderRadius: 9999,
    padding: 12,
    marginRight: 5,
    marginBottom: 5,
    width: 50,
    height: 50,
    justifyContent: "center"
  },
  sendButtonText: {
    color: '#fff',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  suggestionButton: {
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
  },
  suggestionButtonText: {
    color: '#fff',
  },
});