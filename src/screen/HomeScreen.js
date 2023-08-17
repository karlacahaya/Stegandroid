import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Steganography App</Text>
        <Button
          title="Encode"
          onPress={() => navigation.navigate('Encode')}
        />
        <Button
          title="Decode"
          onPress={() => navigation.navigate('Decode')}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 24,
      marginBottom: 20,
    },
  });
  
  export default HomeScreen;