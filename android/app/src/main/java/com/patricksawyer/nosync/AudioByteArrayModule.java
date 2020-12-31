package com.patricksawyer.nosync;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.util.Map;
import java.util.HashMap;
import android.util.Log;
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
    public void isEqual(
        int a,
        int b,
        Callback booleanCallback) {
        boolean equal = a == b;
        booleanCallback.invoke(equal);
    }

}
