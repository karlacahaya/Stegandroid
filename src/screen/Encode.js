import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {decode} from 'base-64';
import Exif from 'react-native-exif';
import base64 from 'react-native-base64';
import {manipulate} from 'react-native-image-tools';
// import ReactNativeBlobUtil from 'react-native-blob-util';
// import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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

const Encode = () => {
  const [text, setText] = React.useState('');
  const [imageData, setImageData] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);
  const [imageFileUri, setImageFileUri] = useState(null);

  const handleOpenGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true, // This is important to get pixel data
      });

      setImageData(image);
      setImageUri(image.data);
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeText = newText => {
    setText(newText);
    console.log('Encoded Message:', text);
  };

  const handleEncodeImage = async () => {
    if (!imageUri || !text) {
      console.warn('Please select an image and enter a message');
      return;
    }

    try {
      const binaryMessage = text
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

      console.log('binaryMessage', binaryMessage);

      // const manipulatedImage = await ImageManipulator.manipulateAsync(
      //   imageUri,
      //   [{resize: {width: 300, height: 400}}], // Resize operation
      //   {base64: true}, // Include base64 data for manipulation
      // );

      // const imageData = manipulatedImage.base64;

      // Embed the binary message into the pixel data
      const binaryArray = imageUri.split('');
      for (let i = 0; i < binaryMessage.length; i++) {
        const bit = binaryMessage[i];
        binaryArray[i] = `${(binaryArray[i] & 0xfe) | parseInt(bit)}`;
      }
      const encodedImageData = binaryArray.join('');
      setEncodedImageUri(encodedImageData);

      console.log('encodedImageData', encodedImageData);
      // Create a new manipulated image with the encoded data
      // const encodedImage = await ImageManipulator.manipulateAsync(
      //   `data:image/jpeg;base64,${encodedImageData}`,
      //   [{resize: {width: 300, height: 400}}],
      //   {format: 'jpeg'},
      // );

      // // setImageUri(encodedImage.uri);
    } catch (error) {
      console.error(error);
    }
  };

  const convertBase64ToImage = async (base64String) => {
    const encodedImageData = encodedImageUri.atob(base64String);
    const filePath = `${RNFS.DocumentDirectoryPath}/converted_image.jpg`;

    await RNFS.writeFile(filePath, binaryImageData, 'base64');

    setImageFileUri(filePath);
  };



  return (
    <SafeAreaView style={styles.container}>
      {imageData && (
        <Image
          source={{uri: imageData.path}}
          style={{width: 300, height: 400}}
        />
      )}
      {imageFileUri && (
        <>
          <Image
            source={{uri: imageData.path}}
            style={{width: 300, height: 400}}
          />
        </>
      )}
      <TouchableOpacity onPress={handleOpenGallery} style={styles.button}>
        <Text
          style={styles.buttonText}
          value={text}
          onChangeText={onChangeText}>
          Select from Gallery
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        onChangeText={onChangeText}
        value={text}
        placeholder="Your message here"
      />

      <TouchableOpacity onPress={handleEncodeImage} style={styles.button}>
        <Text style={styles.buttonText}>Encode</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Encode;
