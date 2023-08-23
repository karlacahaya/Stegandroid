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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
    // justifyContent: 'center', // Center items vertically
    backgroundColor: '#c9c5e6',
    // flexDirection: 'column',
  },
  scrollView: {
    marginHorizontal: 20,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'column',
    marginTop: 20,
    justifyContent: 'center', // Center items vertically
    alignSelf: 'center', // Center-align the buttons
  },
  button: {
    backgroundColor: '#7369c2',
    padding: 15,
    borderRadius: 20,
    // marginHorizontal: 10,
    marginVertical: 12,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'white',
    marginHorizontal: 35,
  },
  headerContainer: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 38,
    fontWeight: 'bold',
    textAlign: 'center',
    // color: 'white'
  },
  header2Style: {
    fontSize: 27,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const HomeScreen = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerStyle}>STEGANDROID</Text>
          {/* <Text style={styles.header2Style}>Android Steganography</Text> */}
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
