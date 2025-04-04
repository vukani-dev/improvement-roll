package com.improvement_roll;

// React Native imports
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.storage.AsyncLocalStorageUtil;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;

// Android imports
import android.content.Context;
import android.content.Intent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.util.Log; // Import Log
import androidx.work.Constraints;
import androidx.work.NetworkType;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import android.content.SharedPreferences;

// Project specific imports
import com.improvement_roll.widget.ImprovementRollWidget;
import com.improvement_roll.widget.RandomRollWorker;

// JSON and other imports
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Random;
import java.util.concurrent.TimeUnit;

// Renamed from ImprovementRollWidgetModule
public class AppFeaturesModule extends ReactContextBaseJavaModule {
    private static final String TAG = "AppFeaturesModule";
    private static final String RANDOM_ROLL_WORK_TAG = "randomRollWork";
    private final ReactApplicationContext reactContext;

    public AppFeaturesModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        // Changed module name
        return "AppFeatures";
    }

    // --- Widget Methods (Restored and Verified) --- 
    @ReactMethod
    public void updateWidgets() {
        Context context = getReactApplicationContext();
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        ComponentName thisWidget = new ComponentName(context, ImprovementRollWidget.class);
        int[] appWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget);
        
        Intent intent = new Intent(context, ImprovementRollWidget.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds);
        context.sendBroadcast(intent);
        
        Log.d(TAG, "Widget update broadcast sent");
    }
    
    @ReactMethod
    public void getCategories(Promise promise) {
        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);

            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                WritableArray resultArray = Arguments.createArray();
                
                for (int i = 0; i < categories.length(); i++) {
                    JSONObject category = categories.getJSONObject(i);
                    WritableMap resultMap = Arguments.createMap();
                    resultMap.putString("name", category.getString("name"));
                    resultMap.putString("description", category.optString("description", ""));
                    resultArray.pushMap(resultMap);
                }
                
                promise.resolve(resultArray);
            } else {
                promise.resolve(Arguments.createArray());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error getting categories", e);
            promise.reject("ERR_WIDGET", "Failed to get categories: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void rollFromCategory(String categoryName, Promise promise) {
         try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);
            
            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                
                JSONObject targetCategory = null;
                for (int i = 0; i < categories.length(); i++) {
                    JSONObject category = categories.getJSONObject(i);
                    if (category.getString("name").equals(categoryName)) {
                        targetCategory = category;
                        break;
                    }
                }
                
                if (targetCategory != null && targetCategory.has("tasks")) {
                    JSONArray tasks = targetCategory.getJSONArray("tasks");
                    if (tasks.length() > 0) {
                        int randomIndex = new Random().nextInt(tasks.length());
                        JSONObject task = tasks.getJSONObject(randomIndex);
                        
                        WritableMap resultMap = Arguments.createMap();
                        resultMap.putString("name", task.getString("name"));
                        resultMap.putString("desc", task.optString("desc", ""));
                        resultMap.putInt("minutes", task.optInt("minutes", 0));
                        resultMap.putString("categoryName", categoryName);
                        
                        promise.resolve(resultMap);
                        return;
                    }
                }
            }
            
            promise.resolve(null); // Resolve with null if category/task not found or error
        } catch (Exception e) {
            Log.e(TAG, "Error rolling task", e);
            promise.reject("ERR_WIDGET", "Failed to roll task: " + e.getMessage());
        }
    }
    
    @ReactMethod
    public void rollFromAnyCategory(Promise promise) {
        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);
            
            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                
                if (categories.length() > 0) {
                    JSONObject category = categories.getJSONObject(0);
                    String categoryName = category.getString("name");
                    
                    if (category.has("tasks")) {
                        JSONArray tasks = category.getJSONArray("tasks");
                        if (tasks.length() > 0) {
                            int randomIndex = new Random().nextInt(tasks.length());
                            JSONObject task = tasks.getJSONObject(randomIndex);
                            
                            WritableMap resultMap = Arguments.createMap();
                            resultMap.putString("name", task.getString("name"));
                            resultMap.putString("desc", task.optString("desc", ""));
                            resultMap.putInt("minutes", task.optInt("minutes", 0));
                            resultMap.putString("categoryName", categoryName);
                            
                            promise.resolve(resultMap);
                            return;
                        }
                    }
                }
            }
            
            promise.resolve(null); // Resolve with null if no categories/tasks found or error
        } catch (Exception e) {
            Log.e(TAG, "Error rolling any task", e);
            promise.reject("ERR_WIDGET", "Failed to roll any task: " + e.getMessage());
        }
    }

    // --- New Background Task Methods --- 

    @ReactMethod
    public void scheduleRandomNotifications(
            String categoryName,
            double frequencyHours,
            double probability,
            int activeHoursStart,
            int activeHoursEnd,
            Promise promise) {
        try {
            Log.d(TAG, String.format(
                "Scheduling random roll notifications for category '%s'. " +
                "Frequency: %.2f hours, Probability: %.0f%%, Active hours: %d-%d",
                categoryName, frequencyHours, probability * 100, activeHoursStart, activeHoursEnd));
            
            // Store these settings for the worker to access
            Context context = getReactApplicationContext();
            SharedPreferences prefs = context.getSharedPreferences("RandomRollSettings", Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("categoryName", categoryName);
            editor.putFloat("probability", (float) probability);
            editor.putInt("activeHoursStart", activeHoursStart);
            editor.putInt("activeHoursEnd", activeHoursEnd);
            editor.apply();
            
            // Convert hours to minutes for the work request
            long frequencyMinutes = (long) (frequencyHours * 60); 
            // Use minimum frequency of 15 minutes to avoid excessive battery usage
            frequencyMinutes = Math.max(frequencyMinutes, 15);
            
            // Create a work request with the specified frequency
            PeriodicWorkRequest periodicWork = 
                new PeriodicWorkRequest.Builder(RandomRollWorker.class, frequencyMinutes, TimeUnit.MINUTES)
                    .addTag(RANDOM_ROLL_WORK_TAG)
                    .build();
            
            WorkManager.getInstance(getReactApplicationContext())
                .enqueueUniquePeriodicWork(RANDOM_ROLL_WORK_TAG, 
                                           androidx.work.ExistingPeriodicWorkPolicy.REPLACE, 
                                           periodicWork);
            
            Log.i(TAG, "Random roll worker scheduled.");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling worker", e);
            promise.reject("ERR_SCHEDULE", "Failed to schedule random notifications: " + e.getMessage());
        }
    }

    @ReactMethod
    public void cancelRandomNotifications(Promise promise) {
        try {
            Log.d(TAG, "Cancelling random roll notifications...");
            WorkManager.getInstance(getReactApplicationContext()).cancelUniqueWork(RANDOM_ROLL_WORK_TAG);
            Log.i(TAG, "Random roll worker cancelled.");
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Error cancelling worker", e);
            promise.reject("ERR_CANCEL", "Failed to cancel random notifications: " + e.getMessage());
        }
    }
} 