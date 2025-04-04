import * as React from 'react';
import { Linking, ActivityIndicator, Platform, View } from 'react-native';
import * as K from '../utility_components/ui-kitten.component.js';
import * as Icons from '../utility_components/icon.component.js';
import * as logger from '../utility_components/logging.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

import Toast from 'react-native-simple-toast';
import backgroundTaskManager from '../utility_components/background-task-manager';

export default ({ navigation }) => {

    const [timeRangeModalVisible, setTimeRangeModalVisible] = React.useState(false);
    const [resetModalVisible, setResetModalVisible] = React.useState(false);
    const [debugModalVisible, setDebugModalVisible] = React.useState(false);
    const [debugModeText, setDebugModeText] = React.useState(
        global.settings.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode',
    );
    const [timeRange, setTimeRange] = React.useState(
        global.settings.timeRange ? global.settings.timeRange : 2,
    );

    const [loading, setLoading] = React.useState(false);
    const themeContext = React.useContext(ThemeContext);
    const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

    const [randomNotifyEnabled, setRandomNotifyEnabled] = React.useState(false);
    const [notifySettingsModalVisible, setNotifySettingsModalVisible] = React.useState(false);
    const [selectedCategoryIndex, setSelectedCategoryIndex] = React.useState(new K.IndexPath(0));
    const [categoryOptions, setCategoryOptions] = React.useState([]);
    const [categoryNames, setCategoryNames] = React.useState([]);
    const [frequency, setFrequency] = React.useState('6'); // Hours between checks (default: 6)
    const [probability, setProbability] = React.useState('50'); // Percent chance of showing (default: 50%)
    const [activeHoursStart, setActiveHoursStart] = React.useState('9'); // 9 AM
    const [activeHoursEnd, setActiveHoursEnd] = React.useState('22'); // 10 PM

    const [loadingSettings, setLoadingSettings] = React.useState(true);

    const BackAction = () => (
        <K.TopNavigationAction icon={Icons.BackIcon} onPress={navigation.goBack} />
    );
    const clearData = () => {
        try {
            AsyncStorage.removeItem('categories').then((val) => {
                navigation.navigate('Main', {
                    categoryName: '',
                    action: 'reset',
                });
            });
        } catch (e) {
            logger.logWarning(e.message);
            Toast.show('Error reseting categores. Please try again.');
        }
    };
    const checkPermissions = (value) => {
        if (value) {
            check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((status) => {
                if (status != RESULTS.GRANTED) {
                    setLoading(true);
                    request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result) => {
                        if (result != RESULTS.GRANTED) {
                            Toast.show(
                                'You must grant write access to use this feature.',
                                5000,
                            );
                            setDebugModalVisible(false);
                            setLoading(false);
                            return;
                        }
                        setDebugging(value);
                    });
                } else {
                    setDebugging(value);
                }
            });
        } else {
            setDebugging(value);
        }
    };

    const setDebugging = (value) => {
        global.settings.debugMode = value;
        AsyncStorage.setItem('settings', JSON.stringify(global.settings)).then(
            () => {
                setDebugModalVisible(false);
                setDebugModeText(value ? 'Disable Debug Mode' : 'Enable Debug Mode');
                Toast.show(`Debug mode ${value ? 'enabled.' : 'disabled.'}`);
                setLoading(false);
            },
        );
    };

    // Load all settings on mount
    React.useEffect(() => {
      let isMounted = true;
      
      const loadSettings = async () => {
        try {
          // Load notification toggle state
          const enabled = await AsyncStorage.getItem('randomNotificationEnabled');
          setRandomNotifyEnabled(enabled === 'true');
          
          // Load notification settings
          const categoryIndex = await AsyncStorage.getItem('notifyCategoryIndex');
          if (categoryIndex) setSelectedCategoryIndex(new K.IndexPath(parseInt(categoryIndex, 10)));
          
          const freqValue = await AsyncStorage.getItem('notifyFrequency');
          if (freqValue) setFrequency(freqValue);
          
          const probValue = await AsyncStorage.getItem('notifyProbability');
          if (probValue) setProbability(probValue);
          
          const startHour = await AsyncStorage.getItem('notifyActiveStart');
          if (startHour) setActiveHoursStart(startHour);
          
          const endHour = await AsyncStorage.getItem('notifyActiveEnd');
          if (endHour) setActiveHoursEnd(endHour);
          
          // Load available categories for selection
          const categoriesValue = await AsyncStorage.getItem('categories');
          if (categoriesValue) {
            const categories = JSON.parse(categoriesValue);
            const names = categories.map(cat => cat.name);
            setCategoryNames(names);
            setCategoryOptions(names);
          }
          
          if(isMounted) {
            setLoadingSettings(false);
          }
        } catch (error) {
          logger.logWarning("Error loading settings: " + error.message);
          if(isMounted) {
            setLoadingSettings(false);
          }
        }
      };
      
      loadSettings();
      
      return () => { isMounted = false; };
    }, []);

    // Basic toggle handler - just enables/disables notifications
    const handleRandomNotifyToggle = async (isEnabled) => {
      setLoading(true); // Set loading state at the beginning
      
      if (isEnabled) {
        try {
          // Check notification permission first
          let status = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
          
          // On Android < 13, POST_NOTIFICATIONS doesn't exist, check might return GRANTED or UNAVAILABLE.
          // Treat UNAVAILABLE as granted for older versions.
          // Request only if DENIED (specifically denied on Android 13+)
          if (status === RESULTS.DENIED) { 
            status = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
          }

          // Proceed only if granted (or unavailable on older Android)
          if (status !== RESULTS.GRANTED && status !== RESULTS.UNAVAILABLE) {
            Toast.show(
              'Notification permission is required to enable this feature.',
              5000,
            );
            setLoading(false); 
            return; // Stop execution if permission not granted/blocked
          }
          
          // Permission granted or not needed, continue with enabling notifications logic
          await processNotificationToggle(true); 

        } catch (error) {
            logger.logWarning("Error checking/requesting notification permission: " + error.message);
            Toast.show('Error checking notification permissions.');
            setLoading(false); 
        }
      } else {
        // User is disabling notifications, no permission needed
        await processNotificationToggle(false); 
      }
    };
    
    // Renamed function to handle the actual enabling/disabling logic *after* permission check
    const processNotificationToggle = async (isEnabled) => {
      try {
        await AsyncStorage.setItem('randomNotificationEnabled', isEnabled.toString());
        
        if (isEnabled) {
          // If enabling, check if it's the first time to show settings modal
          const configured = await AsyncStorage.getItem('notifyConfigured');
          if (configured !== 'true') {
            setRandomNotifyEnabled(true); // Update state now
            setNotifySettingsModalVisible(true);
            // Don't schedule yet, wait for settings to be saved
            setLoading(false); // Stop loading here, settings modal is shown
            return; 
          } else {
             await scheduleNotifications(); // scheduleNotifications runs if already configured
             setRandomNotifyEnabled(true); // Update state after scheduling succeeds (implicitly handled by scheduleNotifications failures)
             Toast.show('Random notifications enabled.'); // Moved Toast from scheduleNotifications
          }
        } else {
          // Disabling notifications
          const success = await backgroundTaskManager.cancelRandomNotifications();
          if (success) {
            setRandomNotifyEnabled(false); // Update state only on successful cancellation
            Toast.show('Random notifications disabled.');
          } else {
            Toast.show('Failed to disable random notifications.');
             // Don't change state if disabling failed, keep it enabled
          }
        }
        setLoading(false); // Set loading false after successful operation (enable or disable) or if settings modal shown
      } catch (error) {
        // Catch errors from AsyncStorage, scheduleNotifications, or cancelRandomNotifications
        logger.logWarning(`Error processing notification toggle (${isEnabled ? 'enabling' : 'disabling'}): ` + error.message);
        Toast.show('Error updating notification settings.');
        // Don't change the toggle state on error, leave it as it was before the attempt
        setLoading(false); // Ensure loading is false on error
      }
    };
    
    // Notification scheduling with all settings (modified to not handle state/toast directly)
    const scheduleNotifications = async () => {
      // Remove try/catch block here, let the caller handle it
      // Get selected category
      // Ensure categoryOptions and selectedCategoryIndex are valid before accessing
      const categoryName = (categoryOptions && categoryOptions.length > selectedCategoryIndex.row) 
                           ? categoryOptions[selectedCategoryIndex.row] 
                           : 'General'; // Fallback to 'General' if needed

      
      // Parse numeric settings, provide defaults if parsing fails
      const frequencyHours = parseFloat(frequency) || 6;
      const probabilityPercent = parseFloat(probability) || 50;
      const startHour = parseInt(activeHoursStart, 10) || 9;
      const endHour = parseInt(activeHoursEnd, 10) || 22;

      // Validate parsed values (optional but recommended)
      if (isNaN(frequencyHours) || isNaN(probabilityPercent) || isNaN(startHour) || isNaN(endHour)) {
          logger.logWarning("Invalid notification settings detected during scheduling.");
          throw new Error("Invalid notification settings.");
      }
      
      // Schedule with all parameters
      const success = await backgroundTaskManager.scheduleRandomNotifications(
        categoryName,
        frequencyHours,
        probabilityPercent / 100, // Convert to 0-1 range
        startHour,
        endHour
      );
      
      if (success) {
        // Mark as configured only on successful scheduling
        await AsyncStorage.setItem('notifyConfigured', 'true');
      } else {
         // Throw an error if scheduling failed, to be caught by the caller
         throw new Error("Failed to schedule background task."); 
      }
      // Removed Toast and state updates from here
    };
    
    // Save notification settings and schedule
    const saveNotificationSettings = async () => {
      setLoading(true); // Add loading indicator
      try {
        // Save all settings to AsyncStorage
        await AsyncStorage.setItem('notifyCategoryIndex', selectedCategoryIndex.row.toString());
        await AsyncStorage.setItem('notifyFrequency', frequency);
        await AsyncStorage.setItem('notifyProbability', probability);
        await AsyncStorage.setItem('notifyActiveStart', activeHoursStart);
        await AsyncStorage.setItem('notifyActiveEnd', activeHoursEnd);
        
        // Schedule notifications with new settings
        await scheduleNotifications();
        
        // Update state and show success message only after scheduling succeeds
        setRandomNotifyEnabled(true); 
        Toast.show('Notification settings saved and notifications enabled.');

        // Close modal
        setNotifySettingsModalVisible(false);
      } catch (error) {
        logger.logWarning("Error saving notification settings: " + error.message);
        Toast.show('Error saving settings.');
        // Optionally revert the toggle if saving/scheduling failed
        // setRandomNotifyEnabled(false); 
        // await AsyncStorage.setItem('randomNotificationEnabled', 'false');
      } finally {
          setLoading(false); // Ensure loading is turned off
      }
    };

    const _renderResetModal = () => {
        return (
            <K.Modal
                isVisible={resetModalVisible}
                transparent={true}
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    position: 'absolute'
                }}
                onBackdropPress={() => setResetModalVisible(false)}>
                <K.Layout style={styleSheet.modal_container}>
                    <K.Layout
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 15,
                        }}>
                        <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                            This will clear all of your categories and re-add the "General"
                            category.
                        </K.Text>
                        <K.Text>Are you sure you want to do this?</K.Text>
                    </K.Layout>
                    <K.Layout
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            marginHorizontal: 70,
                        }}>
                        <K.Button onPress={() => setResetModalVisible(false)}>
                            No
                        </K.Button>
                        <K.Button onPress={() => clearData()}>Yes</K.Button>
                    </K.Layout>
                </K.Layout>
            </K.Modal>
        );
    };

    const _renderDebugModal = () => {
        return (
            <>
                {loading ? (
                    <K.Layout
                        style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flex: 1,
                            backgroundColor: themeContext.backgroundColor,
                        }}>
                        <ActivityIndicator
                            style={{ alignSelf: 'center' }}
                            size="large"
                            color="#800"
                            animating={loading}
                        />
                    </K.Layout>
                ) : (
                    <K.Modal
                        transparent={true}
                        isVisible={debugModalVisible}
                        style={{
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            left: 0,
                            right: 0,
                            position: 'absolute'
                        }}
                        onBackdropPress={() => setDebugModalVisible(false)}>
                        <K.Layout style={styleSheet.modal_container}>
                            <K.Layout
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 15,
                                }}>
                                {_debugModalText(global.settings.debugMode)}
                                <K.Text>Are you sure you want to do this?</K.Text>
                            </K.Layout>
                            <K.Layout
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 10,
                                    marginHorizontal: 70,
                                }}>
                                <K.Button onPress={() => setDebugModalVisible(false)}>
                                    No
                                </K.Button>
                                <K.Button
                                    onPress={() => checkPermissions(!global.settings.debugMode)}>
                                    Yes
                                </K.Button>
                            </K.Layout>
                        </K.Layout>
                    </K.Modal>
                )}
            </>
        );
    };

    const _debugModalText = (debugMode) => (
        <K.Layout>
            {debugMode ? (
                <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                    This will disable Debug Mode.
                </K.Text>
            ) : (
                <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                    This will enable logging on the app. Logs about crashes and warnings
                    will be saved to the Downloads folder with the name
                    "imp-roll-logs.txt"
                </K.Text>
            )}
        </K.Layout>
    );


    const saveTimeRange = (timeRange) => {
        global.settings.timeRange = timeRange
        AsyncStorage.setItem('settings', JSON.stringify(global.settings)).then(
            () => {
                setTimeRangeModalVisible(false);
                Toast.show(`Time range has been set to ${timeRange} minutes.`);
            },
        );
    }
    const _renderTimeRangeModal = () => {
        return (
            <K.Modal
                transparent={true}
                isVisible={timeRangeModalVisible}
                onBackdropPress={() => setTimeRangeModalVisible(false)}
                style={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    position: 'absolute'
                }}
            >

                <K.Layout style={styleSheet.modal_container}>
                    <K.Layout
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 15,
                        }}>

                        <K.Text
                            style={{ marginBottom: 10 }}

                        >Time range for exact rolling</K.Text>

                        <K.Input style={{ marginHorizontal: 100 }}
                            value={timeRange.toString()}
                            keyboardType='number-pad'
                            onChangeText={(text) => setTimeRange(text)}
                        ></K.Input>
                    </K.Layout>
                    <K.Button
                        onPress={() => saveTimeRange(timeRange)}>
                        Save
                    </K.Button>
                </K.Layout>
            </K.Modal>
        );
    };

    // Settings Modal for Notifications
    const _renderNotifySettingsModal = () => {
        return (
            <K.Modal
                visible={notifySettingsModalVisible}
                backdropStyle={styleSheet.modal_backdrop}
                onBackdropPress={() => setNotifySettingsModalVisible(false)}>
                <K.Card style={{ width: 320, maxHeight: 500 }} disabled={true}>
                    <K.Text category="h6" style={{ marginBottom: 15, textAlign: 'center' }}>
                        Notification Settings
                    </K.Text>
                    
                    {/* Category Selection */}
                    <K.Text category="s1" style={{ marginBottom: 5 }}>Category to roll from:</K.Text>
                    <K.Select
                        selectedIndex={selectedCategoryIndex}
                        value={categoryOptions[selectedCategoryIndex.row] || 'General'}
                        onSelect={index => setSelectedCategoryIndex(index)}
                        style={{ marginBottom: 15 }}>
                        {categoryOptions.map(title => (
                            <K.SelectItem key={title} title={title} />
                        ))}
                    </K.Select>
                    
                    {/* Frequency Control */}
                    <K.Text category="s1" style={{ marginBottom: 5 }}>Check frequency (hours):</K.Text>
                    <K.Input
                        value={frequency}
                        onChangeText={value => setFrequency(value.replace(/[^0-9.]/g, ''))}
                        keyboardType="decimal-pad"
                        style={{ marginBottom: 15 }}
                    />
                    
                    {/* Probability Control */}
                    <K.Text category="s1" style={{ marginBottom: 5 }}>Notification chance (%):</K.Text>
                    <K.Input
                        value={probability}
                        onChangeText={value => setProbability(value.replace(/[^0-9.]/g, ''))}
                        keyboardType="decimal-pad"
                        style={{ marginBottom: 15 }}
                    />
                    
                    {/* Active Hours */}
                    <K.Text category="s1" style={{ marginBottom: 5 }}>Active hours:</K.Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                        <K.Input
                            value={activeHoursStart}
                            onChangeText={value => setActiveHoursStart(value.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            placeholder="Start (0-23)"
                            style={{ width: '48%' }}
                        />
                        <K.Input
                            value={activeHoursEnd}
                            onChangeText={value => setActiveHoursEnd(value.replace(/[^0-9]/g, ''))}
                            keyboardType="number-pad"
                            placeholder="End (0-23)"
                            style={{ width: '48%' }}
                        />
                    </View>
                    
                    <K.Button onPress={saveNotificationSettings}>
                        Save Settings
                    </K.Button>
                </K.Card>
            </K.Modal>
        );
    };

    return (
        <K.Layout
            style={{
                backgroundColor: themeContext.backgroundColor,
                flex: 1
            }}>
            <K.TopNavigation
                alignment="center"
                style={styleSheet.top_navigation
                }
                title={'Advanced Settings'}
                accessoryLeft={BackAction}
            />

            <K.Layout
                style={{
                    backgroundColor: themeContext.backgroundColor,
                    marginHorizontal: 50,
                    paddingTop: 20
                }}
            >
                <K.Button
                    style={{ marginBottom: 10 }}
                    accessoryLeft={Icons.RollIcon}
                    onPress={() => setTimeRangeModalVisible(true)}>
                    Time range is set to {timeRange} minutes
                </K.Button>

                <K.Button
                    style={{ marginBottom: 10 }}
                    status="info"
                    accessoryLeft={Icons.DebugIcon}
                    onPress={() => setDebugModalVisible(true)}>
                    {debugModeText}
                </K.Button>
                <K.Button
                    status="warning"
                    accessoryLeft={Icons.CautionIcon}
                    onPress={() => setResetModalVisible(true)}>
                    Reset Data
                </K.Button>

                <K.Layout style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: 20, 
                    marginBottom: 10
                }}>
                    <K.Text>Random Task Notifications</K.Text>
                    <K.Toggle 
                        checked={randomNotifyEnabled} 
                        onChange={handleRandomNotifyToggle} 
                        disabled={loading || loadingSettings || !backgroundTaskManager.isAvailable()} 
                    />
                </K.Layout>
                {!backgroundTaskManager.isAvailable() && Platform.OS === 'android' && 
                    <K.Text category='c1' status='warning'>Background tasks module unavailable.</K.Text>
                }
                
                {/* Settings Button */}
                {randomNotifyEnabled && (
                    <K.Button 
                        appearance="outline" 
                        size="small"
                        style={{ marginTop: 5, marginBottom: 15 }}
                        onPress={() => setNotifySettingsModalVisible(true)}>
                        Notification Settings
                    </K.Button>
                )}
                
            </K.Layout>

            {_renderResetModal()}
            {_renderDebugModal()}
            {_renderTimeRangeModal()}
            {_renderNotifySettingsModal()}
        </K.Layout>
    )


}