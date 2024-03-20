import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import slokaImage from 'C:/Users/Abhi/Oishi/react-native/gitaReactApp/assets/gita.png';

function GitaSlokaScreen({ route }) {
  const { sloka_id } = route.params;
  const [slokaData, setSlokaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(sloka_id)
    
    const fetchSlokaData = async () => {
      if (!sloka_id) return;
    
      try {
        const response = await fetch('https://getslok.azurewebsites.net/api/fetchsloka', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sloka_id: sloka_id }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Extracting the English text
        const englishText = data["English Text"];
        // Extracting the Sanskrit text
        const sanskritText = data["Sanskrit Text"];

        setSlokaData({
          'Sanskrit Text': sanskritText,
           'English Text': englishText,
       });
      } catch (error) {
        console.error('Error fetching sloka data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
  
    fetchSlokaData();
  }, [sloka_id]);

  const containerStyle = isLoading ? styles.containerLoading : styles.container;

  return (
    <View style={containerStyle}>
      {isLoading ? (
        <ActivityIndicator size="large" />
      ) : slokaData ? (
        <>
          <Image source={slokaImage} style={styles.image} />
          <Text style={styles.sanskritText}>{slokaData['Sanskrit Text']}</Text>
          <Text style={styles.englishText}>{slokaData['English Text']}</Text>
        </>
      ) : (
        <Text style={styles.errorText}>Sloka not found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 0,
    backgroundColor: '#f5f4ec',
  },
  sanskritText: {
    fontSize: 18,
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  englishText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20, 
    alignItems: 'center'
  },
});

export default GitaSlokaScreen;