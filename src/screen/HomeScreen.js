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
import { stylesHome } from '../helper/style';

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={stylesHome.container}>
      <ScrollView style={stylesHome.scrollView}>
        <View style={stylesHome.headerContainer}>
          <Text style={stylesHome.headerStyle}>STEGANDROID</Text>
        </View>

        <View style={stylesHome.buttonContainer}>
          <TouchableOpacity style={stylesHome.button}>
            <Text
              onPress={() => navigation.navigate('Encode')}
              style={stylesHome.buttonText}>
              Encode
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={stylesHome.button}>
            <Text
              onPress={() => navigation.navigate('Decode')}
              style={stylesHome.buttonText}>
              Decode
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
