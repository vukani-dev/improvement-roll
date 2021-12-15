import * as React from 'react';

import * as Kitten from '../utility_components/ui-kitten.component.js';
import * as logger from '../utility_components/logging.component.js';


import Toast from 'react-native-simple-toast';
import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import FilePickerManager from 'react-native-file-picker';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as TOML from '@iarna/toml';
import * as YAML from 'js-yaml';

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

  const importTypes = ['json', 'toml', 'yaml'];
  const [selectedIndex, setSelectedIndex] = React.useState(new Kitten.IndexPath(0));
  const displayValue = importTypes[selectedIndex.row];
  const [errorModalVisible, setErrorModalVisible] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [errorDetailText, setErrorDetailText] = React.useState('');

  const BackAction = () => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const importFile = () => {
    FilePickerManager.showFilePicker(null, (response) => {
      if (response.didCancel) {
        logger.logDebug('User cancelled file picker');
      } else if (response.error) {
        logger.logFatal(`Error while selecting file ===> ${response.error}`);
        return showError('An error occured while selecting your file. Check the logs for details')
      } else {

        var filetype = getFileType(response);
        if (!(importTypes.indexOf(filetype) > -1)) {
          return showError('Only JSON, TOML, and YAML files are accepted')
        }

        parseFile(response, filetype);
      }
    });
  };

  const getFileType = (file) => {
    var filetype = file.path
      .substr(file.path.length - 4)
      .toLowerCase();

    if (filetype == '.yml') {
      return 'yaml';
    }
    return filetype;
  }

  const parseFile = (file, type) => {
    logger.logDebug(`Parsing filepath :${file.path}, type: ${type}`)
    RNFS.readFile(file.path).then((res) => {
      try {
        var parsedArray = [];

        switch (type) {
          case 'json':
            var parsedFile = JSON.parse(res);
            break;
          case 'yaml':
            var parsedFile = YAML.load(res);
            break;
          case 'toml':
            parsedArray.push(TOML.parse(res));
            break;
        }

        if (Array.isArray(parsedFile)) {
            parsedArray = parsedFile;
        } else {
            parsedArray.push(parsedFile);
        }

        addCategories(parsedArray);
      } catch (err) {
        logger.logFatal(err.message);
        return showError('Error parsing category from file. Ensure the file is formatted correctly.', err.message);
      }
    });
  }

  const addCategories = (categoryArray) => {
    AsyncStorage.getItem('categories').then((value) => {
      var categories = value != null ? JSON.parse(value) : [];

      for (var i = 0; i < categoryArray.length; i++) {
        categories.push(categoryArray[i]);
      }

      const jsonValue = JSON.stringify(categories);
      AsyncStorage.setItem('categories', jsonValue);
      logger.logDebug('Successfully imported category');

      if (categoryArray.length > 1) {
        Toast.show(`Imported multiple categories `, 20);
      } else {
        Toast.show(`Imported category: ${categoryArray[0].name}`, 20);
      }
    });

  }

  const _errorModal = () => {
    return (
      <Kitten.Modal
        visible={errorModalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setErrorModalVisible(false)}>
        <Kitten.Card disabled={true}>
          <Kitten.Text>{errorText}</Kitten.Text>
          <Kitten.Text>{errorDetailText}</Kitten.Text>
          <Kitten.Button onPress={() => setErrorModalVisible(false)}>DISMISS</Kitten.Button>
        </Kitten.Card>
      </Kitten.Modal>
    );
  };

  const showError = (text, detailedText = null) => {
    setErrorText(text);
    setErrorModalVisible(true);

    if (detailedText != null)
      setErrorDetailText(detailedText)
  }

  return (
    <Kitten.Layout style={styleSheet.columned_container}>
      <Kitten.TopNavigation
        alignment="center"
        style={{ backgroundColor: themeContext.backgroundColor }}
        title="Import / Export"
        accessoryLeft={BackAction}
      />

      {_errorModal()}

      <Kitten.Layout
        style={{
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Kitten.Button
          style={{
            marginTop: 100,
            marginBottom: 70,
            height: 90,
            marginHorizontal: 60,
          }}
          onPress={importFile}>
          Import
        </Kitten.Button>

        <Kitten.Layout
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
            backgroundColor: themeContext.backgroundColor,
          }}>
          <Kitten.Button
            onPress={() =>
              navigation.navigate('Categories', {
                action: 'export',
                type: displayValue,
              })
            }>
            Export as...
          </Kitten.Button>
          <Kitten.Select
            style={{ width: 200 }}
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedIndex(index)}
            value={displayValue}>
            <Kitten.SelectItem title="JSON" />
            <Kitten.SelectItem title="TOML" />
            <Kitten.SelectItem title="YAML" />
          </Kitten.Select>
        </Kitten.Layout>
      </Kitten.Layout>
    </Kitten.Layout>
  );
};
