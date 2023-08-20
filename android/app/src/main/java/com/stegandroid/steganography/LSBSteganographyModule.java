package com.stegandroid.steganography;

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

public class LSBSteganographyModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public LSBSteganographyModule(@Nullable ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "LSBSteganography";
    }

    @ReactMethod
    public void encode(String imageUri, String message, Callback callback) {
        try {
            // Log the image type before attempting to decode
            BitmapFactory.Options options = new BitmapFactory.Options();
            options.inJustDecodeBounds = true;  // Avoid memory allocation here
            BitmapFactory.decodeFile(imageUri, options);
            Log.d("LSBSteganography", "Image URI: " + imageUri);
            Log.d("LSBSteganography", "Image type: " + options.outMimeType);

            Bitmap image = BitmapFactory.decodeFile(imageUri);

            // 1. Check if the image can contain the message
            int imageSize = image.getWidth() * image.getHeight();
            if (message.length() > imageSize) {
                callback.invoke("Error: Message too long for this image");
                return;
            }

            // 2. Convert message to binary string (with length prefix)
            String binaryLength = String.format("%16s", Integer.toBinaryString(message.length())).replace(' ', '0'); // 16 bits for length
            StringBuilder binaryMessage = new StringBuilder(binaryLength);
            for (char c : message.toCharArray()) {
                binaryMessage.append(Integer.toBinaryString(c));
            }

            // 3. Embed the binary message into the image's pixels
            int messageIndex = 0;
            Bitmap mutableBitmap = image.copy(Bitmap.Config.ARGB_8888, true);
            outerloop:
            for (int y = 0; y < image.getHeight(); y++) {
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

            // 4. Save the new image
            // String outputPath = Environment.getExternalStorageDirectory() + "/encoded_image.png";
            String outputPath = reactContext.getExternalFilesDir(null) + "/encoded_image.png";
            java.io.OutputStream stream = new java.io.FileOutputStream(outputPath);
            mutableBitmap.compress(Bitmap.CompressFormat.PNG, 100, stream);

            stream.flush();
            stream.close();
            callback.invoke(outputPath);

        } catch (Exception e) {
            callback.invoke("Error: " + e.getMessage());
        }
    }
}

