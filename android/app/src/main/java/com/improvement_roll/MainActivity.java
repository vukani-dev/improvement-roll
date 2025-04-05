package com.improvement_roll;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.improvement_roll.widget.RandomRollWorker;

public class MainActivity extends ReactActivity {
  private static final String TAG = "MainActivity";
  private ReactActivityDelegate mDelegate;
  
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "improvement_roll";
  }
  
  /**
   * Creates the React Activity Delegate
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    mDelegate = new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
        ReactRootView reactRootView = new ReactRootView(getContext());
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        reactRootView.setIsFabric(false);
        return reactRootView;
      }
    };
    return mDelegate;
  }
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    handleIntent(getIntent());
  }
  
  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleIntent(intent);
  }
  
  private void handleIntent(Intent intent) {
    if (intent == null || intent.getAction() == null) {
      return;
    }
    
    if ("com.improvement_roll.ROLL_AGAIN".equals(intent.getAction())) {
      String categoryName = intent.getStringExtra("categoryName");
      if (categoryName != null && !categoryName.isEmpty()) {
        Log.d(TAG, "Roll Again requested for category: " + categoryName);
        
        // Send an event to JS to handle this roll request
        // We'll need to wait for the JS context to be ready
        if (mDelegate != null) {
          ReactContext reactContext = mDelegate.getReactInstanceManager().getCurrentReactContext();
          if (reactContext != null) {
            sendRollAgainEvent(reactContext, categoryName);
          } else {
            // Context not ready, let's try again when the ReactActivity is resumed
            Log.d(TAG, "ReactContext not ready. Will try to send event when resumed.");
          }
        }
      }
    }
  }
  
  @Override
  protected void onResume() {
    super.onResume();
    
    // Check if we need to send pending events
    Intent intent = getIntent();
    if (intent != null && "com.improvement_roll.ROLL_AGAIN".equals(intent.getAction())) {
      String categoryName = intent.getStringExtra("categoryName");
      if (categoryName != null && !categoryName.isEmpty()) {
        if (mDelegate != null) {
          ReactContext reactContext = mDelegate.getReactInstanceManager().getCurrentReactContext();
          if (reactContext != null) {
            sendRollAgainEvent(reactContext, categoryName);
            setIntent(new Intent()); // Clear the intent to avoid repeating
          }
        }
      }
    }
  }
  
  private void sendRollAgainEvent(ReactContext reactContext, String categoryName) {
    WritableMap params = Arguments.createMap();
    params.putString("categoryName", categoryName);
    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit("onRollAgainRequested", params);
    Log.d(TAG, "Sent roll again event to JS for category: " + categoryName);
  }
}
