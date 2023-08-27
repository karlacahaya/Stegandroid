import React, {useState, useEffect} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  TextInput,
  NativeModules,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  View,
} from 'react-native';
import {colors, spacings, fonts, styles} from '../helper/style';
import ImagePicker from 'react-native-image-crop-picker';
import GalleryPermissionButton from '../component/buttons/GalleryPermissions';
import CameraPermissionButton from '../component/buttons/CameraPermissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Aes from 'react-native-aes-crypto';
import ShareButton from '../component/buttons/ShareButton';

const {LSBSteganography} = NativeModules;

const EncodeBismillah = () => {
  const [textKey, setTextKey] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [useAesEncryption, setUseAesEncryption] = useState(false);
  const [pbkdf2Key, setPbkdf2Key] = useState(null);
  const [originalImageUri, setOriginalImageUri] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 400,
        cropping: true,
        // includeBase64: true, // This is important to get pixel data
      });

      setOriginalImageUri(image.path);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchCamera(options, res => {
      if (res.didCancel) {
        console.log('Cancelled');
      } else if (res.errorCode) {
        console.log(res.errorMessage);
      } else {
        const data = res.assets[0];
        setOriginalImageUri(data.uri);
      }
    });
  };

  const onChangeTextKey = newTextKey => {
    setTextKey(newTextKey);
    // setUseAesEncryption(true);
    // console.log('Key:', newTextKey);
  };

  const onChangeMessage = newText => {
    setMessage(newText);
    // console.log('Message:', newText);
  };

  const generateKey = (password, salt, cost, length) =>
    Aes.pbkdf2(password, salt, cost, length);

  const encryptData = (text, key) => {
    return Aes.randomKey(16).then(iv => {
      return Aes.encrypt(text, key, iv, 'aes-256-cbc').then(cipher => ({
        cipher,
        iv,
      }));
    });
  };

  const handleEncodeImage = async () => {
    try {
      if (!originalImageUri || !message) {
        console.warn('Please select an image and enter a message');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      let finalMessage = message;

      if (textKey && textKey.trim() !== '') {
        const password = textKey;

        // Generate a random salt for better security rather than using a hardcoded one
        const salt = await Aes.randomKey(16);
        console.log('salt', salt);

        const key = await generateKey(password, salt, 5000, 256);
        console.log('Key:', key);

        const {cipher, iv} = await encryptData(message, key);
        console.log('iv', iv);
        console.log('cipher:', cipher);

        finalMessage = `${salt}${iv}${cipher}`;
        setUseAesEncryption(true);
      } else {
        setUseAesEncryption(false);
      }

      console.log('finalMessage', finalMessage);
      const imagePath = originalImageUri.replace('file://', '');

      LSBSteganography.encode(
        imagePath,
        finalMessage,
        textKey ? textKey : null, // Pass the password if provided, otherwise null
        useAesEncryption,
        result => {
          setIsLoading(false);
          if (result.startsWith('Error:')) {
            setErrorMessage(result);
            setIsErrorModalVisible(true);
          } else {
            // console.log('Encoded image path:', result);
            setEncodedImageUri(result);
            setIsSuccessModalVisible(true);
          }
        },
      );
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(`Error: ${error.message}`);
      setIsErrorModalVisible(true);
    }
  };

  console.log('encodedImageUri',encodedImageUri);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {originalImageUri && !encodedImageUri && (
          <>
            <Text>Original Image</Text>
            <Image
              source={{uri: originalImageUri}}
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

        {!originalImageUri && (
          <GalleryPermissionButton onPress={handleOpenGallery} />
        )}
        {!originalImageUri && (
          <CameraPermissionButton onPress={handleOpenCamera} />
        )}

        {!encodedImageUri && originalImageUri && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={onChangeTextKey}
              value={textKey}
              placeholder="Password (Optional)"
            />
          </>
        )}

        {!encodedImageUri && originalImageUri && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={onChangeMessage}
              value={message}
              placeholder="Your message here"
            />
          </>
        )}

        {!encodedImageUri && originalImageUri && (
          <>
            <TouchableOpacity onPress={handleEncodeImage} style={styles.button}>
              <Text style={styles.buttonText}>Encode</Text>
            </TouchableOpacity>
          </>
        )}

        {encodedImageUri && <ShareButton encodedImageUri={encodedImageUri} />}

        {/* <TouchableOpacity onPress={test} style={styles.button}>
          <Text style={styles.buttonText}>test</Text>
        </TouchableOpacity> */}

        {/* <SaveToGalleryButton tag={encodedImageUri} /> */}

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

        {/* modal if error */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isErrorModalVisible}
          onRequestClose={() => {
            setIsErrorModalVisible(false);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{errorMessage}</Text>
              <TouchableOpacity
                style={{...styles.button1, backgroundColor: '#f05146'}}
                onPress={() => setIsErrorModalVisible(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* modal if success */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isSuccessModalVisible}
          onRequestClose={() => {
            setIsSuccessModalVisible(false);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Encoded image has been saved!
              </Text>
              <TouchableOpacity
                style={{...styles.button1, backgroundColor: '#5f5ae8'}}
                onPress={() => setIsSuccessModalVisible(false)}>
                <Text style={styles.textStyle}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EncodeBismillah;

// const handleEncodeImage = async () => {
//   if (!originalImageUri || !message) {
//     console.warn('Please select an image and enter a message');
//     return;
//   }

//   setIsLoading(true);

//   try {
//     const imagePath = originalImageUri.replace('file://', '');

//     // Determine whether to use AES encryption based on the toggle switch
//     if (useAesEncryption && textKey) {
//       LSBSteganography.encode(imagePath, message, textKey, result => {
//         setIsLoading(false);

//         if (result.startsWith('Error:')) {
//           setErrorMessage(result);
//           setIsErrorModalVisible(true);
//         } else {
//           console.log('Encoded image path:', result);
//           setEncodedImageUri(result);
//           setIsSuccessModalVisible(true);
//         }
//       });
//     } else {
//       // No AES encryption
//       LSBSteganography.encode(imagePath, message, null, result => {
//         setIsLoading(false);

//         if (result.startsWith('Error:')) {
//           setErrorMessage(result);
//           setIsErrorModalVisible(true);
//         } else {
//           console.log('Encoded image path:', result);
//           setEncodedImageUri(result);
//           setIsSuccessModalVisible(true);
//         }
//       });
//     }
//   } catch (error) {
//     setIsLoading(false);
//     setErrorMessage(error.message);
//     setIsErrorModalVisible(true);
//   }
// };
