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
  Switch,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import GalleryPermissionButton from '../component/buttons/GalleryPermissions';
import CameraPermissionButton from '../component/buttons/CameraPermissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
// import {CameraRoll} from '@react-native-camera-roll/camera-roll';
// import SaveToGalleryButton from '../component/buttons/SaveToGallery';

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
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});

const {LSBSteganography} = NativeModules;

const EncodeBismillah = () => {
  const [message, setMessage] = React.useState('');
  // const [textKey, setTextKey] = React.useState('');
  // const [useAesEncryption, setUseAesEncryption] = useState(false); // State for the toggle switch
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

  const onChangeTextKey = newText => {
    setTextKey(newText);
    console.log('Key:', newText);
  };

  const onChangeMessage = newText => {
    setMessage(newText);
    console.log('Message:', newText);
  };

  const handleEncodeImage = async () => {
    if (!originalImageUri || !message) {
      console.warn('Please select an image and enter a message');
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = originalImageUri.replace('file://', '');
      console.log('original image path:', originalImageUri);

      LSBSteganography.encode(imagePath, message, result => {
        setIsLoading(false);

        if (result.startsWith('Error:')) {
          setErrorMessage(result);
          setIsErrorModalVisible(true);
        } else {
          console.log('Encoded image path:', result);
          setEncodedImageUri(result);
          setIsSuccessModalVisible(true);
        }
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      setIsErrorModalVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {originalImageUri && (
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

        {/* {!encodedImageUri && (
          <>
            <View style={styles.switchContainer}>
              <Text>Use AES Encryption:</Text>
              <Switch
                value={onChangeTextKey}
                onValueChange={newValue => setUseAesEncryption(newValue)}
              />
            </View>
          </>
        )} */}

        {!encodedImageUri && (
          <>
            <TextInput
              style={styles.input}
              onChangeText={onChangeMessage}
              value={message}
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
