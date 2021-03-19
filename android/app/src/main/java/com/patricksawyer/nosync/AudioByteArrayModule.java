package com.patricksawyer.nosync;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import java.io.IOException;
import java.io.StringWriter;
import java.io.PrintWriter;

import android.util.Log;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import com.facebook.react.bridge.Callback;

public class AudioByteArrayModule extends ReactContextBaseJavaModule {
    AudioByteArrayModule(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "AudioByteArrayModule";
    }

    @ReactMethod
    public void getAudioBuffer(
        String filePath,
        Callback booleanCallback) {
            File file = new File(filePath);
            try {
	            AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(file);
                // int frameLength = (int) audioInputStream.getFrameLength();
                // int frameSize = (int) audioInputStream.getFormat().getFrameSize();
                // byte[] bytes = new byte[frameLength * frameSize];
                // int result = 0;
                // try {
                //     result = audioInputStream.read(bytes);
                // } catch (Exception e) {
                //     e.printStackTrace();
                // }
                // int numChannels = audioInputStream.getFormat().getChannels();
                // int[][] toReturn = new int[numChannels][frameLength];
                
                booleanCallback.invoke(filePath);

            }
            catch (UnsupportedAudioFileException | IOException ex) {
                StringWriter sw = new StringWriter();
                PrintWriter pw = new PrintWriter(sw);
                ex.printStackTrace(pw);
                booleanCallback.invoke(sw.toString());
            }


            
            
           
    }

}
