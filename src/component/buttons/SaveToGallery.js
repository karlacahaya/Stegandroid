import React from 'react';
import {
  Platform,
  PermissionsAndroid,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import CameraRoll from '@react-native-camera-roll/camera-roll';
import styles from '../../helper/style';

function SaveToGalleryButton({tag, type = 'photo', album}) {
  async function hasAndroidPermission() {
    const getCheckPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return Promise.all([
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          ),
          PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          ),
        ]).then(
          ([hasReadMediaImagesPermission, hasReadMediaVideoPermission]) =>
            hasReadMediaImagesPermission && hasReadMediaVideoPermission,
        );
      } else {
        return PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
      }
    };

    const hasPermission = await getCheckPermissionPromise();
    if (hasPermission) {
      return true;
    }

    const getRequestPermissionPromise = () => {
      if (Platform.Version >= 33) {
        return PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ]).then(
          statuses =>
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            statuses[PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO] ===
              PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        return PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ).then(status => status === PermissionsAndroid.RESULTS.GRANTED);
      }
    };

    return await getRequestPermissionPromise();
  }

  async function savePictureToGallery() {
    if (Platform.OS === 'android' && !(await hasAndroidPermission())) {
      return;
    }

    try {
      await CameraRoll.save(tag, {type, album});
      alert('Image successfully saved to gallery!');
    } catch (error) {
      alert('Failed to save the image to the gallery.');
      console.error('Save to gallery error:', error);
    }
  }

  return (
    <TouchableOpacity onPress={savePictureToGallery} style={styles.button}>
      <Text style={styles.buttonText}>Save Encoded Image</Text>
    </TouchableOpacity>
  );
}

export default SaveToGalleryButton;
