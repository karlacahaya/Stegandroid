import React, {useState, useEffect, useCallback} from 'react';
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
import styles from '../helper/style';
import ImagePicker from 'react-native-image-crop-picker';
import Aes from 'react-native-aes-crypto';
import {Card} from 'react-native-paper';

const {LSBSteganography} = NativeModules;

const DecodeScreen = () => {
  const [textKey, setTextKey] = React.useState('');
  const [originalImageUri, setOriginalImageUri] = useState(null);
  const [useAesEncryption, setUseAesEncryption] = useState(false);
  const [decodedImageMsg, setDecodedImageMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleOpenGallery = async () => {
    try {
      const image = await ImagePicker.openPicker({
        cropping: false,
      });

      setOriginalImageUri(image.path);
    } catch (error) {
      console.error(error);
    }
  };

  const onChangeTextKey = newTextKey => {
    setTextKey(newTextKey);
    // Check if the input is empty or just whitespace
    if (!newTextKey.trim()) {
      setUseAesEncryption(false);
    } else {
      setUseAesEncryption(true);
    }
  };

  const handleClearImage = () => {
    setOriginalImageUri(null);
    setDecodedImageMsg('');
    setTextKey('');
  };

  const handleDecodeImage = async () => {
    if (!originalImageUri) {
      console.warn('Please select an image');
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = originalImageUri.replace('file://', '');
      // console.log('original image path:', originalImageUri);
      LSBSteganography.decode(imagePath, result => {
        setIsLoading(false);

        if (result.startsWith('Error:')) {
          setErrorMessage(result);
          setIsErrorModalVisible(true);
          return;
        }

        // Check if the result contains the salt and iv (based on expected length)
        const hasEncryption = result.length > 64; // salt (32) + iv (32) + minimum cipherText (32)
        if (useAesEncryption) {
          console.log('textKey', textKey);
          if (textKey && hasEncryption) {
            decryptMessage(result);
            console.log("decryptMessage result", result);
          } else {
            setErrorMessage('Failed to decode');
            setIsErrorModalVisible(true);
          }
        } else {
          if (!textKey) {
            setDecodedImageMsg(result);
            console.log("decryptMessage result !textkey", result);
            setIsSuccessModalVisible(true);
          }
        }
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      setIsErrorModalVisible(true);
    }
  };

  const decryptMessage = async result => {
    try {
      const salt = await result.substr(0, 32);
      console.log("salt", salt);
      const iv = await result.substr(32, 32);
      console.log("iv", iv);
      const cipherText = await result.substr(64); // rest of the ciphertext
      console.log("cipherText", cipherText);

      // derive the decryption key
      const derivedKey = await Aes.pbkdf2(textKey, salt, 5000, 256);
      console.log("derivedKey", derivedKey);

      // decrypt the message
      const decryptedMessage = await Aes.decrypt(
        cipherText,
        derivedKey,
        iv,
        'aes-256-cbc',
      );
      console.log("decryptedMessage", decryptedMessage);
      setDecodedImageMsg(decryptedMessage);
      setIsSuccessModalVisible(true);
    } catch (error) {
      console.log('error:', error.message);
      setErrorMessage(
        'Decryption failed. The password doesnt match the encrypted image.',
      );
      setIsErrorModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {originalImageUri && (
          <>
            <Card mode="contained">
              <Card.Cover
                source={{uri: originalImageUri}}
                style={styles.image}
              />
            </Card>
          </>
        )}

        {!originalImageUri && (
          <TouchableOpacity onPress={handleOpenGallery} style={styles.button}>
            <Text style={styles.buttonText}>Select from Gallery</Text>
          </TouchableOpacity>
        )}

        {!decodedImageMsg && originalImageUri && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={onChangeTextKey}
              value={textKey}
              placeholder="Password (Optional)"
            />
          </>
        )}

        <View style={styles.footerButtonContainer}>
          {!decodedImageMsg && originalImageUri && (
            <>
              <TouchableOpacity
                onPress={handleDecodeImage}
                style={styles.button}>
                <Text style={styles.buttonText}>Decode</Text>
              </TouchableOpacity>
            </>
          )}

          {!decodedImageMsg && originalImageUri && (
            <>
              <TouchableOpacity
                onPress={handleClearImage}
                style={styles.button}>
                <Text style={styles.buttonText}>Clear Image</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {originalImageUri && decodedImageMsg && (
          <>
            <Text style={styles.textStyle}>Messages</Text>
            <TextInput
              style={styles.inputMessage}
              multiline={true}
              numberOfLines={4}>
              {decodedImageMsg}
            </TextInput>
          </>
        )}

        {decodedImageMsg && (
          <>
            <TouchableOpacity onPress={handleClearImage} style={styles.button}>
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}

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
              <Text style={styles.modalText}>Decode is success!</Text>
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

export default DecodeScreen;
