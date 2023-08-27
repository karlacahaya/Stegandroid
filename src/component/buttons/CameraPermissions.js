import React from 'react';
import {
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import styles from '../../helper/style';

export const requestCameraPermissions = async callback => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'This app requires access to your camera.',
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

const CameraPermissionButton = ({onPress}) => (
  <TouchableOpacity
    onPress={() => requestCameraPermissions(onPress)}
    style={styles.button}>
    <Text style={styles.buttonText}>Take a picture</Text>
  </TouchableOpacity>
);
export default CameraPermissionButton;
