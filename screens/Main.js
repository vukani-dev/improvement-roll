import * as React from 'react';
import Toast from 'react-native-simple-toast';
import generalCategory from '../categories/DefaultCategories';
import {Button, Icon, Text, Layout} from '@ui-kitten/components';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function MainScreen({route, navigation}) {
  if (route.params != undefined) {
    if (route.params.action == 'reset') {
      Toast.show('Reset complete.');
      const jsonValue = JSON.stringify([generalCategory]);
      AsyncStorage.setItem('categories', jsonValue);
    } else {
      Toast.show(
        `Category "${route.params.categoryName}" ${route.params.action}.`,
      );
    }
  }

  React.useEffect(() => {
    AsyncStorage.getAllKeys().then((value) => {
      if (value.indexOf('categories') == -1) {
        const jsonValue = JSON.stringify([generalCategory]);
        AsyncStorage.setItem('categories', jsonValue);
      }

      if (value.indexOf('theme') >= 0) {
        AsyncStorage.getItem('theme').then((val) => {
          if (val == 'dark') {
            themeContext.toggleTheme();
          }
        });
      }
    });
  }, []);

  const RollIcon = (props) => <Icon name="flip-outline" {...props} />;
  const ListIcon = (props) => <Icon name="list-outline" {...props} />;
  const SettingsIcon = (props) => <Icon name="settings-2-outline" {...props} />;
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  return (
    <Layout style={styleSheet.centered_container}>
      <Text style={{marginTop: 100, fontWeight: 'bold'}} category="h1">
        Improvement
      </Text>
      <Text style={{marginBottom: 100, fontWeight: 'bold'}} category="h1">
        Roll
      </Text>

      <Button
        accessoryLeft={RollIcon}
        onPress={() => navigation.navigate('Categories', {action: 'roll'})}>
        Roll
      </Button>
      <Button
        style={{margin: 10}}
        accessoryLeft={ListIcon}
        onPress={() => navigation.navigate('Categories', {action: 'view'})}>
        View Categories
      </Button>

      <Button
        accessoryLeft={SettingsIcon}
        onPress={() => navigation.navigate('Options')}>
        Options
      </Button>
      {/* <Button onPress={() => themeContext.toggleTheme()}>Add</Button>V */}
    </Layout>
  );
}

export default MainScreen;
