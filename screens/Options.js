import * as React from 'react';
import { Linking, ActivityIndicator } from 'react-native';
import * as Kitten from '../utility_components/ui-kitten.component.js';
import * as logger from '../utility_components/logging.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import { getVersion } from 'react-native-device-info';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

import BTCIcon from '../pictures/bitcoin-btc-logo.svg';
import ETHIcon from '../pictures/ethereum-eth-logo.svg';
import Toast from 'react-native-simple-toast';

export default ({ navigation }) => {
  const [resetModalVisible, setResetModalVisible] = React.useState(false);
  const [debugModalVisible, setDebugModalVisible] = React.useState(false);
  const [debugModeText, setDebugModeText] = React.useState(global.settings.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode');
  const [loading, setLoading] = React.useState(false);
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const BackAction = () => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;
  const CautionIcon = (props) => (
    <Kitten.Icon name="alert-triangle-outline" {...props} />
  );
  const ImportIcon = (props) => (
    <Kitten.Icon name="arrow-downward-outline" {...props} />
  );
  const ExportIcon = (props) => <Kitten.Icon name="arrow-upward-outline" {...props} />;
  const OctoIcon = (props) => <Kitten.Icon name="github-outline" {...props} />;
  const DebugIcon = (props) => <Kitten.Icon name="book-outline" {...props} />;

  const makeVersionString = () => {
    return `Version ${getVersion()}`;
  };

  const clearData = () => {
    try {
      AsyncStorage.removeItem('categories').then((val) => {
        navigation.navigate('Main', {
          categoryName: '',
          action: 'reset',
        });
      });
    } catch (e) {
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
              Toast.show('You must grant write access to use this feature.', 5000);
              setDebugModalVisible(false);
              setLoading(false);
              return;
            }
            setDebugging(value)
          })
        }
        else {
          setDebugging(value);
        }
      })
    }
    else {
      setDebugging(value)
    }
  }

  const setDebugging = (value) => {
    global.settings.debugMode = value;
    AsyncStorage.setItem(
      'settings', JSON.stringify(global.settings)
    ).then(() => {
      setDebugModalVisible(false);
      setDebugModeText(value ? 'Disable Debug Mode' : 'Enable Debug Mode')
      Toast.show(`Debug mode ${value ? 'enabled.' : 'disabled.'}`);
      setLoading(false);
    });

  }

  const toggleTheme = () => {
    themeContext.toggleTheme();
    AsyncStorage.setItem(
      'theme',
      themeContext.theme == 'dark' ? 'light' : 'dark',
    );
  };


  const openGithub = () => {
    Linking.canOpenURL(
      'https://github.com/vukani-dev/improvement-roll.git',
    ).then((supported) => {
      if (supported) {
        Linking.openURL('https://github.com/vukani-dev/improvement-roll.git');
      } else {
        console.log(
          "Don't know how to open URI: https://github.com/vukani-dev/improvement-roll.git",
        );
      }
    });
  };

  const _renderResetModal = () => {
    return (
      <Kitten.Modal
        transparent={true}
        visible={resetModalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setResetModalVisible(false)}>
        <Kitten.Layout style={styleSheet.modal_container}>
          <Kitten.Layout
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              padding: 15,
            }}>
            <Kitten.Text style={{ textAlign: 'center', marginBottom: 10 }}>
              This will clear all of your categories and re-add the "General"
              category.
            </Kitten.Text>
            <Kitten.Text>Are you sure you want to do this?</Kitten.Text>
          </Kitten.Layout>
          <Kitten.Layout
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 70,
            }}>
            <Kitten.Button onPress={() => setResetModalVisible(false)}>No</Kitten.Button>
            <Kitten.Button onPress={() => clearData()}>Yes</Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Kitten.Modal>
    );
  };

  const _renderDebugModal = () => {
    return (
      <>
        {loading ? (
          <Kitten.Layout
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
          </Kitten.Layout>


        ) : (<Kitten.Modal
          transparent={true}
          visible={debugModalVisible}
          backdropStyle={styleSheet.modal_backdrop}
          onBackdropPress={() => setDebugModalVisible(false)}>
          <Kitten.Layout style={styleSheet.modal_container}>
            <Kitten.Layout
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                padding: 15,
              }}>
              {_debugModalText(global.settings.debugMode)}
              <Kitten.Text>Are you sure you want to do this?</Kitten.Text>
            </Kitten.Layout>
            <Kitten.Layout
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 10,
                marginHorizontal: 70,
              }}>
              <Kitten.Button onPress={() => setDebugModalVisible(false)}>No</Kitten.Button>
              <Kitten.Button onPress={() => checkPermissions(!global.settings.debugMode)}>Yes</Kitten.Button>
            </Kitten.Layout>
          </Kitten.Layout>
        </Kitten.Modal>
        )}
      </>)
  };

  const _debugModalText = (debugMode) => (

    <Kitten.Layout>

      {debugMode ?
        <Kitten.Text style={{ textAlign: 'center', marginBottom: 10 }}>
          This will disable Debug Mode.


        </Kitten.Text>
        :
        <Kitten.Text style={{ textAlign: 'center', marginBottom: 10 }}>
          This will enable logging on the app.
          Logs about crashes and warnings will be saved to the Downloads folder with the name "imp-roll-logs.txt"
        </Kitten.Text>
      }
    </Kitten.Layout>
  )
  return (
    <Kitten.Layout style={styleSheet.options_container}>

      <Kitten.TopNavigation
        alignment="center"
        style={styleSheet.top_navigation}
        title={makeVersionString()}
        accessoryLeft={BackAction}
      />

      <Kitten.Layout
        style={{
          flex: 0.3,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginBottom: 10,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Kitten.Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
          }}
        >
          <Kitten.Button
            style={{ marginBottom: 10 }}
            accessoryLeft={ImportIcon}
            accessoryRight={ExportIcon}
            onPress={() => navigation.navigate('ImportExport')}>
            Import / Export
          </Kitten.Button>
          <Kitten.Button
            style={{ marginBottom: 10 }}
            status="info"
            accessoryLeft={DebugIcon}
            onPress={() => setDebugModalVisible(true)}>
            {debugModeText}
          </Kitten.Button>
          <Kitten.Button
            status="warning"
            accessoryLeft={CautionIcon}
            onPress={() => setResetModalVisible(true)}>
            Reset Data
          </Kitten.Button>
        </Kitten.Layout>

        <Kitten.Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
          }}
        >

          <Kitten.Toggle

            style={{ marginBottom: 10 }}
            checked={themeContext.theme == 'dark'} onChange={toggleTheme}>
            Dark Mode
          </Kitten.Toggle>
        </Kitten.Layout>

        <Kitten.Divider />

      </Kitten.Layout>

      <Kitten.Divider />
      <Kitten.Layout
        style={{
          flex: 0.25,
          flexDirection: 'column',
          flexWrap: 'wrap',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'space-evenly',
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Kitten.Text style={{ fontWeight: 'bold' }}>
          Code
        </Kitten.Text>
        <Kitten.Button
          onPress={() => openGithub()}
          accessoryRight={OctoIcon}>
          View on github for instructions and code
        </Kitten.Button>
        <Kitten.Text>ALL feedback and suggestions are welcome!</Kitten.Text>
      </Kitten.Layout>

      <Kitten.Divider />
      <Kitten.Layout
        style={{
          flex: 0.25, backgroundColor: themeContext.backgroundColor,
          flexDirection: 'column',
          alignContent: 'center',
          justifyContent: 'space-evenly',
          alignItems: 'center'
        }}>
        <Kitten.Text style={{ fontWeight: 'bold' }}>
          Donate
        </Kitten.Text>

        <Kitten.Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >

          <BTCIcon width={48} height={20}></BTCIcon>
          <Kitten.Text selectable={true}>
            3JEbKevTtts3ZAdt4vKnN7sbqdAkcoDKqY
          </Kitten.Text>
        </Kitten.Layout>
        <Kitten.Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          <ETHIcon width={48} height={20}></ETHIcon>
          <Kitten.Text style={{ fontSize: 13 }} selectable={true}>
            0xd75205A0Fb016e3a0C368F964D142cD29a829BF2
          </Kitten.Text>
        </Kitten.Layout>
      </Kitten.Layout>

      <Kitten.Layout style={{ flex: 0.2 }}>

      </Kitten.Layout>
      {_renderResetModal()}
      {_renderDebugModal()}
    </Kitten.Layout>
  );
};
