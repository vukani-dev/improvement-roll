import * as React from 'react';
import {Linking} from 'react-native';
import {
  Layout,
  Text,
  Button,
  Modal,
  Icon,
  Toggle,
  TopNavigation,
  TopNavigationAction,
  Divider,
} from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import {getVersion} from 'react-native-device-info';

import BTCIcon from '../pictures/bitcoin-btc-logo.svg';
import ETHIcon from '../pictures/ethereum-eth-logo.svg';

export default ({navigation}) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
  const CautionIcon = (props) => (
    <Icon name="alert-triangle-outline" {...props} />
  );
  const ImportIcon = (props) => (
    <Icon name="download-outline" {...props} />
  );
  const ExportIcon = (props) => (
    <Icon name="upload-outline" {...props} />
  );
  const OctoIcon = (props) => <Icon name="github-outline" {...props} />;

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
      console.log(e);
      console.log('something happend');
    }
  };

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

  const _renderModal = () => {
    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setModalVisible(false)}>
        <Layout style={styleSheet.modal_container}>
          <Layout
            style={{
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              padding: 15,
            }}>
            <Text style={{textAlign: 'center', marginBottom: 10}}>
              This will clear all of your categories and re-add the "General"
              category.
            </Text>
            <Text>Are you sure you want to do this?</Text>
          </Layout>
          <Layout
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 70,
            }}>
            <Button onPress={() => setModalVisible(false)}>No</Button>
            <Button onPress={() => clearData()}>Yes</Button>
          </Layout>
        </Layout>
      </Modal>
    );
  };
  return (
    <Layout style={styleSheet.columned_container}>
      <TopNavigation
        alignment="center"
        style={{backgroundColor: themeContext.backgroundColor}}
        title={makeVersionString()}
        accessoryLeft={BackAction}
      />

      <Layout
        style={{
          flex: 0.3,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginTop: 40,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Layout >
          <Button
            style={{marginBottom:20}}
            accessoryLeft={ImportIcon}
            accessoryRight={ExportIcon}
            onPress={() => navigation.navigate('ImportExport')}>
              Import / Export
          </Button>
          <Button
            status="warning"
            accessoryLeft={CautionIcon}
            onPress={() => setModalVisible(true)}>
            Reset Data
          </Button>
        </Layout>

        <Toggle checked={themeContext.theme == 'dark'} onChange={toggleTheme}>
          Dark Mode
        </Toggle>
      </Layout>
      <Divider />
      <Text style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
        Code
      </Text>
      <Layout
        style={{
          flex: 0.4,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'space-evenly',
          marginTop: 40,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Button
          style={{marginBottom: 30}}
          onPress={() => openGithub()}
          accessoryRight={OctoIcon}>
          View on github for instructions and code
        </Button>
        <Text>ALL feedback and suggestions are welcome!</Text>
      </Layout>

      <Divider />
      <Text style={{textAlign: 'center', marginTop: 10, fontWeight: 'bold'}}>
        Donate
      </Text>
      <Layout
        style={{flex: 0.6, backgroundColor: themeContext.backgroundColor}}>
        <Layout
          style={{
            flexDirection: 'row',
            marginVertical: 20,
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <BTCIcon width={48} height={48}></BTCIcon>
          <Text style={{marginTop: 10}} selectable={true}>
            3JEbKevTtts3ZAdt4vKnN7sbqdAkcoDKqY
          </Text>
        </Layout>
        <Layout
          style={{
            flexDirection: 'row',
            marginVertical: 20,
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <ETHIcon width={48} height={48}></ETHIcon>
          <Text style={{marginTop: 10}} selectable={true}>
            0xd75205A0Fb016e3a0C368F964D142cD29a829BF2
          </Text>
        </Layout>
      </Layout>

      <Layout
        style={{
          alignItems: 'center',
          marginTop: 30,
          marginHorizontal: 30,
        }}></Layout>
      {_renderModal()}
    </Layout>
  );
};
