import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import styles from '../../helper/style';

const ShareButton = ({ encodedImageUri }) => {

  const shareImage = async () => {
    try {
      const filename = 'image.png';
      const newFileLocation = `${RNFS.CachesDirectoryPath}/${filename}`;

      // Copy the file to cache directory
      await RNFS.copyFile(encodedImageUri, newFileLocation);

      const shareOptions = {
        url: `file://${newFileLocation}`, // Using file:// URI
        type: 'image/png',
        subject: 'Stegandroid - Finpro Defense',
        message: 'Check out this encoded image!',
        title: 'Share encoded image',
      };

      if (Platform.OS === 'android') {
        shareOptions['showAppsToView'] = true; // This will enhance user experience in Android by allowing them to select an app
      }

      const result = await Share.open(shareOptions);

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('shared with activity type of', result.activityType);
        } else {
          console.log('shared');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('dismissed');
      }

      // Optionally, remove the file from cache after sharing
      await RNFS.unlink(newFileLocation);

    } catch (error) {
      console.log('Error =>', error);
    }
  };

  return (
    <TouchableOpacity onPress={shareImage} style={styles.button}>
      <Text style={styles.buttonText}>Share</Text>
    </TouchableOpacity>
  );
};

export default ShareButton;
