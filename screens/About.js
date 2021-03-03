import * as React from 'react';
import {View, StyleSheet, Image, Linking, TouchableOpacity} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  ApplicationProvider,
  Layout,
  Text,
  IconRegistry,
  Button,
  Modal,
} from '@ui-kitten/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getUniqueId,
  getManufacturer,
  getApplicationName,
  getVersion,
} from 'react-native-device-info';

function AboutScreen({route, navigation}) {
  const [modalVisible, setModalVisible] = React.useState(false);

  const _renderModal = () => {
    return (
      <Modal
        transparent={true}
        visible={modalVisible}
        backdropStyle={styles.backdrop}>
        <View style={styles.modalView}>
          <Text>
            This will clear all of your categories and re-add the "General"
            category.
          </Text>
          <Text>Are you sure you want to do this?</Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 70,
            }}>
            <Button onPress={() => setModalVisible(false)}>No</Button>
            <Button onPress={() => _clearData()}>Yes</Button>
          </View>
        </View>
      </Modal>
    );
  };

  const _clearData = () => {
    try {
      AsyncStorage.removeItem('categories');
    } catch (e) {
      console.log(e);
      console.log('something happend');
    }
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

  return (
    <View style={styles.container}>
      <Text category="h5" style={{textAlign: 'center', marginTop: 20}}>
        VERSION {getVersion()}
      </Text>
      <Button
        style={{marginHorizontal: 80, marginTop: 30}}
        onPress={() => setModalVisible(true)}>
        Reset Data
      </Button>
      <View style={{alignItems: 'center', marginVertical: 40}}>
        <Text>BITCOIN</Text>
        <Image source={require('../pictures/bitcoin.png')} />

        <Text selectable={true}>3JEbKevTtts3ZAdt4vKnN7sbqdAkcoDKqY</Text>
      </View>
      <View style={{alignItems: 'center'}}>
        <Text>ETHEREUM</Text>
        <Image source={require('../pictures/eth.png')} />
        <Text selectable={true}>
          0xd75205A0Fb016e3a0C368F964D142cD29a829BF2
        </Text>
      </View>

      <View style={{alignItems: 'center', marginTop: 30, marginHorizontal: 30}}>
        <Text>View on github for instructions and code</Text>
        <TouchableOpacity onPress={() => openGithub()}>
          <View>
            <Image source={require('../pictures/octo64.png')}></Image>
          </View>
        </TouchableOpacity>
      </View>
      {_renderModal()}
    </View>
  );
}
export default AboutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#ffffee',
  },
  button_container: {
    padding: 30,
  },
  modalView: {
    margin: 20,
    marginBottom: 100,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
