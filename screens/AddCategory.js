import * as React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {Fumi, Kaede, Isao, Sae, Hoshi} from 'react-native-textinput-effects';
import SegmentedControl from '@react-native-community/segmented-control';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {FlatList} from 'react-native-gesture-handler';

import {
  Divider,
  CheckBox,
  Button,
  Icon,
  List,
  ListItem,
  Modal,
  Radio,
  RadioGroup,
  Input,
} from '@ui-kitten/components';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Categories from './Categories';

function AddCategory({route, navigation}) {
  const [allCategories, setAllCategories] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryDesc, setCategoryDesc] = React.useState('');

  const [categoryMode, setCategoryMode] = React.useState('');

  const [timeSensitive, setTimeSensitive] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [taskMode, setTaskMode] = React.useState('');
  const [taskName, setTaskName] = React.useState('');
  const [taskDesc, setTaskDesc] = React.useState('');
  const [taskTime, setTaskTime] = React.useState(0);
  const [taskId, setTaskId] = React.useState(0);
  const [tasks, setTasks] = React.useState([]);

  React.useEffect(() => {
    AsyncStorage.getItem('categories').then((value) => {
      var categories = value != null ? JSON.parse(value) : [];

      setAllCategories(categories);
      setCategoryMode('new');

      if (route.params != undefined && categories.length > 0) {
        for (var i = 0; i < categories.length; i++) {
          if (categories[i].name == route.params.categoryName) {
            for (var x = 0; x < categories[i].tasks.length; x++) {
              categories[i].tasks[x].key = x;
            }
            setTasks(categories[i].tasks);
            setCategoryMode('edit');
            setCategoryName(categories[i].name);
            setTimeSensitive(categories[i].timeSensitive);
            setCategoryDesc(categories[i].desc);
            break;
          }
        }
      }
    });
  }, []);

  const data = [
    {
      label: '0 - 10 min',
      value: 1,
    },
    {
      label: '10 - 20 min',
      value: 2,
    },
    {
      label: '30 min - 1 hour',
      value: 3,
    },
    {
      label: '1 hour +',
      value: 4,
    },
  ];
  const _openModal = (task) => {
    if (JSON.stringify(task) == JSON.stringify({})) {
      console.log('task is empty so its a new one');
      setTaskTime(0);
      setTaskName('');
      setTaskDesc('');
      setTaskId(0);
      setTaskMode('new');
    } else {
      setTaskTime(task.time);
      setTaskName(task.name);
      setTaskDesc(task.desc);
      setTaskId(task.key);
      setTaskMode('edit');
    }
    setModalVisible(true);
  };

  const _closeModal = (action) => {
    if (action == 'close') setModalVisible(false);
    else {
      var highestId = 0;
      var newTasks = [];
      var newTask = {name: taskName, desc: taskDesc, key: taskId};
      if (timeSensitive) newTask.time = taskTime;

      for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].name == newTask.name && tasks[i].key != newTask.key) {
          console.log('cant do that');
          return;
        }
        if (tasks[i].key == newTask.key) {
          newTasks.push(newTask);
        } else {
          newTasks.push(tasks[i]);
        }
        if (tasks[i].key > highestId) highestId = tasks[i].key;
      }

      if (taskMode == 'new') {
        highestId++;
        newTask.key = highestId;
        newTasks.push(newTask);
      }

      setTasks(newTasks);
      setModalVisible(false);
    }
  };

  const _saveCategoryList = (categoryList, action) => {
    try {
      const jsonValue = JSON.stringify(categoryList);
      AsyncStorage.setItem('categories', jsonValue).then((value) => {
        navigation.navigate('Main', {
          categoryName: categoryName,
          action: action,
        });
      });
    } catch (e) {
      console.log(e);
      console.log('something happend');
    }
  };

  const _filterCategoryList = (name) => {
    var newCategoryList = [];
    for (var i = 0; i < allCategories.length; i++) {
      if (allCategories[i].name == name) continue;
      newCategoryList.push(allCategories[i]);
    }
    return newCategoryList;
  };

  const _categoryComplete = async () => {
    var category = {
      name: categoryName,
      timeSensitive: timeSensitive,
      tasks: tasks,
      desc: categoryDesc,
      key: Date.now(),
    };

    var newCategoryList = _filterCategoryList(categoryName);
    newCategoryList.push(category);

    _saveCategoryList(newCategoryList, 'saved');
  };

  const _removeTask = (task) => {
    var filteredTasks = tasks.filter((item) => {
      return task.key != item.key;
    });
    setTasks(filteredTasks);
  };

  const _removeCategory = () => {
    setDeleteModalVisible(true);
  };

  const _deleteCat = () => {
    setDeleteModalVisible(false);
    _saveCategoryList(_filterCategoryList(categoryName), 'removed');
  };

  const _renderEditButton = (task) => (
    <ListItem
      title={task.name}
      description={task.desc}
      accessoryRight={() => (
        <Button onPress={() => _removeTask(task)} size="tiny">
          REMOVE
        </Button>
      )}
      onPress={() => _openModal(task)}></ListItem>
  );

  const _renderDeleteModal = () => {
    return (
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        onBackdropPress={() => setDeleteModalVisible(false)}
        backdropStyle={styles.backdrop}>
        <View style={styles.modalView}>
          <Text>Are you sure you want to delete this category?</Text>

          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
              marginHorizontal: 70,
            }}>
            <Button onPress={() => setDeleteModalVisible(false)}>No</Button>
            <Button onPress={() => _deleteCat()}>Yes</Button>
          </View>
        </View>
      </Modal>
    );
  };

  const _renderModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropStyle={styles.backdrop}>
        <View style={styles.modalView}>
          <Input
            placeholder="Enter a task"
            value={taskName}
            onChangeText={(text) => setTaskName(text)}></Input>

          <Input
            placeholder="Enter a description for the task"
            value={taskDesc}
            numberOfLines={4}
            multiline={true}
            returnKeyLabel="done"
            blurOnSubmit={true}
            onChangeText={(text) => setTaskDesc(text)}></Input>

          {timeSensitive ? (
            <View style={{padding: 10}}>
              <Text>How long does it take to do this task?</Text>
              <RadioGroup
                selectedIndex={taskTime}
                onChange={(index) => setTaskTime(index)}
                style={{marginTop: 20}}>
                <Radio>{data[0].label}</Radio>
                <Radio>{data[1].label}</Radio>
                <Radio>{data[2].label}</Radio>
                <Radio>{data[3].label}</Radio>
              </RadioGroup>
            </View>
          ) : null}

          <View>
            <Button onPress={() => _closeModal('save')}>
              {taskMode == 'new' ? 'Add Task' : 'Save Task'}
            </Button>
            <Button
              style={{marginTop: 10}}
              onPress={() => setModalVisible(false)}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    );
  };

  const renderInfiniteAnimationIcon = (props) => (
    <Icon {...props} name="plus-circle-outline" />
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#ffffee',
        padding: 15,
        paddingTop: 30,
      }}>
      <Fumi
        label={'Name'}
        iconClass={FontAwesomeIcon}
        iconName={'i-cursor'}
        iconColor={'#800'}
        iconSize={20}
        iconWidth={40}
        inputPadding={16}
        value={categoryName}
        onChangeText={(text) => setCategoryName(text)}
        style={{marginBottom: 20}}
      />

      <Input
        multiline={true}
        numberOfLines={4}
        placeholder="Enter a description for the category"
        value={categoryDesc}
        returnKeyLabel="done"
        onChangeText={(text) => setCategoryDesc(text)}
        blurOnSubmit={true}></Input>
      <View style={styles.checkboxContainer}>
        <CheckBox
          style={styles.checkbox}
          checked={timeSensitive}
          onChange={setTimeSensitive}
        />
        <Text style={styles.label} category="h2">
          This category is split by time
        </Text>
      </View>

      <Divider />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          marginVertical: 10,
        }}>
        <Text style={styles.label2}>Tasks</Text>
        <Button
          status="primary"
          size="small"
          accessoryLeft={renderInfiniteAnimationIcon}
          onPress={() => _openModal({})}>
          Add Task
        </Button>
      </View>

      <List
        style={{marginBottom: 10}}
        data={tasks}
        renderItem={({item}) => _renderEditButton(item)}></List>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Icon
          onPress={() => navigation.goBack()}
          fill="#800"
          name="arrow-back-outline"
          style={{width: '32', height: '32'}}
        />

        {categoryMode == 'edit' ? (
          <Icon
            onPress={() => _removeCategory()}
            fill="#800"
            name="trash"
            style={{width: '32', height: '32'}}
          />
        ) : null}
        <Icon
          fill="#800"
          onPress={() => _categoryComplete()}
          name="save"
          style={{width: '32', height: '32'}}
        />
      </View>
      {_renderModal()}
      {_renderDeleteModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  checkbox: {
    alignSelf: 'center',
  },
  inputStyle: {
    fontSize: 14,
  },
  textArea: {
    height: 70,
  },
  label: {
    margin: 8,
    color: '#800',
  },
  label2: {
    fontSize: 20,
    alignSelf: 'center',
    marginLeft: 10,
    color: '#800',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
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
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  timeSelectionContainer: {},
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default AddCategory;
