package com.improvement_roll.widget;

import android.app.Activity;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.facebook.react.modules.storage.AsyncLocalStorageUtil;
import com.facebook.react.modules.storage.ReactDatabaseSupplier;
import com.improvement_roll.R;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

/**
 * The configuration screen for the ImprovementRollWidget AppWidget.
 */
public class ImprovementRollWidgetConfigureActivity extends Activity {
    private static final String TAG = "ImpRollWidgetConfig";
    
    int mAppWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    ListView categoryListView;
    Button cancelButton;
    TextView titleTextView;
    
    private final View.OnClickListener mOnCancelClickListener = new View.OnClickListener() {
        public void onClick(View v) {
            // The cancel button was clicked, close the activity without saving
            finish();
        }
    };

    @Override
    public void onCreate(Bundle icicle) {
        super.onCreate(icicle);

        // Set the result to CANCELED. This will cause the widget host to cancel
        // out of the widget placement if the user presses the back button.
        setResult(RESULT_CANCELED);

        setContentView(R.layout.improvement_roll_widget_configure);
        
        categoryListView = (ListView) findViewById(R.id.category_list);
        cancelButton = (Button) findViewById(R.id.cancel_button);
        titleTextView = (TextView) findViewById(R.id.title_text);
        
        // Find the widget id from the intent.
        Intent intent = getIntent();
        Bundle extras = intent.getExtras();
        if (extras != null) {
            mAppWidgetId = extras.getInt(
                    AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        }

        // If this activity was started with an intent without an app widget ID, finish with an error.
        if (mAppWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish();
            return;
        }

        // Set up the cancel button
        cancelButton.setOnClickListener(mOnCancelClickListener);
        
        // Load available categories
        loadCategories();
    }
    
    private void loadCategories() {
        try {
            final List<String> categoryNames = new ArrayList<>();
            final List<String> categoryDescriptions = new ArrayList<>();
            
            // Get category data from AsyncStorage
            String categoriesJSON = AsyncLocalStorageUtil.getItemImpl(
                    ReactDatabaseSupplier.getInstance(this).get(),
                    "categories"
            );

            // Log the raw string for debugging
            Log.d(TAG, "Raw categories JSON from AsyncStorage: " + categoriesJSON);
            
            // Check if the string is not null or empty
            if (categoriesJSON != null && !categoriesJSON.isEmpty()) {
                // Removed incorrect substring call that assumed extra quotes
                JSONArray categories = new JSONArray(categoriesJSON);
                
                for (int i = 0; i < categories.length(); i++) {
                    JSONObject category = categories.getJSONObject(i);
                    categoryNames.add(category.getString("name"));
                    categoryDescriptions.add(category.optString("description", ""));
                }
                
                // Create an adapter for the ListView
                ArrayAdapter<String> adapter = new ArrayAdapter<>(this,
                        android.R.layout.simple_list_item_1, categoryNames);
                categoryListView.setAdapter(adapter);
                
                // Set up item click listener
                categoryListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
                    @Override
                    public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                        final String categoryName = categoryNames.get(position);
                        
                        // Save the selected category for this widget
                        ImprovementRollWidget.saveCategoryPref(ImprovementRollWidgetConfigureActivity.this,
                                mAppWidgetId, categoryName);
                        
                        // Make sure we pass back the original appWidgetId
                        Intent resultValue = new Intent();
                        resultValue.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, mAppWidgetId);
                        setResult(RESULT_OK, resultValue);
                        
                        Toast.makeText(ImprovementRollWidgetConfigureActivity.this,
                                "Widget configured for " + categoryName, Toast.LENGTH_SHORT).show();
                        
                        finish();
                    }
                });
                
                if (categoryNames.isEmpty()) {
                    titleTextView.setText("No categories available");
                    categoryListView.setVisibility(View.GONE);
                }
            } else {
                titleTextView.setText("No categories available");
                categoryListView.setVisibility(View.GONE);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error loading categories", e);
            titleTextView.setText("Error loading categories");
            categoryListView.setVisibility(View.GONE);
        }
    }
} 