import * as React from 'react';
import { ActivityIndicator } from 'react-native';

import { Text, Button, Icon, Layout } from '@ui-kitten/components';

import { ThemeContext } from '../utility_components/theme-context';

const RollResultScreen = ({ route, navigation }) => {
  const tasks = route.params.tasks;
  const [lastRolledTask, setLastRolledTask] = React.useState({});
  const [loading, setLoading] = React.useState(true);

  const themeContext = React.useContext(ThemeContext);

  const rollAndPickTask = (tasks) => {
    var randomIndex = Math.floor(Math.random() * tasks.length);
    return tasks[randomIndex];
  };
  React.useEffect(() => {
    setTimeout(() => {
      var selectedTask = rollAndPickTask(tasks);
      setLastRolledTask(selectedTask);
      setLoading(false);
    }, 2000);
  }, []);

  const reRoll = () => {
    setLoading(true);
    setTimeout(() => {
      if (tasks.length > 1) {
        var filteredTasks = tasks.filter((e) => e.name != lastRolledTask.name);
        setLastRolledTask(rollAndPickTask(filteredTasks));
        setLoading(false);
      }
    }, 3000);
  };

  const renderRerollIcon = (props) => <Icon {...props} name="flip-2-outline" />;
  const homeIcon = (props) => <Icon {...props} name="home" />;

  return (
    <>
      {loading ? (
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
      ) : (
        <>
          <Layout
            style={{
              flex: 1,
              padding: 20,
              backgroundColor: themeContext.backgroundColor,
            }}>

            <Layout
              style={{
                flex: 0.25
              }}
            >
              <Text
                category="h3"
                style={{
                  fontWeight: 'bold',
                }}>
                {lastRolledTask.name}
              </Text>
            </Layout>

            <Layout
              style={{
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
                flex:0.25, 
                backgroundColor: themeContext.backgroundColor,
                marginHorizontal: 80
              }}>
              <Button
                accessoryLeft={renderRerollIcon}
                style={{ height:80}}
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
      )}
    </>
  );
};
export default RollResultScreen;
