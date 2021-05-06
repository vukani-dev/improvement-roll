import * as React from 'react';
import {ActivityIndicator} from 'react-native';

import {Jiro} from 'react-native-textinput-effects';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import {
  Divider,
  CheckBox,
  Button,
  Icon,
  List,
  ListItem,
  Modal,
  Radio,
  Text,
  RadioGroup,
  Layout,
  Input,
  TopNavigation,
  TopNavigationAction,
} from '@ui-kitten/components';

import AsyncStorage from '@react-native-async-storage/async-storage';

function AddCategoryScreen({route, navigation}) {
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
  const [loading, setLoading] = React.useState(true);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const renderRightActions = () => (
    <React.Fragment>
      {categoryMode == 'edit' ? (
        <TopNavigationAction
          icon={TrashIcon}
          onPress={() => _removeCategory()}
        />
      ) : null}
      <TopNavigationAction
        style={{marginLeft: 20}}
        icon={SaveIcon}
        onPress={() => _categoryComplete()}
      />
    </React.Fragment>
  );
  React.useEffect(() => {
    AsyncStorage.getItem('categories').then((value) => {
      setLoading(true);
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
            setCategoryDesc(categories[i].description);
            break;
          }
        }
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } else {
        setLoading(false);
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

  const BackIcon = (props) => <Icon {...props} name="arrow-back" />;

  const BackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
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
      description: categoryDesc,
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
    <>
      <ListItem
        title={task.name}
        description={task.desc}
        style={{backgroundColor: themeContext.backgroundColor}}
        accessoryRight={() => (
          <Button onPress={() => _removeTask(task)} size="tiny">
            REMOVE
          </Button>
        )}
        onPress={() => _openModal(task)}></ListItem>
      <Divider style={{marginHorizontal: 10}} />
    </>
  );

  const _renderDeleteModal = () => {
    return (
      <Modal
        transparent={true}
        visible={deleteModalVisible}
        onBackdropPress={() => setDeleteModalVisible(false)}
        backdropStyle={styleSheet.modal_backdrop}>
        <Layout style={styleSheet.modal_container}>
          <Text>Are you sure you want to delete this category?</Text>

          <Layout
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
              marginHorizontal: 70,
            }}>
            <Button onPress={() => setDeleteModalVisible(false)}>No</Button>
            <Button onPress={() => _deleteCat()}>Yes</Button>
          </Layout>
        </Layout>
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
        backdropStyle={styleSheet.modal_backdrop}>
        <Layout style={styleSheet.modal_container}>
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
            <Layout style={{padding: 10}}>
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
            </Layout>
          ) : null}

          <Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 10,
            }}>
            <Button onPress={() => setModalVisible(false)}>Cancel</Button>
            <Button
              onPress={() => _closeModal('save')}
              accessoryRight={taskMode == 'new' ? AddIcon : SaveIcon}>
              {taskMode == 'new' ? 'Add Task' : 'Save Task'}
            </Button>
          </Layout>
        </Layout>
      </Modal>
    );
  };

  const AddIcon = (props) => <Icon {...props} name="plus-circle-outline" />;
  const SaveIcon = (props) => <Icon {...props} name="save" />;
  const TrashIcon = (props) => <Icon {...props} name="trash" />;

  return (
    <>
      {loading ? (
        <Layout style={styleSheet.loading_container}>
          <ActivityIndicator
            style={{alignSelf: 'center'}}
            size="large"
            color="#800"
            animating={loading}
          />
        </Layout>
      ) : (
        <Layout
          style={{flex: 1, backgroundColor: themeContext.backgroundColor}}>
          <TopNavigation
            alignment="center"
            style={{backgroundColor: themeContext.backgroundColor}}
            title={
              categoryMode == 'edit'
                ? 'Editing a Category...'
                : 'Creating a Category...'
            }
            accessoryLeft={BackAction}
            accessoryRight={renderRightActions}
          />

          <Jiro
            label={'Name'}
            borderColor={'#800'}
            inputPadding={16}
            value={categoryName}
            style={{backgroundColor: themeContext.backgroundColor}}
            onChangeText={(text) => setCategoryName(text)}
            inputStyle={{color: 'white'}}
          />

          <Input
            multiline={true}
            numberOfLines={4}
            placeholder="Enter a description for the category"
            value={categoryDesc}
            returnKeyLabel="done"
            onChangeText={(text) => setCategoryDesc(text)}
            blurOnSubmit={true}></Input>
          <Layout
            style={{
              flexDirection: 'row',
              marginBottom: 10,
              marginLeft: 13,
              backgroundColor: themeContext.backgroundColor,
            }}>
            <CheckBox
              style={{alignSelf: 'center'}}
              checked={timeSensitive}
              onChange={setTimeSensitive}
            />
            <Text style={{margin: 20}}>This category is split by time</Text>
          </Layout>

          <Divider />
          <Layout
            style={{
              flexDirection: 'row',
              alignItems: 'stretch',
              justifyContent: 'space-between',
              marginVertical: 10,
              marginHorizontal: 13,
              backgroundColor: themeContext.backgroundColor,
            }}>
            <Text
              style={{
                fontSize: 20,
                alignSelf: 'center',
                fontWeight: 'bold',
              }}>
              Tasks
            </Text>
            <Button
              status="primary"
              size="small"
              accessoryLeft={AddIcon}
              onPress={() => _openModal({})}>
              Add Task
            </Button>
          </Layout>

          <List
            style={{backgroundColor: themeContext.backgroundColor}}
            data={tasks}
            renderItem={({item}) => _renderEditButton(item)}></List>
          {_renderModal()}
          {_renderDeleteModal()}
        </Layout>
      )}
    </>
  );
}

export default AddCategoryScreen;
