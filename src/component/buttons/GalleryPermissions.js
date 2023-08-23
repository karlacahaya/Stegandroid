import React from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonText: {
    fontSize: 16,
  },
});

export const requestGalleryPermission = async callback => {
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
      callback();
    } else {
      console.log('Storage permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

const GalleryPermissionButton = ({onPress}) => (
  <TouchableOpacity
    onPress={() => requestGalleryPermission(onPress)}
    style={styles.button}>
    <Text style={styles.buttonText}>Select from Gallery</Text>
  </TouchableOpacity>
);

export default GalleryPermissionButton;
