package com.improvement_roll.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Log;
import android.widget.RemoteViews;

import com.facebook.react.modules.storage.AsyncLocalStorageUtil;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.improvement_roll.MainActivity;
import com.improvement_roll.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Random;

/**
 * Implementation of App Widget functionality.
 */
public class ImprovementRollWidget extends AppWidgetProvider {
    private static final String TAG = "ImpRollWidget";
    private static final String PREFS_NAME = "com.improvement_roll.widget.ImprovementRollWidget";
    private static final String PREF_CATEGORY_KEY = "widget_category_";
    private static final String ACTION_ROLL_TASK = "com.improvement_roll.widget.ACTION_ROLL_TASK";
    private static final String ACTION_OPEN_APP = "com.improvement_roll.widget.ACTION_OPEN_APP";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        // There may be multiple widgets active, so update all of them
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        
        if (ACTION_ROLL_TASK.equals(intent.getAction())) {
            int appWidgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, 
                    AppWidgetManager.INVALID_APPWIDGET_ID);
            
            if (appWidgetId != AppWidgetManager.INVALID_APPWIDGET_ID) {
                // Roll a new task and update widget
                rollTaskForWidget(context, appWidgetId);
            }
        } else if (ACTION_OPEN_APP.equals(intent.getAction())) {
            // Open the main app
            Intent launchIntent = new Intent(context, MainActivity.class);
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(launchIntent);
        }
    }

    @Override
    public void onDeleted(Context context, int[] appWidgetIds) {
        // When the user deletes the widget, delete the preference associated with it.
        SharedPreferences.Editor prefs = context.getSharedPreferences(PREFS_NAME, 0).edit();
        for (int appWidgetId : appWidgetIds) {
            prefs.remove(PREF_CATEGORY_KEY + appWidgetId);
        }
        prefs.apply();
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        try {
            // Get the saved widget configuration (category)
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, 0);
            String categoryName = prefs.getString(PREF_CATEGORY_KEY + appWidgetId, "");
            
            // Load the last rolled task or roll a new one
            String taskName = prefs.getString("task_name_" + appWidgetId, "");
            String taskDesc = prefs.getString("task_desc_" + appWidgetId, "");
            
            if (taskName.isEmpty()) {
                // First time or no task available, try to roll
                if (!categoryName.isEmpty()) {
                    rollTaskForWidget(context, appWidgetId);
                    return; // This function will be called again with the new task
                } else {
                    taskName = "Tap to roll";
                    taskDesc = "Configure widget to select a category";
                }
            }
            
            // Create widget layout
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.improvement_roll_widget);
            views.setTextViewText(R.id.widget_task_name, taskName);
            views.setTextViewText(R.id.widget_task_desc, taskDesc);
            
            if (!categoryName.isEmpty()) {
                views.setTextViewText(R.id.widget_category_name, "Category: " + categoryName);
            } else {
                views.setTextViewText(R.id.widget_category_name, "Tap to configure");
            }
            
            // Set up intent for rolling a new task
            Intent rollIntent = new Intent(context, ImprovementRollWidget.class);
            rollIntent.setAction(ACTION_ROLL_TASK);
            rollIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            PendingIntent rollPendingIntent = PendingIntent.getBroadcast(
                    context, appWidgetId, rollIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_roll_button, rollPendingIntent);
            
            // Set up intent for opening the main app
            Intent openAppIntent = new Intent(context, ImprovementRollWidget.class);
            openAppIntent.setAction(ACTION_OPEN_APP);
            PendingIntent openAppPendingIntent = PendingIntent.getBroadcast(
                    context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_open_app, openAppPendingIntent);
            
            // Set up intent for widget configuration if no category is selected
            if (categoryName.isEmpty()) {
                Intent configIntent = new Intent(context, ImprovementRollWidgetConfigureActivity.class);
                configIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
                PendingIntent configPendingIntent = PendingIntent.getActivity(
                        context, appWidgetId, configIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                views.setOnClickPendingIntent(R.id.widget_category_name, configPendingIntent);
            }
            
            // Update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views);
        } catch (Exception e) {
            Log.e(TAG, "Error updating widget", e);
        }
    }
    
    private static void rollTaskForWidget(Context context, int appWidgetId) {
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, 0);
            String categoryName = prefs.getString(PREF_CATEGORY_KEY + appWidgetId, "");
            
            if (categoryName.isEmpty()) {
                return; // No category selected
            }
            
            // Get category data from AsyncStorage
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(context).get(),
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
                        
                        // Save the task to SharedPreferences
                        SharedPreferences.Editor editor = prefs.edit();
                        editor.putString("task_name_" + appWidgetId, task.getString("name"));
                        editor.putString("task_desc_" + appWidgetId, task.optString("desc", ""));
                        editor.apply();
                        
                        // Update the widget with the new task
                        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
                        updateAppWidget(context, appWidgetManager, appWidgetId);
                        return; // Task rolled and widget updated
                    } else {
                        // Category found, but no tasks - Update widget with message
                        Log.w(TAG, "Category '" + categoryName + "' has no tasks.");
                        updateWidgetWithError(context, appWidgetId, categoryName, "No tasks in category");
                        return;
                    }
                } else if (targetCategory == null) {
                     // Category not found - Update widget with message
                     Log.w(TAG, "Configured category '" + categoryName + "' not found.");
                     updateWidgetWithError(context, appWidgetId, "Category Not Found", "Please reconfigure widget");
                     return;
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error rolling task for widget", e);
        }
    }
    
    // Helper method to update widget with an error/status message
    private static void updateWidgetWithError(Context context, int appWidgetId, String title, String message) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.improvement_roll_widget);
        
        views.setTextViewText(R.id.widget_task_name, title);
        views.setTextViewText(R.id.widget_task_desc, message);
        // Keep category name if available, otherwise show title
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, 0);
        String categoryName = prefs.getString(PREF_CATEGORY_KEY + appWidgetId, "");
        views.setTextViewText(R.id.widget_category_name, 
            categoryName.isEmpty() ? title : "Category: " + categoryName);
            
        // Ensure intents are still set up
        // Set up intent for rolling a new task
        Intent rollIntent = new Intent(context, ImprovementRollWidget.class);
        rollIntent.setAction(ACTION_ROLL_TASK);
        rollIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        PendingIntent rollPendingIntent = PendingIntent.getBroadcast(
                context, appWidgetId, rollIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_roll_button, rollPendingIntent);
        
        // Set up intent for opening the main app
        Intent openAppIntent = new Intent(context, ImprovementRollWidget.class);
        openAppIntent.setAction(ACTION_OPEN_APP);
        PendingIntent openAppPendingIntent = PendingIntent.getBroadcast(
                context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_open_app, openAppPendingIntent);
        
        // Set up config intent if needed
        if (categoryName.isEmpty()) {
            Intent configIntent = new Intent(context, ImprovementRollWidgetConfigureActivity.class);
            configIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
            PendingIntent configPendingIntent = PendingIntent.getActivity(
                    context, appWidgetId, configIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_category_name, configPendingIntent);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
    
    // Method to update configuration
    public static void saveCategoryPref(Context context, int appWidgetId, String categoryName) {
        SharedPreferences.Editor prefs = context.getSharedPreferences(PREFS_NAME, 0).edit();
        prefs.putString(PREF_CATEGORY_KEY + appWidgetId, categoryName);
        prefs.apply();
        
        // Clear any existing task
        prefs.remove("task_name_" + appWidgetId);
        prefs.remove("task_desc_" + appWidgetId);
        prefs.apply();
        
        // Roll a new task with the selected category
        rollTaskForWidget(context, appWidgetId);
    }
} 