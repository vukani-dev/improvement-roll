import * as React from 'react';
import Toast from 'react-native-simple-toast';
import generalCategory from '../categories/DefaultCategories';
import { Button, Icon, Text, Layout } from '@ui-kitten/components';
import { DeviceEventEmitter } from 'react-native';
import { getCategories, rollFromCategory } from '../utility_components/roll-helper';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as logger from '../utility_components/logging.component.js';

export default ({ route, navigation }) => {

  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  // check for route params to show relevant toasts
  if (route.params != undefined) {
    switch (route.params.action) {
      case 'reset':
        Toast.show('Reset complete');
        AsyncStorage.setItem('categories', JSON.stringify([generalCategory]));
        break;
      default:
        Toast.show(
          `Category "${route.params.categoryName}" ${route.params.action}.`,
        );
        break;
    }
    route.params = undefined;
  }

  React.useEffect(() => {

    AsyncStorage.getAllKeys().then((value) => {
      if (value.indexOf('categories') == -1) {
        AsyncStorage.setItem('categories', JSON.stringify([generalCategory]));
      }

      if (value.indexOf('theme') >= 0) {
        AsyncStorage.getItem('theme').then((val) => {
          if (val == 'dark') {
            themeContext.toggleTheme();
          }
        });
      }

      if (value.indexOf('settings') >= 0) {
        AsyncStorage.getItem('settings').then((val) => {
          //console.log(`Current settings:`)
          logger.logDebug(`Current settings:`)
          //console.log(val)
          logger.logDebug(val)
          global.settings = JSON.parse(val)
        });
      }
      else {
        var newSettings = { debugMode: false };
        AsyncStorage.setItem('settings', JSON.stringify(newSettings)).then((res) => {
          global.settings = newSettings;
        });
      }
    });
  }, []);

  // Listen for notification roll again events
  React.useEffect(() => {
    const handleRollAgain = async (event) => {
      try {
        const categoryName = event.categoryName;
        logger.logDebug(`Roll again requested for category: ${categoryName}`);
        
        // Find the category by name
        const categories = await getCategories();
        const category = categories.find(cat => cat.name === categoryName);
        
        if (category) {
          // Navigate to Roll screen with the category's tasks
          navigation.navigate('Roll', { tasks: category.tasks });
          Toast.show(`Rolling from ${categoryName}`);
        } else {
          logger.logWarning(`Category ${categoryName} not found for roll again action`);
          // Fall back to categories screen
          navigation.navigate('Categories', { action: 'roll' });
        }
      } catch (error) {
        logger.logWarning(`Error handling roll again event: ${error.message}`);
        // Fall back to categories screen
        navigation.navigate('Categories', { action: 'roll' });
      }
    };
    
    // Add event listener
    const subscription = DeviceEventEmitter.addListener('onRollAgainRequested', handleRollAgain);
    
    return () => {
      // Remove event listener on unmount
      subscription.remove();
    };
  }, [navigation]);

  const RollIcon = (props) => <Icon name="flip-outline" {...props} />;
  const ListIcon = (props) => <Icon name="list-outline" {...props} />;
  const SettingsIcon = (props) => <Icon name="settings-2-outline" {...props} />;
  const GlobeIcon = (props) => <Icon name="globe-outline" {...props} />;

  return (
    <Layout style={styleSheet.centered_container}>
      <Text style={{ marginTop: 100, fontWeight: 'bold' }} category="h1">
        Improvement
      </Text>
      <Text style={{ marginBottom: 70, fontWeight: 'bold' }} category="h1">
        Roll
      </Text>

      <Button
        accessoryLeft={RollIcon}
        onPress={() => navigation.navigate('Categories', { action: 'roll' })}>
        Roll
      </Button>
      <Button
        style={{ marginTop: 10  }}
        accessoryLeft={ListIcon}
        onPress={() => navigation.navigate('Categories', { action: 'view' })}>
        View Categories
      </Button>
      <Button
        style={{ margin: 10, marginBottom: 35 }}
        accessoryLeft={GlobeIcon}
        onPress={() => navigation.navigate('CommunityCategories', { action: 'view' })}>
        Community Categories
      </Button>

      <Button
        accessoryLeft={SettingsIcon}
        onPress={() => navigation.navigate('Options')}>
        Options
      </Button>
    </Layout>
  );
}
