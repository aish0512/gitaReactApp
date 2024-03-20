import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { GiftedChat, Time, Day } from 'react-native-gifted-chat';
import BootSplash from "react-native-bootsplash";
import { useEffect } from "react";
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const init = async () => {
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log("BootSplash has been hidden successfully");
    });
  }, []);

  const renderTime = (timeProps) => {
    return (
      <Time
        {...timeProps}
        timeTextStyle={{
          left: { color: '#595959' },
        }}
      />
    );
  };

  const welcomeMessage = {
    _id: 1,
    text: "Greetings, seeker of wisdom. You've entered a realm where ancient knowledge meets modern dilemmas. Inspired by the profound teachings of the Bhagavad Gita, I'm here to help you reflect, understand, and find peace in your answers. What life questions can I assist you with today?",
    createdAt: new Date(),
    user: {
      _id: 2, // Assuming '2' is the ID for the bot
      name: "Gita Bot",
      avatar: require('./assets/krishna.png'),
    },
  };
  
  //state of the bot
  const [messages, setMessage] = useState([welcomeMessage]); 
  const [inputMessage, setInputMessage] = useState(''); 
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chapterVerses, setChapterVerses] = useState([]);


  const sendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    if (!trimmedMessage) {
      console.log("Cannot send empty message.");
      return;
    }
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
      const response = await fetch('https://gita-chat-beta2.azurewebsites.net/api/gita_assistant_v1', {
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
        user: { _id: 2, avatar: require('./assets/krishna.png') },
      };
      setMessage(previousMessages => GiftedChat.append(previousMessages, [botMessage]));

      const responseText = data; 
      const regex = /Chapter \d+, Verse \d+/g;
      const found = responseText.match(regex) || [];
      setChapterVerses(found);

      const response2 = await fetch('https://getgitadata.azurewebsites.net/api/storeDataDB?', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "user_message": inputMessage,
          "bot_response": botMessage.text
        }),
      });

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

  const handleReferencePress = (reference) => {
    const sloka_id = reference;
    navigation.navigate('Sloka', { sloka_id });
  };
  
  

  return (
    <View style={styles.container}>
        <GiftedChat
          messages={messages}
          onSend={messages => setMessage(previousMessages => GiftedChat.append(previousMessages, messages))}
          user={{ _id: 1}}
          renderInputToolbar={() => null}
          style={styles.messagesContainer}
          renderTime={renderTime}
          renderDay={(props) => (
            <Day
              {...props}
              textStyle={{
                color: '#595959',
              }}
            />
          )}
        />
        {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <TouchableOpacity
            onPress={() => handleSuggestionPress("What is the purpose of life?")}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>What is the purpose of life?</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSuggestionPress("Who is Krishna??")}
            style={styles.suggestionButton}>
            <Text style={styles.suggestionButtonText}>Who is Krishna?</Text>
          </TouchableOpacity>
        </View>)}
        {chapterVerses.length > 0 && (<View style={styles.chapterContainer}>
          <Text>If you want to know about the verse, please click the below button.</Text>
          {chapterVerses.map((reference, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleReferencePress(reference)}
              style={[styles.suggestionButton,{ margin: 5 }]}>
              <Text style={[styles.suggestionButtonText, { textAlign: 'center' }]}>{reference}</Text>
            </TouchableOpacity>
          ))}
        </View>)}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputMessage}
            onChangeText={(text) => {
              setInputMessage(text);
              setShowSuggestions(false); 
              setChapterVerses([]); 
            }}
            placeholder="Type a message"
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
  },
  messagesContainer: {
    flex: 1,
    justifyContent: "center",
    color: 'green',
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
    color: '#767676'
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
    //flexDirection: 'row',
    justifyContent: 'center',
    //paddingBottom: 10,
  },
  suggestionButton: {
    backgroundColor: 'green',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 5,
    height: 49
  },
  suggestionButtonText: {
    color: '#fff',
  },
  chapterContainer: {
    padding: 10,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc', // Example disabled state color
  },
});