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
import ImagePicker from 'react-native-image-crop-picker';
import Aes from 'react-native-aes-crypto';

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
    marginTop: 5,
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button1: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'grey',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 20,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

const {LSBSteganography} = NativeModules;

const DecodeScreen = () => {
  // const [text, setText] = React.useState('');
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

  // const decryptData = (encryptedData, key) =>
  //   Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

  // const test = () => {
  //   let cipher = 'XN0UcrK2dTEIzXklD7rZjA==';
  //   let iv = 'acc699415f58c3ae8eb3741a5b26e78c';
  //   let key =
  //     '75f28dc2fb8ba0315b89388de0489e4c244ca3adac19a0302b82dd3b1331e55a';

  //   decryptData({cipher, iv}, key)
  //     .then(text => {
  //       console.log('Decrypted:', text);
  //     })
  //     .catch(error => {
  //       console.log(error);
  //     });
  // };

  const handleDecodeImage = async () => {
    if (!originalImageUri) {
      console.warn('Please select an image');
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = originalImageUri.replace('file://', '');
      console.log('original image path:', originalImageUri);
      LSBSteganography.decode(imagePath, result => {
        setIsLoading(false);

        if (result.startsWith('Error:')) {
          setErrorMessage(result);
          setIsErrorModalVisible(true);
        } else {
          console.log('Decoded image msg:', result);

          // If the useAesEncryption flag is true and the user hasn't entered a password
          if (useAesEncryption && !textKey.trim()) {
            setErrorMessage('Password required for decryption.');
            setIsErrorModalVisible(true);
            return;
          }
          decryptMessage(result);
          setDecodedImageMsg(result);
          setIsSuccessModalVisible(true);
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
      if (useAesEncryption) {
        // If AES encryption is to be used
        const salt = result.substr(0, 32);
        const iv = result.substr(32, 32);
        const cipherText = result.substr(64);

        console.log('salt', salt);
        console.log('iv', iv);
        console.log('cipherText', cipherText);

        // Derive the decryption key
        const derivedKey = await Aes.pbkdf2(textKey, salt, 5000, 256);

        // Decrypt the message
        const decryptedMessage = await Aes.decrypt(
          cipherText,
          derivedKey,
          iv,
          'aes-256-cbc',
        );
        setDecodedImageMsg(decryptedMessage);
      } else {
        setDecodedImageMsg(result);
      }
    } catch (error) {
      console.log('error:', error.message);
    }
  };

  //   const handleDecodeImage = async () => {
  //     if (!originalImageUri) {
  //       console.warn('Please select an image');
  //       return;
  //     }

  //     setIsLoading(true);

  //     try {
  //       const imagePath = originalImageUri.replace('file://', '');

  //       console.log('textKey', textKey);
  //       console.log('useAesEncryption', useAesEncryption);
  //       LSBSteganography.decode(
  //         imagePath,
  //         textKey,
  //         useAesEncryption,
  //         async (result) => {
  //           setIsLoading(false);

  //           if (result.startsWith('Error:')) {
  //             console.log(result);
  //             setErrorMessage(result);
  //             setIsErrorModalVisible(true);
  //           } else {
  //             console.log('Decrypted message:', result);

  //             // Here you can handle the result, for instance, display it on the UI or save it etc.
  //             setDecodedImageMsg(result); // Assuming you have a state for it
  //           }
  //         }
  //       );
  //     } catch (error) {
  //       console.error("An error occurred:", error);
  //       setIsLoading(false);
  //       setErrorMessage("An unexpected error occurred. Please try again.");
  //       setIsErrorModalVisible(true);
  //     }
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {originalImageUri && (
          <>
            <View style={styles.imageContainer}>
              <Image source={{uri: originalImageUri}} style={styles.image} />
            </View>
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

        {!decodedImageMsg && originalImageUri && (
          <>
            <TouchableOpacity onPress={handleDecodeImage} style={styles.button}>
              <Text style={styles.buttonText}>Decode</Text>
            </TouchableOpacity>
          </>
        )}

        {originalImageUri && decodedImageMsg && (
          <>
            <Text>Messages</Text>
            <Text style={styles.input}>{decodedImageMsg}</Text>
          </>
        )}

        {/* <TouchableOpacity onPress={test} style={styles.button}>
          <Text style={styles.buttonText}>test</Text>
        </TouchableOpacity> */}

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
