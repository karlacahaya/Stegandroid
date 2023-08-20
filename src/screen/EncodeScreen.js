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
import { decode } from 'base-64'
import Exif from 'react-native-exif';
import base64 from 'react-native-base64'


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

const EncodeScreen = () => {
  const [isExist, setIsExist] = useState(false);
  const [isEncode, setIsEncode] = useState(false);
  const [imageCamera, setImageCamera] = useState(null);
  const [imageGallery, setImageGallery] = useState(null);
  const [text, setText] = React.useState('');
  // const [encodedImage, setEncodedImage] = useState(null); // State to hold the encoded image URI
  const [imageUri, setImageUri] = useState(null);
  const [imageMetadata, setImageMetadata] = useState(null);

  
  

  // const requestCameraPermission = async () => {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       {
  //         title: 'App Camera Permission',
  //         message: 'App needs access to your camera ',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       handleOpenCamera();
  //     } else {
  //       console.log('Camera permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // };

  // const handleOpenCamera = () => {
  //   const options = {
  //     mediaType: 'photo',
  //     quality: 1,
  //   };

  //   launchCamera(options, res => {
  //     if (res.didCancel) {
  //       console.log('Cancelled');
  //     } else if (res.errorCode) {
  //       console.log(res.errorMessage);
  //     } else {
  //       const data = res.assets[0];
  //       setImageCamera(data);
  //       setIsExist(true);
  //       console.log(data);
  //     }
  //   });
  // };

  // const handleOpenGallery = () => {
  //   const options = {
  //     mediaType: 'photo',
  //     quality: 1,
  //   };

  //   launchImageLibrary(options, res => {
  //     if (res.didCancel) {
  //       console.log('Cancelled');
  //     } else if (res.errorCode) {
  //       console.log(res.errorMessage);
  //     } else {
  //       const data = res.assets[0];
  //       setImageGallery(data);
  //       setIsExist(true);
  //       console.log(data);
  //     }
  //   });
  // };

  const handleClearImage = () => {
    setImageCamera(null);
    setImageGallery(null);
    setIsExist(false);
  };

  const handleProceedImg = () => {
    setIsEncode(true);
  };

  // useEffect(() => {
  //   if (isEncode && text && (imageCamera || imageGallery)) {
  //     // Encode the message into the image
  //     encodeMessageIntoImage();
  //   }
  // }, [isEncode, text, imageCamera, imageGallery]);

  // const encodeMessageIntoImage = () => {
  //   // Convert the message to binary
  //   const binaryMessage = text
  //     .split('')
  //     .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
  //     .join('');

  //   // Prepare the image data
  //   let imageData = null;
  //   if (imageCamera) {
  //     imageData = imageCamera;
  //   } else if (imageGallery) {
  //     imageData = imageGallery;
  //   } else {
  //     console.log("No image data available for encoding");
  //     return;
  //   }

  //   const pixelData = [...imageData.pixelData]; // Convert to array

  //   let messageIndex = 0;

  //   for (let i = 0; i < pixelData.length; i++) {
  //     if (messageIndex < binaryMessage.length) {
  //       const pixel = pixelData[i];
  //       const bitToEncode = binaryMessage[messageIndex];
  //       const encodedPixel = (pixel & 0xfe) | parseInt(bitToEncode);

  //       pixelData[i] = encodedPixel;

  //       // Move to the next bit once all bits are encoded
  //       if ((i + 1) % 8 === 0) {
  //         messageIndex++;
  //       }
  //     } else {
  //       break; // Stop encoding when the message is fully encoded
  //     }
  //   }

  //   // Create a new pixel data Uint8Array
  //   const newPixelData = new Uint8Array(pixelData);

  //   // Create a Blob from the pixel data and set it as the encoded image
  //   const encodedBlob = new Blob([newPixelData], {type: 'image/jpeg'});
  //   const encodedImageUrl = URL.createObjectURL(encodedBlob);
  //   setEncodedImage(encodedImageUrl);
  // };

  const handleOpenGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        includeBase64: true, // This is important to get pixel data
      });

      setImageUri(imageUri.data)

      // console.log('image.data', image.data)

      const test = base64.decode(image.data)
      // console.log('hasil decode:', test)


    } catch (error) {
      console.error(error);
    }
  };

  const onChangeText = (newText) => {
    setText(newText); // Update the state with the new input value
    console.log('Encode Message', setText);
  };
  

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={styles.imageContainer}>
        {imageCamera && (
          <Image source={{uri: imageCamera.uri}} style={styles.image} />
        )}

        {imageGallery && (
          <Image source={{uri: imageGallery.uri}} style={styles.image} />
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!isExist && (
          <>
            <TouchableOpacity
              onPress={requestCameraPermission}
              style={styles.button}>
              <Text style={styles.buttonText}>Take a Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleOpenGallery} style={styles.button}>
              <Text style={styles.buttonText}>Select from Gallery</Text>
            </TouchableOpacity>
          </>
        )}

        {isExist && !isEncode && (
          <>
            <TouchableOpacity onPress={handleClearImage} style={styles.button}>
              <Text style={styles.buttonText}>Clear Image</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleProceedImg} style={styles.button}>
              <Text style={styles.buttonText}>Use this picture</Text>
            </TouchableOpacity>
          </>
        )}

        {isEncode && (
          <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            value={text}
            placeholder="Your message here"
          />
        )}

        {isEncode && (
          <TouchableOpacity onPress={encodeMessageIntoImage} style={styles.button}>
            <Text style={styles.buttonText}>Encode Message</Text>
          </TouchableOpacity>
        )}

        {encodedImage && (
          <Image source={{uri: encodedImage}} style={styles.image} />
        )}
      </View> */}

      {imageUri && (
        <Image source={{uri: imageUri.path}} style={{width: 300, height: 400}} />
      )}
      <TouchableOpacity onPress={handleOpenGallery} style={styles.button}>
        <Text 
        style={styles.buttonText}
        value={text}
        onChangeText={onChangeText}
        >Select from Gallery</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EncodeScreen;
