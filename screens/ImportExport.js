import * as React from 'react';
import {
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  Icon,
  Button,
  Select,
  SelectItem,
  IndexPath,
  Modal,
  Card
} from '@ui-kitten/components';

import { logger, fileAsyncTransport } from "react-native-logs";
import Toast from 'react-native-simple-toast';
import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import FilePickerManager from 'react-native-file-picker';
import RNFS, { readFile } from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as TOML from '@iarna/toml';
import * as YAML from 'js-yaml';

const exportTypes = ['JSON', 'TOML', 'YAML'];

export default ({ navigation, route }) => {
  if (route.params != undefined) {
    switch (route.params.action) {
      case 'import':
        break;
      case 'export':
        Toast.show(`Saved to ${route.params.path}`);
        break;
    }
    route.params = undefined;
  }

  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));
  const displayValue = exportTypes[selectedIndex.row];
  const [visible, setVisible] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [errorDetailText, setErrorDetailText] = React.useState('');

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);
  const config = {
    transport: fileAsyncTransport,
    transportOptions: {
      FS: RNFS,
      fileName: `log.txt`,
    },
  };
  var log = logger.createLogger(config);


  const openFile = () => {
    try {

      var filePickerOptions = { title: "Select category file" };
      FilePickerManager.showFilePicker(filePickerOptions, (response) => {



        if (response.didCancel) {
          console.log('User cancelled file picker');
        } else if (response.error) {
          setErrorText('Error while selecting file. Only JSON, TOML, and YAML files are accepted');
          setVisible(true);
          return;
        } else {
          var filetype = response.path
            .substr(response.path.length - 4)
            .toLowerCase();

          if (!(exportTypes.indexOf(filetype.toUpperCase()) > -1)) {
            setErrorText('Only JSON, TOML, and YAML files are accepted');
            setVisible(true);
            return;
          }
          readFile(response.path, filetype);

        }
      });
    }
    catch (err) {
      log.error(err)
      log.error("This is an error log")

    }
  };

  const readFile = (path, filetype) => {


    RNFS.readFile(path).then((res) => {
      try {
        var parsedArray = [];
        switch (filetype) {
          case 'json':
            parsedArray = JSON.parse(res);
            break;
          case 'yaml':
            var x = YAML.load(res);
            console.log(x);
            parsedArray.push(YAML.load(res));
            break;
          case 'toml':
            parsedArray.push(TOML.parse(res));
            break;
        }
        AsyncStorage.getItem('categories').then((value) => {
          var categories = value != null ? JSON.parse(value) : [];

          for (var i = 0; i < parsedArray.length; i++) {
            categories.push(parsedArray[i]);
          }

          const jsonValue = JSON.stringify(categories);
          AsyncStorage.setItem('categories', jsonValue);

          if (parsedArray.length > 1) {
            Toast.show(`Imported multiple categories `, 20);
          } else {
            Toast.show(`Imported category: ${parsedArray[0].name}`, 20);
          }
        });
      } catch (err) {
        setErrorText(
          'Error parsing category. Ensure the file is formatted correctly.',
        );
        setErrorDetailText(err.message);
        setVisible(true);
      }
    });
  }


  const _errorModal = () => {
    return (
      <Modal
        visible={visible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setVisible(false)}>
        <Card disabled={true}>
          <Text>{errorText}</Text>
          <Text>{errorDetailText}</Text>
          <Button onPress={() => setVisible(false)}>DISMISS</Button>
        </Card>
      </Modal>
    );
  };

  return (
    <Layout style={styleSheet.columned_container}>
      <TopNavigation
        alignment="center"
        style={{ backgroundColor: themeContext.backgroundColor }}
        title="Import / Export"
        accessoryLeft={BackAction}
      />

      {_errorModal()}

      {/* {this.test()} */}
      <Layout
        style={{
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Button
          style={{
            marginTop: 100,
            marginBottom: 70,
            height: 90,
            marginHorizontal: 60,
          }}
          onPress={openFile}>
          Import
        </Button>

        <Layout
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <Button
            onPress={() =>
              navigation.navigate('Categories', {
                action: 'export',
                type: displayValue,
              })
            }>
            Export as...
          </Button>
          <Select
            style={{ width: 200 }}
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedIndex(index)}
            value={displayValue}>
            <SelectItem title="JSON" />
            <SelectItem title="TOML" />
            <SelectItem title="YAML" />
          </Select>
        </Layout>
      </Layout>
    </Layout>
  );
};
