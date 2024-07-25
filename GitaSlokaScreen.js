import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ImageBackground } from 'react-native';
// import slokaImage from 'C:/Users/Abhi/Oishi/react-native/gitaReactApp/assets/gita.png';

function GitaSlokaScreen({ route }) {
  const { sloka_id } = route.params;
  const [slokaData, setSlokaData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
          {/* <Image source={slokaImage} style={styles.image} /> */}
          <ImageBackground source={require('./assets/sloka_bg.png')} style={styles.backgroundImage}>
            <View style={styles.content_top}>
              <View style={styles.yellow_box}>
                <Text style={styles.yellow_text}>{sloka_id}</Text>
              </View>
            </View>
            <View style={styles.content_end}>
              <View style={styles.blue_box}>
                <Text style={styles.sanskritText}>{slokaData['Sanskrit Text']}</Text>
                <Text style={styles.englishText}>{slokaData['English Text']}</Text>
              </View>
            </View>
          </ImageBackground>
        </>
      ) : (
        <Text style={styles.errorText}>Sloka not found</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sanskritText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  englishText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover', 
  },
  content_end: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
    margin: 10,
  },
  content_top: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  yellow_text:{
    color: '#ffcc00'
  },
  yellow_box:{
    borderWidth: 1,
    borderColor: '#ffcc00',
    borderRadius: 20,
    paddingHorizontal: 100,
    paddingVertical: 10,
    margin: 20,
  },
  blue_box: {
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 20,
    padding: 15,
    margin: 10,
  }
});
  
export default GitaSlokaScreen;