import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { Text, Button, Icon, Layout } from '@ui-kitten/components';

import { ThemeContext } from '../utility_components/theme-context';

const RollResultScreen = ({ route, navigation }) => {
  const tasks = route.params.tasks;
  const [lastRolledTask, setLastRolledTask] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const themeContext = React.useContext(ThemeContext);

  // Memoize the random selection function to avoid unnecessary recalculations
  const rollAndPickTask = React.useCallback((taskList) => {
    const randomIndex = Math.floor(Math.random() * taskList.length);
    return taskList[randomIndex];
  }, []);
  
  // Load initial task only once
  React.useEffect(() => {
    const timerId = setTimeout(() => {
      const selectedTask = rollAndPickTask(tasks);
      setLastRolledTask(selectedTask);
      setLoading(false);
    }, 2000);
    
    // Clean up timer to prevent memory leaks
    return () => clearTimeout(timerId);
  }, [rollAndPickTask, tasks]);

  // Optimize reRoll to prevent unnecessary calculations
  const reRoll = React.useCallback(() => {
    // Don't attempt to roll if there are no tasks
    if (tasks.length === 0) return;
    
    setLoading(true);
    
    const timerId = setTimeout(() => {
      if (tasks.length > 1) {
        // Pre-filter tasks outside of setState callback for better performance
        const filteredTasks = tasks.filter((task) => task.name !== lastRolledTask.name);
        
        if (filteredTasks.length > 0) {
          setLastRolledTask(rollAndPickTask(filteredTasks));
        } else {
          setLastRolledTask(rollAndPickTask(tasks));
        }
      } else if (tasks.length === 1) {
        setLastRolledTask(tasks[0]);
      }
      
      setLoading(false);
    }, 1000);
    
    // Clean up timer to prevent memory leaks
    return () => clearTimeout(timerId);
  }, [lastRolledTask.name, rollAndPickTask, tasks]);

  // Memoize icon components to prevent unnecessary re-renders
  const renderRerollIcon = React.useCallback((props) => 
    <Icon {...props} name="flip-2-outline" />, []);
    
  const homeIcon = React.useCallback((props) => 
    <Icon {...props} name="home" />, []);

  // Memoize the loading view to prevent unnecessary re-renders
  const loadingView = React.useMemo(() => (
    <Layout
      style={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: themeContext.backgroundColor,
      }}>
      <ActivityIndicator
        style={{ alignSelf: 'center' }}
        size="large"
        color="#800"
        animating={loading}
      />
    </Layout>
  ), [loading, themeContext.backgroundColor]);

  // Memoize the content view to prevent unnecessary re-renders
  const contentView = React.useMemo(() => (
    <>
      <Layout
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: themeContext.backgroundColor,
        }}>

        <Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
            flex: 0.25
          }}
        >
          <Text
            category="h3"
            style={{
              backgroundColor: themeContext.backgroundColor,
              fontWeight: 'bold',
            }}>
            {lastRolledTask.name}
          </Text>
        </Layout>

        <Layout
          style={{
            backgroundColor: themeContext.backgroundColor,
            flex: 0.35
          }}
        >
          <Text
            category="h6"
            style={{
              textAlign: 'center',
              backgroundColor: themeContext.backgroundColor,
            }}>
            {lastRolledTask.desc}
          </Text>

        </Layout>
        <Layout
          style={{
            flex: 0.25,
            backgroundColor: themeContext.backgroundColor,
            marginHorizontal: 80
          }}>
          <Button
            accessoryLeft={renderRerollIcon}
            style={{ height: 80 }}
            onPress={reRoll}>
            Re-roll
          </Button>
        </Layout>
      </Layout>

      <Layout
        style={{
          flex: 0.1,
          padding: 30,
          backgroundColor: themeContext.backgroundColor,
        }}>
        <Button
          style={{ marginHorizontal: 60 }}
          accessoryLeft={homeIcon}
          title="Home"
          onPress={navigation.popToTop}>
          Home
        </Button>
      </Layout>
    </>
  ), [lastRolledTask, themeContext.backgroundColor, renderRerollIcon, reRoll, homeIcon, navigation.popToTop]);

  return (
    <>
      {loading ? loadingView : contentView}
    </>
  );
};

export default React.memo(RollResultScreen);
