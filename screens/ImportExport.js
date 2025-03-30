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
  // Handle route params once on component mount
  React.useEffect(() => {
    if (route.params) {
      if (route.params.action === 'export') {
        Toast.show(`Saved to ${route.params.path}`);
      }
      // Clear params after handling
      navigation.setParams({ action: undefined, path: undefined });
    }
  }, [route.params]);

  const importTypes = ['json', 'toml', 'yaml'];
  const [selectedIndex, setSelectedIndex] = React.useState(new Kitten.IndexPath(0));
  const displayValue = importTypes[selectedIndex.row];
  const [errorModalVisible, setErrorModalVisible] = React.useState(false);
  const [errorText, setErrorText] = React.useState('');
  const [errorDetailText, setErrorDetailText] = React.useState('');

  const BackIcon = React.useCallback((props) => 
    <Kitten.Icon {...props} name="arrow-back" />, []);
    
  const BackAction = React.useCallback(() => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  ), [BackIcon, navigation]);
  
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const getFileType = React.useCallback((file) => {
    const filetype = file.path
      .substr(file.path.length - 4)
      .toLowerCase();

    if (filetype === '.yml') {
      return 'yaml';
    }
    return filetype;
  }, []);

  const parseFile = React.useCallback((file, type) => {
    logger.logDebug(`Parsing filepath: ${file.path}, type: ${type}`);
    
    RNFS.readFile(file.path).then((res) => {
      try {
        let parsedArray = [];
        let parsedFile;

        switch (type) {
          case 'json':
            parsedFile = JSON.parse(res);
            break;
          case 'yaml':
            parsedFile = YAML.load(res);
            break;
          case 'toml':
            parsedArray.push(TOML.parse(res));
            break;
        }

        if (Array.isArray(parsedFile)) {
          parsedArray = parsedFile;
        } else if (parsedFile) {
          parsedArray.push(parsedFile);
        }

        addCategories(parsedArray);
      } catch (err) {
        logger.logFatal(err.message);
        return showError('Error parsing category from file. Ensure the file is formatted correctly.', err.message);
      }
    }).catch(err => {
      logger.logFatal(`File read error: ${err.message}`);
      return showError('Error reading file', err.message);
    });
  }, []);

  const getUniqueName = React.useCallback((name, existingCategories) => {
    let newName = `${name}`;
    // Sort categories alphabetically
    existingCategories.sort((a, b) => a.name.localeCompare(b.name));
    
    let instance = 1;
    for (let i = 0; i < existingCategories.length; i++) {
      if (existingCategories[i].name === newName) {
        if (instance > 1) {
          newName = newName.substring(0, newName.lastIndexOf('_'));
        }
        newName += `_${instance.toString().padStart(2, '0')}`;
        instance++;
      }
    }
    return newName;
  }, []);

  const addCategories = React.useCallback(async (categoryArray) => {
    try {
      const value = await AsyncStorage.getItem('categories');
      const categories = value != null ? JSON.parse(value) : [];
      
      // Process each imported category for name uniqueness
      for (let i = 0; i < categoryArray.length; i++) {
        const category = categoryArray[i];
        
        // Make sure the category has a unique name
        category.name = getUniqueName(category.name, categories);
        
        // If the category doesn't have a key, add one
        if (!category.key) {
          category.key = Date.now() + i;
        }
        
        // Ensure timeSensitive is correctly set if it's using the old format
        if (category.time_sensitive !== undefined && category.timeSensitive === undefined) {
          category.timeSensitive = category.time_sensitive;
          delete category.time_sensitive;
        }
        
        // Add the category to the list
        categories.push(category);
      }

      const jsonValue = JSON.stringify(categories);
      await AsyncStorage.setItem('categories', jsonValue);
      logger.logDebug('Successfully imported category');

      if (categoryArray.length > 1) {
        Toast.show(`Imported ${categoryArray.length} categories with unique names`, 20);
      } else if (categoryArray.length === 1) {
        Toast.show(`Imported category: ${categoryArray[0].name}`, 20);
      }
    } catch (error) {
      logger.logWarning(`Error importing categories: ${error.message}`);
      showError('Error importing categories', error.message);
    }
  }, [getUniqueName]);

  const importFile = React.useCallback(() => {
    FilePickerManager.showFilePicker(null, (response) => {
      if (response.didCancel) {
        logger.logDebug('User cancelled file picker');
      } else if (response.error) {
        logger.logFatal(`Error while selecting file ===> ${response.error}`);
        return showError('An error occurred while selecting your file. Check the logs for details');
      } else {
        const filetype = getFileType(response);
        if (!importTypes.includes(filetype)) {
          return showError('Only JSON, TOML, and YAML files are accepted');
        }

        parseFile(response, filetype);
      }
    });
  }, [getFileType, importTypes, parseFile]);

  const showError = React.useCallback((text, detailedText = null) => {
    setErrorText(text);
    setErrorDetailText(detailedText || '');
    setErrorModalVisible(true);
  }, []);

  const _errorModal = React.useMemo(() => {
    return (
      <Kitten.Modal
        visible={errorModalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setErrorModalVisible(false)}>
        <Kitten.Card disabled={true}>
          <Kitten.Text>{errorText}</Kitten.Text>
          {errorDetailText ? <Kitten.Text>{errorDetailText}</Kitten.Text> : null}
          <Kitten.Button onPress={() => setErrorModalVisible(false)}>DISMISS</Kitten.Button>
        </Kitten.Card>
      </Kitten.Modal>
    );
  }, [errorModalVisible, errorText, errorDetailText, styleSheet.modal_backdrop]);

  return (
    <Kitten.Layout style={styleSheet.columned_container}>
      <Kitten.TopNavigation
        alignment="center"
        style={{ backgroundColor: themeContext.backgroundColor }}
        title="Import / Export"
        accessoryLeft={BackAction}
      />

      {_errorModal}

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
