import * as React from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as K from '../utility_components/ui-kitten.component.js';
import Toast from 'react-native-simple-toast';

import Modal from "react-native-modal";
import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';

import RNFS from 'react-native-fs';
import { PermissionsAndroid } from 'react-native';
import * as TOML from '@iarna/toml';
import * as YAML from 'js-yaml';

import * as logger from '../utility_components/logging.component.js';

function CategoriesScreen({ route, navigation }) {
  const [allCategories, setAllCategories] = React.useState([]);
  const [timeRanges, setTimeRanges] = React.useState([]);
  const [minutes, setMinutes] = React.useState();
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState({})
  const { action, type } = route.params;

  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const quickTimeRanges = [
    {
      label: '0 - 10 min',
      tasks: [],
      min: 0,
      max: 10
    },
    {
      label: '11 - 30 min',
      tasks: [],
      min: 11,
      max: 20
    },
    {
      label: '31 min - 1 hour',
      tasks: [],
      min: 31,
      max: 60
    },
    {
      label: '1 hour +',
      tasks: [],
      min: 60,
      max: undefined
    },
  ];

  const BackAction = () => (
    <K.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );

  const AddIcon = (props) => <K.Icon {...props} name="plus-square-outline" />;
  const ExportIcon = (props) => <K.Icon {...props} name="arrow-upward-outline" />;
  const BackIcon = (props) => <K.Icon {...props} name="arrow-back" />;
  React.useEffect(() => {
    AsyncStorage.getItem('categories').then((value) => {
      var categories = value != null ? JSON.parse(value) : [];
      categories.sort((a, b) => new Date(b.key) - new Date(a.key));
      setAllCategories(categories);
    });
  }, []);

  const _categorySelected = (category) => {
    switch (action) {
      case 'view':
        navigation.navigate('AddCategory', { category: category, mode: 'edit' });
        break;
      case 'roll':
        if (category.timeSensitive) {

          var newTimeRange = [];

          for (var i = 0; i < category.tasks.length; i++) {
            if (newTimeRange.length == 4) {
              break;
            }
            var minutes = category.tasks[i].minutes;
            var task = category.tasks[i];

            for (var x = 0; x < quickTimeRanges.length; x++) {
              if (minutes >= quickTimeRanges[x].min && (minutes <= quickTimeRanges[x].max || quickTimeRanges[x].max == undefined)) {
                quickTimeRanges[x].tasks.push(task);

                if (newTimeRange.indexOf(quickTimeRanges[x]) == -1) {
                  newTimeRange.push(quickTimeRanges[x]);
                }
              }
            }
          }

          if (newTimeRange.length == 1) {
            navigation.navigate('Roll', { tasks: category.tasks });
            return;
          }

          setTimeRanges(newTimeRange);
          setSelectedCategory(category);
          setModalVisible(true);
        } else {
          navigation.navigate('Roll', { tasks: category.tasks });
        }
        break;
      case 'export':
        _export([category]);
        break;
    }
  };

  const _export = (categories) => {
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'Storage Permissions',
        message: 'Your app needs permission.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    ).then((res) => {
      //console.log(res);
      logger.logDebug(res);
      var filename =
        categories.length > 1
          ? `imp_roll_categories_${Date.now()}`
          : categories[0].name;
      var path2 = RNFS.DownloadDirectoryPath + `/${filename}.${type}`;
      var data = '';

      switch (type) {
        case 'json':
          data = JSON.stringify(categories);
          break;
        case 'toml':
          data = TOML.stringify(categories[0]);
          break;
        case 'yaml':
          data = YAML.dump(categories[0])
          break;
      }

      RNFS.writeFile(path2, data, 'utf8')
        .then((success) => {
          //console.log(success);
          logger.logDebug(success);
          navigation.navigate('ImportExport', { action: 'export', path: path2 });
        })
        .catch((err) => {
          logger.logWarning(err.message);
          //console.log('ERROR');
          //logger.logDebug('ERROR');
          //console.log(err);
          //logger.logDebug(err);
        });
    });
  };

  const _renderCategoryFooter = (item) => (
    <K.Text category="p2" style={{ margin: 5, textAlign: 'center' }}>
      {item.description}
    </K.Text>
  );

  const _renderCategory = (item) => {
    return (
      <K.Card
        onPress={() => _categorySelected(item)}
        status="info"
        style={{ margin: 10 }}
        footer={() => _renderCategoryFooter(item)}>
        <K.Text
          style={{ alignContent: 'center', textAlign: 'center' }}
          category="h6">
          {item.name}
        </K.Text>
      </K.Card>
    );
  };

  const _timeSelected = (tasks) => {
    setModalVisible(false);
    navigation.navigate('Roll', { tasks: tasks });
  };

  const _exactRoll = () => {
    var tasks = selectedCategory.tasks
    var rollTasks = []
    var lowerTime = minutes - global.settings.timeRange;
    lowerTime = lowerTime < 0 ? 0 : lowerTime;

    var higherTime = minutes
    //console.log(`Lower Time range: ${lowerTime}`)
    logger.logDebug(`Lower Time range: ${lowerTime}`)
    //console.log(`Higher time range: ${higherTime}`)
    logger.logDebug(`Higher time range: ${higherTime}`)
    for (var i = 0; i < tasks.length; i++) {
      var taskMinutes = Number(tasks[i].minutes)
      if (taskMinutes >= lowerTime && taskMinutes <= higherTime) {
        rollTasks.push(tasks[i])
      }
    }

    //console.log(`Filtered list of tasks to roll from:`)
    logger.logDebug(`Filtered list of tasks to roll from:`)
    //console.log(rollTasks)
    logger.logDebug(rollTasks)

    if (rollTasks.length == 0) {
      Toast.show(`No taks found within ${global.settings.timeRange} minutes of ${minutes}`)
      return;
    }
    setModalVisible(false)
    navigation.navigate('Roll', { tasks: rollTasks });
  };

  const _renderTimeModal = () => {
    const timeIcon = (props) => <K.Icon {...props} name="clock-outline" />;
    return (
      <Modal
        animationType={'slide'}
        onBackdropPress={() => setModalVisible(false)}
        isVisible={modalVisible}
        avoidKeyboard={false}
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          left: 0,
          right: 0,
          position: 'absolute'
        }}
      >

        <K.Layout style={styleSheet.modal_container}>
          <K.Text style={{ fontSize: 20, marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}>How much time do you have?</K.Text>

          <K.Text style={{ marginBottom: 7, fontWeight: 'bold' }}>Exact:</K.Text>

          <K.Layout style={{ flexDirection: 'row', flex: 1, justifyContent: 'flex-start' }}>

            <K.Input
              value={minutes}
              onChangeText={(min) => setMinutes(min)}
              keyboardType='number-pad'
              style={{
                flex: .5,
                marginRight: 50,
              }}
            ></K.Input>
            <K.Button
              onPress={() => _exactRoll()}
              accessoryLeft={timeIcon}
              style={{
                flex: .5,
              }}

            >Roll!</K.Button>
          </K.Layout>

          <K.Text style={{ marginBottom: 7, fontWeight: 'bold' }}>Quick Ranges:</K.Text>
          {timeRanges.map((timeRange) => (
            <K.Button
              status="primary"
              accessoryLeft={timeIcon}
              onPress={() => _timeSelected(timeRange.tasks)}
              style={{ marginTop: 15 }}
              key={timeRange.value}>
              {timeRange.label}
            </K.Button>
          ))}
        </K.Layout>
      </Modal>
    );
  };

  return (
    <K.Layout style={styleSheet.columned_container}>
      <K.TopNavigation
        alignment="center"
        style={{ backgroundColor: themeContext.backgroundColor }}
        title="Select a category"
        accessoryLeft={BackAction}
      />
      {_renderTimeModal()}
      <K.List
        style={{
          flex: 1,
          marginBottom: 15,
          backgroundColor:
            themeContext.theme === 'dark' ? '#1A2138' : '#FFFFEE',
        }}
        data={allCategories}
        renderItem={({ item }) => _renderCategory(item)}></K.List>
      <View style={{ flexDirection: 'row', flex: 0.1, justifyContent: 'center' }}>
        {action == 'view' ? (
          <K.Button
            style={{ marginBottom: 20 }}
            hidden
            accessoryRight={AddIcon}
            onPress={() => navigation.navigate('AddCategory')}>
            Create a new Category
          </K.Button>
        ) : (
          <View></View>
        )}
        {action == 'export' && type == 'json' ? (
          <K.Button
            style={{ marginBottom: 20 }}
            hidden
            accessoryRight={ExportIcon}
            accessoryLeft={ExportIcon}
            onPress={() => _export(allCategories)}>
            Export all
          </K.Button>
        ) : (
          <View></View>
        )}
      </View>
    </K.Layout>
  );
}

export default CategoriesScreen;
