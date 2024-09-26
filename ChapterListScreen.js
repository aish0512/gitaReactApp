import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const chapters = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  title: `Chapter ${i + 1}`,
}));

const ChapterListScreen = () => {
  const navigation = useNavigation();

  const renderChapterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => navigation.navigate('VerseList', { chapterId: item.id })}
    >
      <Text style={styles.chapterTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Bhagavad Gita Chapters</Text>
      <FlatList
        data={chapters}
        renderItem={renderChapterItem}
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
    color: '#ff881a'
  },
  chapterItem: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ff881a'
  },
});

export default ChapterListScreen;