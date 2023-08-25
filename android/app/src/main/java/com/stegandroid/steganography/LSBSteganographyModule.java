package com.stegandroid.steganography;

import java.io.File;
import java.io.IOException;
import java.io.OutputStream;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.util.Log;
import android.content.Intent;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.provider.MediaStore;
import android.net.Uri;

//imports module to include PBKDF
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.spec.KeySpec;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import java.security.SecureRandom;

import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class LSBSteganographyModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private byte[] keyBytes; // Declare keyBytes here

    public LSBSteganographyModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "LSBSteganography";
    }

    private byte[] generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return salt;
    }

    @ReactMethod
    public void encode(String imageUri, String message, String password, boolean usePbkdf, Callback callback) {
        try {
            Bitmap encodedImage;

            if (usePbkdf && !password.isEmpty()) {
                byte[] keyBytes = generateEncryptionKey(password);
                encodedImage = encodeImageWithMessage(imageUri, message, keyBytes);
            } else {
                encodedImage = encodeImageWithoutEncryption(imageUri, message); // Assuming you have this method
            }

            String savedImagePath = saveEncodedImage(encodedImage, imageUri);
            refreshGallery(savedImagePath);
            callback.invoke(savedImagePath);
        } catch (IllegalArgumentException e) {
            callback.invoke("Error: Invalid argument - " + e.getMessage());
        } catch (IOException e) {
            callback.invoke("Error: I/O issue - " + e.getMessage());
        } catch (Exception e) { // generic catch for other potential exceptions
            callback.invoke("Error: " + e.getMessage());
        }

    }

    private byte[] generateEncryptionKey(String password) throws Exception {
        byte[] salt = generateSalt();
        SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
        SecretKey secretKey = factory.generateSecret(spec);
        return secretKey.getEncoded();
    }

    private Bitmap encodeImageWithMessage(String imageUri, String message, byte[] keyBytes) throws Exception {
        // The image decoding logic
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(imageUri, options);
        Bitmap image = BitmapFactory.decodeFile(imageUri);

        // Message length check
        int imageSize = image.getWidth() * image.getHeight();
        if (message.length() > imageSize) {
            throw new Exception("Error: Message too long for this image");
        }

        // Encrypting the message using AES
        Cipher cipher = Cipher.getInstance("AES");
        SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
        cipher.init(Cipher.ENCRYPT_MODE, keySpec);
        byte[] encryptedMessage = cipher.doFinal(message.getBytes());

        // Embedding the encrypted message into the image's pixels
        StringBuilder binaryMessage = new StringBuilder();
        for (byte b : encryptedMessage) {
            binaryMessage.append(String.format("%8s", Integer.toBinaryString(b & 0xFF)).replace(' ', '0'));
        }

        Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
        embedMessageInBitmap(binaryMessage, mutableBitmap);

        return mutableBitmap;
    }

    private void embedMessageInBitmap(StringBuilder binaryMessage, Bitmap mutableBitmap) {
        int messageIndex = 0;
        outerloop: for (int y = 0; y < mutableBitmap.getHeight(); y++) {
            for (int x = 0; x < mutableBitmap.getWidth(); x++) {
                if (messageIndex >= binaryMessage.length()) {
                    break outerloop;
                }

                int pixel = mutableBitmap.getPixel(x, y);
                char bit = binaryMessage.charAt(messageIndex);

                if (bit == '1') {
                    pixel |= 1;
                } else {
                    pixel &= ~1;
                }

                mutableBitmap.setPixel(x, y, pixel);
                messageIndex++;
            }
        }
    }

    private Bitmap encodeImageWithoutEncryption(String imageUri, String message)
            throws IOException, IllegalArgumentException {
        // Log the image type before attempting to decode
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true; // Avoid memory allocation here
        BitmapFactory.decodeFile(imageUri, options);
        Log.d("LSBSteganography", "Image URI: " + imageUri);
        Log.d("LSBSteganography", "Image type: " + options.outMimeType);

        Bitmap image = BitmapFactory.decodeFile(imageUri);

        // 1. Check if the image can contain the message
        int imageSize = image.getWidth() * image.getHeight();
        if (message.length() > imageSize) {
            throw new IllegalArgumentException("Message too long for this image");
        }

        // Convert message length to binary string (with length prefix)
        String binaryLength = String.format("%16s", Integer.toBinaryString(message.length())).replace(' ', '0'); // 16
                                                                                                                 // bits
                                                                                                                 // length

        StringBuilder binaryMessage = new StringBuilder(binaryLength);
        for (char c : message.toCharArray()) {
            String binString = String.format("%8s", Integer.toBinaryString(c)).replace(' ', '0'); // 8 bits for a char
            binaryMessage.append(binString);
        }

        Log.d("Encode", "binaryMessage Encode:" + binaryMessage);
        Log.d("Encode", "message Encode:" + message);

        // 3. Embed the binary message into the image's pixels
        int messageIndex = 0;
        Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
        outerloop: for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if (messageIndex >= binaryMessage.length()) {
                    break outerloop;
                }

                int pixel = mutableBitmap.getPixel(x, y);
                char bit = binaryMessage.charAt(messageIndex);

                if (bit == '1') {
                    pixel |= 1;
                } else {
                    pixel &= ~1;
                }

                mutableBitmap.setPixel(x, y, pixel);
                messageIndex++;
            }
        }

        // Return the encoded image
        return mutableBitmap;
    }

    private String saveEncodedImage(Bitmap encodedImage, String originalImageUri) throws Exception {
        // Extract the original filename from the imageUri:
        String originalFileName = new File(originalImageUri).getName();

        // Before the file extension, append "_encoded" to the original filename:
        String baseName = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
        String extension = originalFileName.substring(originalFileName.lastIndexOf('.'));
        String newFileName = baseName + "_encoded" + extension;

        // Use this newFileName when you're setting the outputPath:
        String outputPath = reactContext.getExternalFilesDir(null) + File.separator + newFileName;
        java.io.OutputStream stream = new java.io.FileOutputStream(outputPath);
        // Log.d("y", "saveEncodedImage encodedImage:" + encodedImage);
        encodedImage.compress(Bitmap.CompressFormat.PNG, 100, stream);

        stream.flush();
        stream.close();

        ContentValues values = new ContentValues();
        values.put(MediaStore.Images.Media.DISPLAY_NAME, newFileName);
        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
        values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Stegandroid");

        ContentResolver resolver = reactContext.getContentResolver();
        Uri imageCollection = MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);

        Uri savedImageUri = resolver.insert(imageCollection, values);
        if (savedImageUri == null) {
            throw new IOException("Failed to create new MediaStore record.");
        }

        try (OutputStream mediaStoreStream = resolver.openOutputStream(savedImageUri)) {
            if (mediaStoreStream == null) {
                throw new IOException("Failed to open output stream.");
            }
            encodedImage.compress(Bitmap.CompressFormat.PNG, 100, mediaStoreStream);
        }

        Log.d("y", "----------------------ENCODE LOGS----------------------");

        return savedImageUri.toString();
    }

    private void refreshGallery(String imagePath) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        Uri contentUri = Uri.fromFile(new File(imagePath));
        mediaScanIntent.setData(contentUri);
        getReactApplicationContext().sendBroadcast(mediaScanIntent);
    }

    @ReactMethod
    public void decode(String imageUri, String password, boolean usePbkdf, Callback callback) {
        try {
            if (usePbkdf && !password.isEmpty()) {
                byte[] salt = generateSalt();
                SecretKeyFactory factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
                KeySpec spec = new PBEKeySpec(password.toCharArray(), salt, 65536, 256);
                SecretKey secretKey = factory.generateSecret(spec);
                keyBytes = secretKey.getEncoded(); // Store keyBytes at the class level
            }

            String decodedMessage = decodeMessageFromImage(imageUri, keyBytes);
            callback.invoke(decodedMessage);
        } catch (Exception e) {
            callback.invoke("Error: " + e.getMessage());
        }
    }

    private String decodeMessageFromImage(String imageUri, byte[] keyBytes) throws Exception {
        try {
            Bitmap image = BitmapFactory.decodeFile(imageUri);
            StringBuilder binaryMessage = new StringBuilder();

            // Extract the length of the message
            StringBuilder binaryLength = new StringBuilder();
            for (int i = 0; i < 16; i++) {
                int pixel = image.getPixel(i % image.getWidth(), i / image.getWidth());
                binaryLength.append(pixel & 1);
            }
            int messageLength = Integer.parseInt(binaryLength.toString(), 2);

            // Extract the actual message
            // You've already extracted the 16 bits for the message length, so start from
            // index 16
            // and remember, for each character of the message, you're extracting 8 bits
            for (int i = 16; i < 16 + (messageLength * 8); i++) {
                int pixel = image.getPixel(i % image.getWidth(), i / image.getWidth());
                binaryMessage.append(pixel & 1);
            }

            Log.d("Decode", "binaryMessage:" + binaryMessage);

            // Convert the binary message back to text
            StringBuilder textMessage = new StringBuilder();
            for (int i = 0; i < binaryMessage.length(); i += 8) { // Use 8 since each char is represented by 8 bits
                String byteString = binaryMessage.substring(i, i + 8); // Extract each 8-bit sequence
                int charCode = Integer.parseInt(byteString, 2);
                textMessage.append((char) charCode);
            }

            if (keyBytes != null) {
                // Decrypt the text message using the provided keyBytes
                Cipher cipher = Cipher.getInstance("AES");
                SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");
                cipher.init(Cipher.DECRYPT_MODE, keySpec);

                byte[] encryptedBytes = new byte[textMessage.length()];
                for (int i = 0; i < textMessage.length(); i++) {
                    encryptedBytes[i] = (byte) textMessage.charAt(i);
                }

                byte[] decryptedBytes = cipher.doFinal(encryptedBytes);
                textMessage = new StringBuilder(new String(decryptedBytes));
            }

            Log.d("Decode", "textMessage:" + textMessage);

            return textMessage.toString();

        } catch (Exception e) {
            throw new Exception("Error during decoding: " + e.getMessage());
        }

    }

    // AES
    // Convert binary message to encrypted bytes
    // byte[] encryptedBytes = new byte[binaryMessage.length() / 8];
    // for (int i = 0; i < binaryMessage.length(); i += 8) {
    // String byteString = binaryMessage.substring(i, i + 8);
    // encryptedBytes[i / 8] = (byte) Integer.parseInt(byteString, 2);
    // }

    // // Decrypt the message using AES
    // Cipher cipher = Cipher.getInstance("AES");
    // Key key = new SecretKeySpec(encryptionKey.getBytes(), "AES");
    // cipher.init(Cipher.DECRYPT_MODE, key);
    // byte[] decryptedBytes = cipher.doFinal(encryptedBytes);

    // Log.d("Decode", "decryptedBytes:" + decryptedBytes);

    // return new String(decryptedBytes);

    // @ReactMethod
    // public void encode(String imageUri, String message, Callback callback) {
    // try {
    // // Log the image type before attempting to decode
    // BitmapFactory.Options options = new BitmapFactory.Options();
    // options.inJustDecodeBounds = true; // Avoid memory allocation here
    // BitmapFactory.decodeFile(imageUri, options);
    // Log.d("LSBSteganography", "Image URI: " + imageUri);
    // Log.d("LSBSteganography", "Image type: " + options.outMimeType);

    // Bitmap image = BitmapFactory.decodeFile(imageUri);

    // // 1. Check if the image can contain the message
    // int imageSize = image.getWidth() * image.getHeight();
    // if (message.length() > imageSize) {
    // callback.invoke("Error: Message too long for this image");
    // return;
    // }

    // // 2. Convert message to binary string (with length prefix)
    // String binaryLength = String.format("%16s",
    // Integer.toBinaryString(message.length())).replace(' ', '0'); // 16
    // // bits
    // // for
    // // length
    // StringBuilder binaryMessage = new StringBuilder(binaryLength);
    // for (char c : message.toCharArray()) {
    // binaryMessage.append(Integer.toBinaryString(c));
    // }

    // // 3. Embed the binary message into the image's pixels
    // int messageIndex = 0;
    // Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
    // outerloop: for (int y = 0; y < image.getHeight(); y++) {
    // for (int x = 0; x < image.getWidth(); x++) {
    // if (messageIndex >= binaryMessage.length()) {
    // break outerloop;
    // }

    // int pixel = mutableBitmap.getPixel(x, y);
    // char bit = binaryMessage.charAt(messageIndex);

    // if (bit == '1') {
    // pixel |= 1;
    // } else {
    // pixel &= ~1;
    // }

    // mutableBitmap.setPixel(x, y, pixel);
    // messageIndex++;
    // }
    // }

    // // 4. Save the new image

    // // Extract the original filename from the imageUri:
    // String originalFileName = new File(imageUri).getName();

    // // Before the file extension, append "_encoded" to the original filename:
    // String baseName = originalFileName.substring(0,
    // originalFileName.lastIndexOf('.'));
    // String extension =
    // originalFileName.substring(originalFileName.lastIndexOf('.'));
    // String newFileName = baseName + "_encoded" + extension;

    // // Use this newFileName when you're setting the outputPath:
    // String outputPath = reactContext.getExternalFilesDir(null) + File.separator +
    // newFileName;
    // java.io.OutputStream stream = new java.io.FileOutputStream(outputPath);
    // mutableBitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);

    // stream.flush();
    // stream.close();
    // callback.invoke(outputPath);

    // ContentValues values = new ContentValues();
    // values.put(MediaStore.Images.Media.DISPLAY_NAME, newFileName);
    // values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
    // values.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/Stegandroid");

    // ContentResolver resolver = reactContext.getContentResolver();
    // Uri imageCollection =
    // MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);

    // Uri savedImageUri = resolver.insert(imageCollection, values);
    // if (savedImageUri == null) {
    // throw new IOException("Failed to create new MediaStore record.");
    // }

    // try (OutputStream mediaStoreStream =
    // resolver.openOutputStream(savedImageUri)) {
    // if (mediaStoreStream == null) {
    // throw new IOException("Failed to open output stream.");
    // }
    // mutableBitmap.compress(Bitmap.CompressFormat.PNG, 100, mediaStoreStream);
    // }

    // callback.invoke(savedImageUri.toString());

    // } catch (Exception e) {
    // callback.invoke("Error: " + e.getMessage());
    // }
    // }
}

