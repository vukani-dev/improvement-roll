import * as React from 'react';
import {ActivityIndicator} from 'react-native';
import Toast from 'react-native-simple-toast';
import {check, PERMISSIONS, RESULTS} from 'react-native-permissions';

import {ThemeContext} from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Kitten from '../utility_components/ui-kitten.component.js';

const SearchIcon = (props) => <Kitten.Icon {...props} name="search-outline" />;
const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;
const filterTypes = ['name', 'author', 'tag'];

export default ({route, navigation}) => {
  const themeContext = React.useContext(ThemeContext);
  const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

  const [searchString, setSearchString] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [fetchLoading, setFetchLoading] = React.useState(false);
  const [categories, setCategories] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [stopFetching, setStopFetching] = React.useState(false);

  const [searchModalVisible, setSearchModalVisible] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(
    new Kitten.IndexPath(0),
  );
  const displayValue = filterTypes[selectedIndex.row];

  const BackAction = () => (
    <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
  );

  const SearchAction = () => (
    <Kitten.TopNavigationAction
      icon={SearchIcon}
      onPress={() => setSearchModalVisible(true)}
    />
  );

  const renderItemAccessory = (props) => (
    <Kitten.Button size="tiny">FOLLOW</Kitten.Button>
  );

  const renderItemIcon = (props) => <Kitten.Icon {...props} name="person" />;

  const renderItem = ({item, index}) => (
    <Kitten.ListItem
      title={`${item.category.name} ${index + 1}`}
      description={`${item.category.description} ${index + 1}`}
      accessoryLeft={renderItemIcon}
      accessoryRight={renderItemAccessory}
    />
  );

  const renderSearchModal = () => {
    return (
      <Kitten.Modal
        transparent={true}
        visible={searchModalVisible}
        backdropStyle={styleSheet.modal_backdrop}
        onBackdropPress={() => setSearchModalVisible(false)}>
        {/* <Kitten.Layout style={styleSheet.search_modal}> */}
        <Kitten.Layout
          style={{
            flex: 1,
            margin: 30,
            marginBottom: 100,
            borderRadius: 20,
            padding: 25,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}>


          <Kitten.Layout
            style={{
              flex: 0.25,
              flexDirection: 'row',
              marginBottom: 10,
            }}>
            <Kitten.Text>Filter By</Kitten.Text>
            <Kitten.Select
              style={{width: 170}}
              selectedIndex={selectedIndex}
              onSelect={(index) => setSelectedIndex(index)}
              value={displayValue}>
              <Kitten.SelectItem title="Name" />
              <Kitten.SelectItem title="Author" />
              <Kitten.SelectItem title="Tag" />
            </Kitten.Select>
          </Kitten.Layout>


          <Kitten.Layout
            style={{
              flex: 0.25,
              marginBottom: 10,
            }}>
            <Kitten.Input
              value={searchString}
              placeholder="Keyword"
              // accessoryRight={SearchIcon}
              keyboardType={'visible-password'}
              secureTextEntry={true}
              onChangeText={(nextValue) => setSearchString(nextValue)}
            />
          </Kitten.Layout>


          <Kitten.Layout style={{flex:0.25,marginBottom:10}} >


          </Kitten.Layout>
          <Kitten.Layout style={{flex:0.25,marginBottom:10}} >


          <Kitten.Button>Apply Filter</Kitten.Button>
          </Kitten.Layout>
        </Kitten.Layout>
      </Kitten.Modal>
    );
  };

  const handleOnEndReached = () => {
    if (!stopFetching) {
      setFetchLoading(true);
      fetch(`http://192.168.1.236:3000?page=${page + 1}`, {
        method: 'GET',
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson.sharedCategories);
          setCategories([...categories, ...responseJson.sharedCategories]);
          setPage(responseJson.page);
          if (responseJson.page == responseJson.totalPages) {
            setStopFetching(true);
          }
          setFetchLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setFetchLoading(false);
        });
    }
  };

  React.useEffect(() => {
    fetch(`http://192.168.1.236:3000?page=${page}`, {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson.sharedCategories);
        setCategories(responseJson.sharedCategories);
        setPage(responseJson.page);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <Kitten.Layout
      style={{
        flex: 1,
        backgroundColor: themeContext.backgroundColor,
        padding: 10,
      }}>
      <Kitten.TopNavigation
        alignment="center"
        style={{backgroundColor: themeContext.backgroundColor}}
        title="Community Categories"
        accessoryLeft={BackAction}
        accessoryRight={SearchAction}
      />
      {loading ? (
        <Kitten.Layout style={styleSheet.loading_container}>
          <ActivityIndicator
            style={{alignSelf: 'center'}}
            size="large"
            color="#800"
            animating={loading}
          />
        </Kitten.Layout>
      ) : (
        <Kitten.Layout style={{flex: 1}}>
          <Kitten.List
            data={categories}
            renderItem={renderItem}
            onEndReached={handleOnEndReached}
            onEndReachedThreshold={0.01}
            style={{paddingBottom: 30}}
          />
          {fetchLoading ? (
            <ActivityIndicator
              style={{alignSelf: 'center'}}
              size="large"
              color="#800"
              animating={fetchLoading}
            />
          ) : null}
        </Kitten.Layout>
      )}

      {renderSearchModal()}
    </Kitten.Layout>
  );
};
