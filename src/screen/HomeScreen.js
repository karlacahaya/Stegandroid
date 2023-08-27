import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
} from 'react-native';
import { styles } from '../helper/style';

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerStyle}>STEGANDROID</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <Text
              onPress={() => navigation.navigate('Encode')}
              style={styles.buttonText}>
              Encode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text
              onPress={() => navigation.navigate('Decode')}
              style={styles.buttonText}>
              Decode
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