// aes

// private Bitmap encodeImageWithMessageAndAes(String imageUri, String message,
// String encryptionKey) throws Exception {
// try {
// // Log the image type before attempting to decode
// BitmapFactory.Options options = new BitmapFactory.Options();
// options.inJustDecodeBounds = true; // Avoid memory allocation here
// BitmapFactory.decodeFile(imageUri, options);
// Log.d("LSBSteganography", "Image URI: " + imageUri);
// Log.d("LSBSteganography", "Image type: " + options.outMimeType);

// Bitmap image = BitmapFactory.decodeFile(imageUri);

// // Check if the image can contain the message
// int imageSize = image.getWidth() * image.getHeight();
// if (message.length() > imageSize) {
// throw new Exception("Error: Message too long for this image");
// }

// // Convert message length to binary string (with length prefix)
// String binaryLength = String.format("%16s",
// Integer.toBinaryString(message.length())).replace(' ', '0'); // 16bitslength
// // Log.d("y", "binaryLength encode:" + binaryLength);

// StringBuilder binaryMessage = new StringBuilder(binaryLength);
// for (char c : message.toCharArray()) {
// String binString = String.format("%8s", Integer.toBinaryString(c)).replace('
// ', '0'); // 8 bits for a
// // char
// binaryMessage.append(binString);
// }

