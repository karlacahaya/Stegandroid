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
        // width: 300,
        // height: 400,
        cropping: false,
      });

      setOriginalImageUri(image.path);
    } catch (error) {
      console.error(error);
    }
  };

  // const onChangeTextKey = newTextKey => {
  //   setTextKey(newTextKey);
  //   // Check if the input is empty or just whitespace
  //   if (!newTextKey.trim()) {
  //     setUseAesEncryption(false);
  //   } else {
  //     setUseAesEncryption(true);
  //   }
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

      LSBSteganography.decode(imagePath, textKey, useAesEncryption, result => {
        setIsLoading(false);

        if (result.startsWith('Error:')) {
          setErrorMessage(result);
          setIsErrorModalVisible(true);
        } else {
          console.log('Decoded image msg:', result);
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {originalImageUri && (
          <>
            <Text style={styles.textStyle}>Original Image</Text>
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
