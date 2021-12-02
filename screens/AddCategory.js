import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { Jiro } from 'react-native-textinput-effects';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import * as Kitten from '../utility_components/ui-kitten.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

function AddCategoryScreen({ route, navigation }) {
  const [allCategories, setAllCategories] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [categoryDesc, setCategoryDesc] = React.useState('');

  const [categoryMode, setCategoryMode] = React.useState('');

  const [timeSensitive, setTimeSensitive] = React.useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = React.useState(false);
  const [taskMode, setTaskMode] = React.useState('');
  const [task, setTask] = React.useState({});
  const [tasks, setTasks] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const renderRightActions = () => (
    <React.Fragment>
      {categoryMode == 'edit' ? (
        <Kitten.TopNavigationAction
          icon={TrashIcon}
          onPress={() => _removeCategory()}
        />
      ) : null}
      <Kitten.TopNavigationAction
        style={{ marginLeft: 20 }}
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

  const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;

  const BackAction = () => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );
  const openTaskModal = (item) => {
    if (item == undefined) {
      console.log('task is empty so its a new one');  
      var newTask = { Id: tasks.length }
      if (timeSensitive) newTask.time = 0

      setTask(newTask)
      setTaskMode('new');
    } else {
      setTask(item)
      setTaskMode('edit');
    }
    setModalVisible(true);
  };

  const saveTask = () => {
    if (taskMode == 'new') {
      setTasks(tasks => [...tasks, task])
    }
    else {
      setTasks(tasks => tasks.map(el => el.Id === task.Id ? task : el))
    }
    setModalVisible(false);
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
      <Kitten.ListItem
        title={task.name}
        description={task.desc}
        style={{ backgroundColor: themeContext.backgroundColor }}
        accessoryRight={() => (
          <Kitten.Button onPress={() => _removeTask(task)} size="tiny">
            REMOVE
          </Kitten.Button>
        )}
        onPress={() => openTaskModal(task)}></Kitten.ListItem>
      <Kitten.Divider style={{ marginHorizontal: 10 }} />
    </>
  );

  const _renderDeleteModal = () => {
    return (
      <Kitten.Modal
        transparent={true}
        visible={deleteModalVisible}
        onBackdropPress={() => setDeleteModalVisible(false)}
        backdropStyle={styleSheet.modal_backdrop}>
        <Kitten.Layout style={styleSheet.modal_container}>
          <Kitten.Text>Are you sure you want to delete this category?</Kitten.Text>

          <Kitten.Layout
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
              marginHorizontal: 70,
            }}>
            <Kitten.Button onPress={() => setDeleteModalVisible(false)}>No</Kitten.Button>
            <Kitten.Button onPress={() => _deleteCat()}>Yes</Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Kitten.Modal>
    );
  };

  const _renderModal = () => {
    return (
      <Kitten.Modal
        transparent={true}
        visible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        backdropStyle={styleSheet.modal_backdrop}>
        <Kitten.Layout style={styleSheet.modal_container}>

          <Kitten.Input
            placeholder="Enter a task"
            value={task.name}
            secureTextEntry={true}
            keyboardType={'visible-password'}
            onChangeText={(text) => setTask(task => ({ ...task, name: text }))}></Kitten.Input>

          <Kitten.Input
            placeholder="Enter a description for the task"
            value={task.desc}
            numberOfLines={4}
            multiline={true}
            returnKeyLabel="done"
            secureTextEntry={true}
            keyboardType={'visible-password'}
            blurOnSubmit={true}
            onChangeText={(text) => setTask(task => ({ ...task, desc: text }))}></Kitten.Input>

          {timeSensitive ? (
            <Kitten.Layout style={{ padding: 10 }}>
              <Kitten.Text>How long does it take to do this task?</Kitten.Text>
              <Kitten.RadioGroup
                selectedIndex={task.time}
                onChange={(index) => setTask(task => ({ ...task, time: index }))}
                style={{ marginTop: 20 }}>
                <Kitten.Radio>{data[0].label}</Kitten.Radio>
                <Kitten.Radio>{data[1].label}</Kitten.Radio>
                <Kitten.Radio>{data[2].label}</Kitten.Radio>
                <Kitten.Radio>{data[3].label}</Kitten.Radio>
              </Kitten.RadioGroup>
            </Kitten.Layout>
          ) : null}

          <Kitten.Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 10,
            }}>
            <Kitten.Button onPress={() => setModalVisible(false)}>Cancel</Kitten.Button>
            <Kitten.Button
              onPress={() => saveTask()}
              accessoryRight={taskMode == 'new' ? AddIcon : SaveIcon}>
              {taskMode == 'new' ? 'Add Task' : 'Save Task'}
            </Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Kitten.Modal>
    );
  };

  const AddIcon = (props) => <Kitten.Icon {...props} name="plus-circle-outline" />;
  const SaveIcon = (props) => <Kitten.Icon {...props} name="save" />;
  const TrashIcon = (props) => <Kitten.Icon {...props} name="trash" />;

  return (
    <>
      {loading ? (
        <Kitten.Layout style={styleSheet.loading_container}>
          <ActivityIndicator
            style={{ alignSelf: 'center' }}
            size="large"
            color="#800"
            animating={loading}
          />
        </Kitten.Layout>
      ) : (
        <Kitten.Layout
          style={{ flex: 1, backgroundColor: themeContext.backgroundColor }}>
          <Kitten.TopNavigation
            alignment="center"
            style={{ backgroundColor: themeContext.backgroundColor }}
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
            style={{ backgroundColor: themeContext.backgroundColor }}
            onChangeText={(text) => setCategoryName(text)}
            inputStyle={{ color: 'white' }}
          />

          <Kitten.Input
            multiline={true}
            numberOfLines={4}
            placeholder="Enter a description for the category"
            value={categoryDesc}
            returnKeyLabel="done"
            secureTextEntry={true}
            keyboardType={'visible-password'}
            onChangeText={(text) => setCategoryDesc(text)}
            blurOnSubmit={true}></Kitten.Input>
          <Kitten.Layout
            style={{
              flexDirection: 'row',
              marginBottom: 10,
              marginLeft: 13,
              backgroundColor: themeContext.backgroundColor,
            }}>
            <Kitten.CheckBox
              style={{ alignSelf: 'center' }}
              checked={timeSensitive}
              onChange={setTimeSensitive}
            />
            <Kitten.Text style={{ margin: 20 }}>This category is split by time</Kitten.Text>
          </Kitten.Layout>

          <Kitten.Divider />
          <Kitten.Layout
            style={{
              flexDirection: 'row',
              alignItems: 'stretch',
              justifyContent: 'space-between',
              marginVertical: 10,
              marginHorizontal: 13,
              backgroundColor: themeContext.backgroundColor,
            }}>
            <Kitten.Text
              style={{
                fontSize: 20,
                alignSelf: 'center',
                fontWeight: 'bold',
              }}>
              Tasks
            </Kitten.Text>
            <Kitten.Button
              status="primary"
              size="small"
              accessoryLeft={AddIcon}
              onPress={() => openTaskModal(undefined)}>
              Add Task
            </Kitten.Button>
          </Kitten.Layout>

          <Kitten.List
            style={{ backgroundColor: themeContext.backgroundColor }}
            data={tasks}
            renderItem={({ item }) => _renderEditButton(item)}></Kitten.List>
          {_renderModal()}
          {_renderDeleteModal()}
        </Kitten.Layout>
      )}
    </>
  );
}

export default AddCategoryScreen;
