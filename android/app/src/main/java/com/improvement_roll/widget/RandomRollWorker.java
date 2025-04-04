package com.improvement_roll.widget; // Using widget package for now, can be refactored

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.facebook.react.modules.storage.AsyncLocalStorageUtil;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.improvement_roll.MainActivity;
import com.improvement_roll.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Random;

public class RandomRollWorker extends Worker {
    private static final String TAG = "RandomRollWorker";
    private static final String CHANNEL_ID = "ImprovementRollReminders";
    private static final int NOTIFICATION_ID = 1001;

    public RandomRollWorker(
            @NonNull Context context,
            @NonNull WorkerParameters params) {
        super(context, params);
        createNotificationChannel(context);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Worker running...");
        Context context = getApplicationContext();

        // Load settings
        SharedPreferences prefs = context.getSharedPreferences("RandomRollSettings", Context.MODE_PRIVATE);
        String categoryName = prefs.getString("categoryName", "General");
        float probability = prefs.getFloat("probability", 0.5f);
        int activeHoursStart = prefs.getInt("activeHoursStart", 9);
        int activeHoursEnd = prefs.getInt("activeHoursEnd", 22);
        
        // Check if current time is within active hours
        java.util.Calendar cal = java.util.Calendar.getInstance();
        int currentHour = cal.get(java.util.Calendar.HOUR_OF_DAY);
        
        // If current hour is outside active hours, skip
        if (currentHour < activeHoursStart || currentHour >= activeHoursEnd) {
            Log.d(TAG, String.format(
                "Current hour (%d) outside active hours (%d-%d). Skipping.",
                currentHour, activeHoursStart, activeHoursEnd));
            return Result.success();
        }

        // Randomly decide whether to show a notification based on configured probability
        if (Math.random() > probability) {
            Log.d(TAG, String.format(
                "Skipping notification based on probability setting (%.0f%%).",
                probability * 100));
            return Result.success(); // Still success, just didn't notify
        }

        try {
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(context).get(),
                    "categories"
            );

            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                JSONArray categories = new JSONArray(categoriesJSON);
                
                if (categories.length() > 0) {
                    // Find the requested category
                    JSONObject targetCategory = null;
                    for (int i = 0; i < categories.length(); i++) {
                        JSONObject category = categories.getJSONObject(i);
                        if (category.getString("name").equals(categoryName)) {
                            targetCategory = category;
                            break;
                        }
                    }
                    
                    // If category not found, fall back to first category
                    if (targetCategory == null && categories.length() > 0) {
                        targetCategory = categories.getJSONObject(0);
                        categoryName = targetCategory.getString("name");
                        Log.w(TAG, String.format(
                            "Category '%s' not found. Falling back to '%s'.",
                            categoryName, targetCategory.getString("name")));
                    }

                    if (targetCategory != null && targetCategory.has("tasks")) {
                        JSONArray tasks = targetCategory.getJSONArray("tasks");
                        if (tasks.length() > 0) {
                            int randomIndex = new Random().nextInt(tasks.length());
                            JSONObject task = tasks.getJSONObject(randomIndex);
                            String taskName = task.getString("name");
                            String taskDesc = task.optString("desc", "");

                            Log.i(TAG, "Rolled task: " + taskName + " from category: " + categoryName);
                            sendNotification(context, categoryName, taskName, taskDesc);
                            return Result.success();
                        } else {
                            Log.w(TAG, "Category '" + categoryName + "' has no tasks.");
                        }
                    }
                } else {
                    Log.w(TAG, "No categories found.");
                }
            } else {
                 Log.w(TAG, "Categories JSON is null or empty.");
            }

        } catch (Exception e) {
            Log.e(TAG, "Error performing background roll", e);
            return Result.failure(); // Indicate work failed
        }

        // If we reach here, it means no task was rolled for some reason (no categories, empty category, etc.)
        return Result.success(); // Return success so worker doesn't get retried immediately for data issues
    }

    private void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Productivity Reminders";
            String description = "Random reminders to perform a task";
            int importance = NotificationManager.IMPORTANCE_DEFAULT;
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, name, importance);
            channel.setDescription(description);

            NotificationManager notificationManager = context.getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);
            Log.d(TAG, "Notification channel created.");
        }
    }

    private void sendNotification(Context context, String categoryName, String taskName, String taskDesc) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, intent, PendingIntent.FLAG_IMMUTABLE);

        // Add "roll again" action
        Intent rollAgainIntent = new Intent(context, MainActivity.class);
        rollAgainIntent.setAction("com.improvement_roll.ROLL_AGAIN");
        rollAgainIntent.putExtra("categoryName", categoryName);
        PendingIntent rollAgainPendingIntent = PendingIntent.getActivity(
                context, 1, rollAgainIntent, PendingIntent.FLAG_IMMUTABLE);

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.notification_icon)
                .setContentTitle(categoryName)
                .setContentText(taskName)
                .setStyle(new NotificationCompat.BigTextStyle()
                        .bigText(taskName + "\n" + taskDesc))
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setContentIntent(pendingIntent)
                .addAction(android.R.drawable.ic_menu_rotate, "Roll Again", rollAgainPendingIntent)
                .setAutoCancel(true);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        notificationManager.notify(NOTIFICATION_ID, builder.build());
        Log.i(TAG, "Notification sent for task: " + taskName);
    }
} 