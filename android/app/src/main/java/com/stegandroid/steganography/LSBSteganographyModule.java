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
import javax.crypto.spec.IvParameterSpec;
import android.util.Base64;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;

import java.security.MessageDigest;
import java.util.Arrays;

public class LSBSteganographyModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;
    private byte[] keyBytes;

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
    public void encode(String imageUri, String message, Callback callback) {
        try {
            Bitmap encodedImage;

            encodedImage = encodeImage(imageUri, message); // Assuming you have this method

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

    private Bitmap encodeImage(String imageUri, String message)
            throws IOException, IllegalArgumentException {

        // Log the image type before attempting to decode
        BitmapFactory.Options options = new BitmapFactory.Options();
        options.inJustDecodeBounds = true; // Avoid memory allocation here
        BitmapFactory.decodeFile(imageUri, options);
        Log.d("test", "Image URI: " + imageUri);
        Log.d("test", "Image type: " + options.outMimeType);

        Bitmap image = BitmapFactory.decodeFile(imageUri);

        // Check if the image can contain the message
        int imageSize = image.getWidth() * image.getHeight();
        Log.d("test", "imageSize: " + imageSize);
        if (message.length() > imageSize) {
            throw new IllegalArgumentException("Message too long for this image");
        }

        // Convert message length to binary string (with length prefix)
        String binaryLength = String.format("%16s", Integer.toBinaryString(message.length())).replace(' ', '0');

        StringBuilder binaryMessage = new StringBuilder(binaryLength);
        for (char c : message.toCharArray()) {
            String binString = String.format("%8s", Integer.toBinaryString(c)).replace(' ', '0'); // 8 bits for a char
            binaryMessage.append(binString);
        }

        Log.d("test", "message Encode:" + message);
        Log.d("test", "binaryMessage Encode:" + binaryMessage);
        
        // Embed the binary message into the image's pixels
        int messageIndex = 0;
        Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
        outerloop: for (int y = 0; y < image.getHeight(); y++) {
            for (int x = 0; x < image.getWidth(); x++) {
                if (messageIndex >= binaryMessage.length()) {
                    break outerloop;
                }

                int pixel = mutableBitmap.getPixel(x, y);
                char bit = binaryMessage.charAt(messageIndex);

                Log.d("test", "bit:" + bit);
                Log.d("test", "pixel:" + pixel);

               // Log original pixel in binary format
                String binaryPixelOriginal = String.format("%32s", Integer.toBinaryString(pixel)).replace(' ', '0');
                Log.d("test", "binaryPixelOriginal:" + binaryPixelOriginal);

                if (bit == '1') {
                    pixel |= 1;
                } else {
                    pixel &= ~1;
                }

                // Log modified pixel in binary format
                String binaryPixelModified = String.format("%32s", Integer.toBinaryString(pixel)).replace(' ', '0');
                Log.d("test", "binaryPixelModified:" + binaryPixelModified);

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

        // Use this newFileName when setting the outputPath:
        String outputPath = reactContext.getExternalFilesDir(null) + File.separator + newFileName;
        java.io.OutputStream stream = new java.io.FileOutputStream(outputPath);
        
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
        Log.d("test", "savedImageUri:" + savedImageUri);
        if (savedImageUri == null) {
            throw new IOException("Failed to create new MediaStore record.");
        }

        try (OutputStream mediaStoreStream = resolver.openOutputStream(savedImageUri)) {
            if (mediaStoreStream == null) {
                throw new IOException("Failed to open output stream.");
            }
            encodedImage.compress(Bitmap.CompressFormat.PNG, 100, mediaStoreStream);
        }

        return savedImageUri.toString();
    }

    private void refreshGallery(String imagePath) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        Uri contentUri = Uri.fromFile(new File(imagePath));
        mediaScanIntent.setData(contentUri);
        getReactApplicationContext().sendBroadcast(mediaScanIntent);
    }

    @ReactMethod
    public void decode(String imageUri, Callback callback) {
        try {
            String decodedMessage = decodeMessageFromImage(imageUri);
            callback.invoke(decodedMessage);
        } catch (Exception e) {
            callback.invoke("Error: " + e.getMessage());
        }
    }

    private String decodeMessageFromImage(String imageUri) throws Exception {
        Bitmap image = BitmapFactory.decodeFile(imageUri);
        StringBuilder binaryMessage = new StringBuilder();

        // Extract the length of the message
        StringBuilder binaryLength = new StringBuilder();
        for (int i = 0; i < 16; i++) {
            int pixel = image.getPixel(i % image.getWidth(), i / image.getWidth());
            binaryLength.append(pixel & 1);
        }
        Log.d("Decode", "binaryLength:" + binaryLength);
        int messageLength = Integer.parseInt(binaryLength.toString(), 2);
        Log.d("Decode", "messageLength:" + messageLength);

        //  Extract the actual message
        for (int i = 16; i < 16 + (messageLength * 8); i++) {
            int pixel = image.getPixel(i % image.getWidth(), i / image.getWidth());
            binaryMessage.append(pixel & 1);
        }

        Log.d("Decode", "binaryMessage Decode:" + binaryMessage);

        // Convert the binary message back to text
        StringBuilder textMessage = new StringBuilder();
        for (int i = 0; i < binaryMessage.length(); i += 8) { // Use 8 since each char is represented by 8 bits
            String byteString = binaryMessage.substring(i, i + 8); // Extract each 8-bit sequence
            Log.d("Decode", "byteString:" + byteString);
            int charCode = Integer.parseInt(byteString, 2);
            Log.d("Decode", "charCode:" + charCode);
            textMessage.append((char) charCode);
        }

        Log.d("Decode", "textMessage Decode:" + textMessage);

        return textMessage.toString();
    }
}
