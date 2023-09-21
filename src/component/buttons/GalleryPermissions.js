import React from 'react';
import {
  PermissionsAndroid,
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../../helper/style';

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
