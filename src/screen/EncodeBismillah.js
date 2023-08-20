import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  NativeModules,
  ScrollView,
  StatusBar,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {PermissionsAndroid} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    marginHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
  },
  imageContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  image: {
    height: 300,
    width: 200,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },

  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

const {LSBSteganography} = NativeModules;

const EncodeBismillah = () => {
  const [text, setText] = React.useState('');
  const [imageData, setImageData] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message:
            'This app requires access to your storage to store and read images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        handleOpenGallery();
      } else {
        console.log('Storage permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const handleOpenGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: false,
        // includeBase64: true, // This is important to get pixel data
      });

      setImageData(image);
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeText = newText => {
    setText(newText);
    console.log('Message:', newText);
  };

  const handleEncodeImage = async () => {
    if (!imageData || !text) {
      console.warn('Please select an image and enter a message');
      return;
    }

    try {
      // Remove the "file://" prefix
      const imagePath = imageData.path.replace('file://', '');

      console.log('====================================');
      console.log('Original image path', imagePath);
      console.log('====================================');
      // Use the encode method
      LSBSteganography.encode(imagePath, text, result => {
        if (result.startsWith('Error:')) {
          console.error(result);
        } else {
          console.log('Encoded image path:', result);
          setEncodedImageUri('file://' + result);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {imageData && (
          <>
            <Text>Original Image</Text>
            <Image
              source={{uri: imageData.path}}
              style={{width: 300, height: 400}}
            />
          </>
        )}
        {encodedImageUri && (
          <>
            <Text>Encoded Image</Text>
            <Image
              source={{uri: encodedImageUri}}
              style={{width: 300, height: 400}}
            />
          </>
        )}

        {!imageData && (
          <>
            <TouchableOpacity
              onPress={requestCameraPermission}
              style={styles.button}>
              <Text
                style={styles.buttonText}
                value={text}
                onChangeText={onChangeText}>
                Select from Gallery
              </Text>
            </TouchableOpacity>
          </>
        )}

        {!encodedImageUri && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={onChangeText}
              value={text}
              placeholder="Your message here"
            />
          </>
        )}

        {!encodedImageUri && (
          <>
            <TouchableOpacity onPress={handleEncodeImage} style={styles.button}>
              <Text style={styles.buttonText}>Encode</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default EncodeBismillah;
