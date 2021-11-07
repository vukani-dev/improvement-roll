import React from 'react';
import { Alert, BackHandler } from 'react-native';
import * as eva from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { ThemeContext } from './utility_components/theme-context';
import { AppNavigator } from './utility_components/navigation.component';
import { default as mapping } from './utility_components/mapping.json'
import {
  setJSExceptionHandler,
  setNativeExceptionHandler,
} from 'react-native-exception-handler';
import { checkMultiple, PERMISSIONS } from 'react-native-permissions';
import * as logger from './utility_components/logging.component.js';


const handleError = (e, isFatal) => {

  if (global.settings.debugMode) {

    checkMultiple([PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE, PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE]).then((status) => {
      if (status[PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE] == 'granted' && status[PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE] == 'granted') {
        logger.logFatal(e.message);
      }
    })
  }

  if (isFatal) {
    Alert.alert(
      'Unexpected error occurred',
      `
      Error: ${(isFatal) ? 'Fatal:' : ''} ${e.name} ${e.message}
        \nLogs have been saved to Downloads if FILE Permissions have been granted. 
        \nPlease report this on the github!`,
      [{
        text: 'Close app and start again',
        onPress: () => {
          BackHandler.exitApp();
        }
      }]
    );
  } else {
    console.log(e);
  }
};

setJSExceptionHandler((error, isFatal) => {
  handleError(error, isFatal);
}, true);

setNativeExceptionHandler((errorString) => {

});



export default () => {

  const [theme, setTheme] = React.useState('light');
  const [backgroundColor, setBackgroundColor] = React.useState('#ffffee');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    const color = nextTheme === 'dark' ? '#222B45' : '#ffffee'

    setTheme(nextTheme);
    setBackgroundColor(color);

  };

  return (
    <>
      <IconRegistry icons={EvaIconsPack} />
      <ThemeContext.Provider value={{ theme, toggleTheme, backgroundColor }}>
        <ApplicationProvider customMapping={mapping} {...eva} theme={eva[theme]}>
          <AppNavigator />
        </ApplicationProvider>
      </ThemeContext.Provider>
    </>
  );
};