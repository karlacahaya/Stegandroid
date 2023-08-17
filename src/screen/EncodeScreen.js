import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid} from 'react-native';

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
});

const EncodeScreen = () => {
  const [isExist, setIsExist] = useState(false);
  const [imageCamera, setImageCamera] = useState(null);
  const [imageGallery, setImageGallery] = useState(null);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'App Camera Permission',
          message: 'App needs access to your camera ',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        handleOpenCamera();
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
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
        setImageCamera(data);
        setIsExist(true);
        console.log(data);
      }
    });
  };

  const handleOpenGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, res => {
      if (res.didCancel) {
        console.log('Cancelled');
      } else if (res.errorCode) {
        console.log(res.errorMessage);
      } else {
        const data = res.assets[0];
        setImageGallery(data);
        setIsExist(true);
        console.log(data);
      }
    });
  };

  const handleClearImage = () => {
    setImageCamera(null);
    setImageGallery(null);
    setIsExist(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
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

        {isExist && (
          <>
            <TouchableOpacity onPress={handleClearImage} style={styles.button}>
              <Text style={styles.buttonText}>Clear Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Use this picture</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default EncodeScreen;
