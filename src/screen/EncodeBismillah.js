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
import ImagePicker from 'react-native-image-crop-picker';
import GalleryPermissionButton from '../component/buttons/GalleryPermissions';
import CameraPermissionButton from '../component/buttons/CameraPermissions';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import SaveToGalleryButton from '../component/buttons/SaveToGallery';

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
  const [text, setText] = React.useState('');
  const [originalImageUri, setOriginalImageUri] = useState(null);
  const [encodedImageUri, setEncodedImageUri] = useState(null);
  const [encodedImagePath, setEncodedImagePath] = useState(null)
  const [isLoading, setIsLoading] = useState(false);
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

  const onChangeText = newText => {
    setText(newText);
    console.log('Message:', newText);
  };

  const handleEncodeImage = async () => {
    if (!originalImageUri || !text) {
      console.warn('Please select an image and enter a message');
      return;
    }

    setIsLoading(true);

    try {
      const imagePath = originalImageUri.replace('file://', '');
      console.log('original image path:', originalImageUri);
      LSBSteganography.encode(imagePath, text, result => {
        setIsLoading(false);

        if (result.startsWith('Error:')) {
          setErrorMessage(result);
          setIsErrorModalVisible(true);
        } else {
          console.log('Encoded image path:', result);
          setEncodedImageUri('file://' + result);
        }
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage(error.message);
      setIsErrorModalVisible(true);
    }
  };

  console.log('ha', encodedImageUri)

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

        <SaveToGalleryButton tag={encodedImageUri} />

        {isLoading && <ActivityIndicator size="large" color="#0000ff" />}

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
                style={{...styles.button1, backgroundColor: '#2196F3'}}
                onPress={() => setIsErrorModalVisible(false)}>
                <Text style={styles.textStyle}>Hide Modal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EncodeBismillah;
