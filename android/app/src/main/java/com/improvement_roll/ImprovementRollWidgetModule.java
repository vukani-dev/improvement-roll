package com.improvement_roll;

import android.content.Context;
import android.content.Intent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.os.Bundle;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.storage.AsyncLocalStorageUtil;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.improvement_roll.widget.ImprovementRollWidget;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Random;

public class ImprovementRollWidgetModule extends ReactContextBaseJavaModule {
    private static final String TAG = "ImpRollWidgetModule";
    private final ReactApplicationContext reactContext;

    public ImprovementRollWidgetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ImprovementRollWidget";
    }

    /**
     * Notify the widget to update
     */
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

    /**
     * Get available categories for widget configuration
     */
    @ReactMethod
    public void getCategories(Promise promise) {
        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            // Log the raw string for debugging
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

    /**
     * Roll a random task from a specific category
     */
    @ReactMethod
    public void rollFromCategory(String categoryName, Promise promise) {
        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            // Log the raw string for debugging
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);
            
            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                
                JSONObject targetCategory = null;
                // Find the requested category
                for (int i = 0; i < categories.length(); i++) {
                    JSONObject category = categories.getJSONObject(i);
                    if (category.getString("name").equals(categoryName)) {
                        targetCategory = category;
                        break;
                    }
                }
                
                // If category found, roll a random task
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
            
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Error rolling task", e);
            promise.reject("ERR_WIDGET", "Failed to roll task: " + e.getMessage());
        }
    }

    /**
     * Roll a random task from the first available category
     */
    @ReactMethod
    public void rollFromAnyCategory(Promise promise) {
        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(getReactApplicationContext()).get(),
                    "categories"
            );
            
            // Log the raw string for debugging
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);
            
            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                
                if (categories.length() > 0) {
                    // Default to first category
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
            
            promise.resolve(null);
        } catch (Exception e) {
            Log.e(TAG, "Error rolling any task", e);
            promise.reject("ERR_WIDGET", "Failed to roll any task: " + e.getMessage());
        }
    }
} 