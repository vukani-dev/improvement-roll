import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { Jiro } from 'react-native-textinput-effects';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import * as Kitten from '../utility_components/ui-kitten.component.js';
import * as Icons from '../utility_components/icon.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-simple-toast';

import Modal from "react-native-modal";


function AddCategoryScreen({ route, navigation }) {
  const [allCategories, setAllCategories] = React.useState([]);
  const [categoryName, setCategoryName] = React.useState('');
  const [originalCategoryName, setOriginalCategoryName] = React.useState('');
  const [categoryDesc, setCategoryDesc] = React.useState('');

  const [categoryMode, setCategoryMode] = React.useState('');
  const [title, setTitle] = React.useState('');

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
          icon={Icons.TrashIcon}
          onPress={() => _removeCategory()}
        />
      ) : null}
      <Kitten.TopNavigationAction
        style={{ marginLeft: 20 }}
        icon={categoryMode == 'import' ? Icons.ImportIcon : Icons.SaveIcon}
        onPress={() => _categoryComplete()}
      />
    </React.Fragment>
  );
  React.useEffect(() => {

    AsyncStorage.getItem('categories').then((value) => {
      var categories = value != null ? JSON.parse(value) : [];
      setAllCategories(categories)
    })
    setLoading(true);
    setCategoryMode('new');
    setTitle('Creating a Category...')

    if (route.params != undefined) {
      var category = route.params.category;
      for (var i = 0; i < category.tasks.length; i++) {
        category.tasks[i].key = i;
      }
      setTasks(category.tasks);
      setCategoryName(category.name);
      setOriginalCategoryName(category.name);
      setTimeSensitive(category.timeSensitive);
      setCategoryDesc(category.description);

      if (route.params.mode != undefined) {
        setCategoryMode(route.params.mode);
        if (route.params.mode == 'edit') {
          setTitle('Editing a Category...')
        }
        if (route.params.mode == 'import') {
          setTitle('Importing a Category...')
        }
      }
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }

    return () => {
      console.log('unmounted');
    };
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
      var newTask = { Id: tasks.length };
      if (timeSensitive) newTask.minutes = '';

      setTask(newTask);
      setTaskMode('new');
    } else {
      setTask(item);
      setTaskMode('edit');
    }
    setModalVisible(true);
  };

  const saveTask = () => {
    if (taskMode == 'new') {
      setTasks((tasks) => [...tasks, task]);
    } else {
      setTasks((tasks) => tasks.map((el) => (el.key === task.key ? task : el)));
    }
    setModalVisible(false);
  };

  const _saveCategoryList = (categoryList, action, catName) => {
    try {
      const jsonValue = JSON.stringify(categoryList);
      AsyncStorage.setItem('categories', jsonValue).then((value) => {
        navigation.navigate('Main', {
          categoryName: catName,
          action: action,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  const getUniqueName = (name) => {
    var newName = `${name}`
    // sort categories alphebetically
    allCategories.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    var instance = 1;
    for (var i = 0; i < allCategories.length; i++) {
      if (allCategories[i].name == newName) {
        if (instance > 1) {
          newName = newName.substring(0, newName.lastIndexOf('_'));
        }
        newName += `_${instance.toString()}`;
        instance++;
      }
    }
    return newName;
  }

  const _categoryComplete = async () => {
    var category = {
      name: categoryName,
      timeSensitive: timeSensitive,
      tasks: tasks,
      description: categoryDesc,
      key: Date.now(),
    };

    if (categoryMode != 'edit') {
      category.name = getUniqueName(categoryName);
    }
    else {
      for (var i = 0; i < allCategories.length; i++) {
        if (allCategories[i].name == category.name && category.name != originalCategoryName) {
          Toast.show(`The category name '${category.name}' already exists!`, 3)
          return;
        }
      }
    }

    var newCategoryList = allCategories.filter(obj => obj.name != category.name && obj.name != originalCategoryName)
    newCategoryList.push(category);

    var action = ''
    switch (categoryMode) {
      case 'new':
        action = 'created'
        break;
      case 'edit':
        action = 'saved'
        break;
      case 'import':
        action = 'imported'
        break;
    }

    _saveCategoryList(newCategoryList, action, category.name);
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
    _saveCategoryList(allCategories.filter(obj => obj.name != categoryName), 'removed', categoryName);
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
      <Modal
        animationType={'slide'}
        isVisible={deleteModalVisible}
        onBackdropPress={() => setDeleteModalVisible(false)}
        backdropStyle={styleSheet.modal_backdrop}>
        <Kitten.Layout style={styleSheet.modal_container}>
          <Kitten.Text>
            Are you sure you want to delete this category?
          </Kitten.Text>

          <Kitten.Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}
          >
            <Kitten.Button onPress={() => setDeleteModalVisible(false)}>
              No
            </Kitten.Button>
            <Kitten.Button onPress={() => _deleteCat()}>Yes</Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Modal>
    );
  };

  const _renderModal = () => {
    return (
      <Modal
        isVisible={modalVisible}
        animationType={'slide'}
        onBackdropPress={() => setModalVisible(false)}
        avoidKeyboard={false}
        style={{
          justifyContent: 'center',
          margin: 0,
          position: 'absolute'
        }}
      >

        <Kitten.Layout style={styleSheet.modal_container}>
          <Kitten.Input
            placeholder="Enter a task"
            value={task.name}
            secureTextEntry={true}
            keyboardType={'visible-password'}
            onChangeText={(text) =>
              setTask((task) => ({ ...task, name: text }))
            }></Kitten.Input>

          <Kitten.Input
            placeholder="Enter a description for the task"
            value={task.desc}
            numberOfLines={4}
            multiline={true}
            returnKeyLabel="done"
            secureTextEntry={true}
            keyboardType={'visible-password'}
            blurOnSubmit={true}
            onChangeText={(text) =>
              setTask((task) => ({ ...task, desc: text }))
            }></Kitten.Input>

          {timeSensitive ? (
            <Kitten.Layout style={{ padding: 10 }}>
              <Kitten.Text style={{ marginBottom: 10, fontWeight: 'bold' }}>About how long does it take to do this task?</Kitten.Text>
              <Kitten.Layout style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Kitten.Input
                  keyboardType='number-pad'
                  value={task.minutes == undefined ? '' : task.minutes.toString()}
                  onChangeText={(text) => setTask((task) => ({ ...task, minutes: Number(text) }))}
                ></Kitten.Input>
                <Kitten.Text style={{ marginTop: 10 }}>  minutes.</Kitten.Text>
              </Kitten.Layout>
            </Kitten.Layout>
          ) : null}

          <Kitten.Layout
            style={{
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              marginTop: 10,
            }}>
            <Kitten.Button onPress={() => setModalVisible(false)}>
              Cancel
            </Kitten.Button>
            <Kitten.Button
              onPress={() => saveTask()}
              accessoryRight={taskMode == 'new' ? Icons.AddIcon : Icons.SaveIcon}>
              {taskMode == 'new' ? 'Add Task' : 'Save Task'}
            </Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Modal>
    );
  };


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
          style={{ flex: 1, backgroundColor: themeContext.backgroundColor }}
        >
          <Kitten.TopNavigation
            alignment="center"
            style={{ backgroundColor: themeContext.backgroundColor }}
            title={title}
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
              marginLeft: 13,
              backgroundColor: themeContext.backgroundColor,
            }}>
            <Kitten.CheckBox
              style={{ alignSelf: 'center' }}
              checked={timeSensitive}
              onChange={setTimeSensitive}
            />
            <Kitten.Text style={{ margin: 20 }}>
              This category is split by time
            </Kitten.Text>
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
              accessoryLeft={Icons.AddIcon}
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