// Log.d("Encode", "binaryMessage:" + binaryMessage);
// Log.d("Encode", "message:" + message);

// // Encrypt the binary message using AES
// Cipher cipher = Cipher.getInstance("AES");
// Key key = new SecretKeySpec(encryptionKey.getBytes(), "AES");
// cipher.init(Cipher.ENCRYPT_MODE, key);
// byte[] encryptedBytes = cipher.doFinal(binaryMessage.toString().getBytes());

// // Convert encrypted bytes to a binary string
// StringBuilder encryptedBinaryMessage = new StringBuilder();
// for (byte b : encryptedBytes) {
// encryptedBinaryMessage.append(String.format("%8s", Integer.toBinaryString(b &
// 0xFF)).replace(' ', '0'));
// }

// Log.d("Encode", "encryptedBinaryMessage:" + encryptedBinaryMessage);

// // Embed the binary message into the image's pixels
// int messageIndex = 0;
// Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
// outerloop: for (int y = 0; y < image.getHeight(); y++) {
// for (int x = 0; x < image.getWidth(); x++) {
// if (messageIndex >= encryptedBinaryMessage.length()) {
// break outerloop;
// }

// int pixel = mutableBitmap.getPixel(x, y);
// char bit = encryptedBinaryMessage.charAt(messageIndex);

// if (bit == '1') {
// pixel |= 1;
// } else {
// pixel &= ~1;
// }

// mutableBitmap.setPixel(x, y, pixel);
// messageIndex++;
// }
// }

// // Returning the encoded image
// return mutableBitmap;

// } catch (Exception e) {
// throw new Exception("Error during encoding: " + e.getMessage());
// }

// }
