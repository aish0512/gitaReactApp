import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const chapterVerses = {
  1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47, 7: 30, 8: 28, 9: 34,
  10: 42, 11: 55, 12: 20, 13: 35, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78
};

const VerseListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chapterId } = route.params;

  const verses = Array.from({ length: chapterVerses[chapterId] || 0 }, (_, i) => ({
    id: i + 1,
    title: `Verse ${i + 1}`,
  }));

  const renderVerseItem = ({ item }) => (
    <TouchableOpacity
      style={styles.verseItem}
      onPress={() => navigation.navigate('Sloka', { 
        sloka_id: `Chapter ${chapterId}, Verse ${item.id}` 
      })}
    >
      <Text style={styles.verseTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Chapter {chapterId} Verses</Text>
      <FlatList
        data={verses}
        renderItem={renderVerseItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  verseItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  verseTitle: {
    fontSize: 16,
  },
});

export default VerseListScreen;