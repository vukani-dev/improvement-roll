import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-simple-toast';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import * as Kitten from '../utility_components/ui-kitten.component.js';
import * as logger from '../utility_components/logging.component.js';

import * as logger from '../utility_components/logging.component.js';

const SearchIcon = (props) => <Kitten.Icon {...props} name="search-outline" />;
const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;
const filterTypes = ['name', 'author', 'tag'];
const searchTypes = ['search', 'author', 'tags'];
const shareServiceURL = "https://starfish-app-imisr.ondigitalocean.app/";

export default ({ route, navigation }) => {
    const themeContext = React.useContext(ThemeContext);
    const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

    const [searchString, setSearchString] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [filterToggle, setFilterToggle] = React.useState(false);
    const [fetchLoading, setFetchLoading] = React.useState(false);
    const [categories, setCategories] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [stopFetching, setStopFetching] = React.useState(false);

    const [timer, setTimer] = React.useState(null)

    const [searchModalVisible, setSearchModalVisible] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(
        new Kitten.IndexPath(0),
    );
    const displayValue = filterTypes[selectedIndex.row];
    const searchValue = searchTypes[selectedIndex.row];

    const BackAction = () => (
        <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
    );

    const SearchAction = () => (
        <Kitten.TopNavigationAction
            icon={SearchIcon}
            onPress={() => setFilterToggle(!filterToggle)}
        />
    );

    const categorySelected = (category) => {
        //console.log(category.category)
        logger.logDebug(category.category)
        navigation.navigate('AddCategory', { category: category.category, mode: 'import' })
    };

    const renderItemHeader = (item) => (
        <View >
            <Kitten.Text category='h6'

                style={{ margin: 5 }}
            >
                {item.category.name}
            </Kitten.Text>
        </View>
    );

    const renderItemFooter = (item) => (
        <View>
            <Kitten.Text
                style={{ margin: 5 }}
            >
                By: {item.author}
            </Kitten.Text>
            <Kitten.Text
                style={{ margin: 5 }}
            >
                Tags: {item.tags.join(', ')}
                {/* <Kitten.Button onPress={() => importCategory(item)} size="tiny">IMPORT</Kitten.Button> */}
            </Kitten.Text>
        </View>
    );
    const renderItem = (item) => (
        <Kitten.Card
            style={{ margin: 10 }}
            status='success'
            header={() => renderItemHeader(item)}
            footer={() => renderItemFooter(item)}
            onPress={() => categorySelected(item)}
        >
            <Kitten.Text>
                {item.category.description}
            </Kitten.Text>
        </Kitten.Card>
    );

    const renderSearchModal = () => {
        return (
            <Kitten.Modal
                isVisible={searchModalVisible}
                animationType={'slide'}
                onBackdropPress={() => setSearchModalVisible(false)}
                avoidKeyboard={false}
                style={{
                    justifyContent: 'center',
                    margin: 30
                }}
            >
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
                        <Kitten.Text style={{ marginTop: 10 }}>Filter By</Kitten.Text>
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


                    <Kitten.Layout style={{ flex: 0.25, marginBottom: 10 }} >


                    </Kitten.Layout>
                    <Kitten.Layout style={{ flex: 0.25, marginBottom: 10 }} >


                        <Kitten.Button>Apply Filter</Kitten.Button>
                    </Kitten.Layout>
                </Kitten.Layout>

            </Kitten.Modal>
        );
    };

    const handleServiceError = (error) => {
        logger.logFatal(`Failure to Retrieve community categories: ${error}`);
        setFetchLoading(false);
        setLoading(false);
        Toast.show("Community categories are unreachable, please try again later", 5);
    }

    const handleOnEndReached = () => {
        if (!stopFetching) {
            setFetchLoading(true);
            var url = `${shareServiceURL}?page=${page + 1}`
            if (searchString != '') {
                url = url + `&${searchValue}=${searchString}`
            }
            fetch(url
                , { method: 'GET', })
                .then((response) => response.json())
                .then((responseJson) => {
                    if (responseJson.sharedCategories == null) {
                        setFetchLoading(false)
                        return;
                    }
                    setCategories([...categories, ...responseJson.sharedCategories]);
                    setPage(responseJson.page);
                    if (responseJson.page == responseJson.totalPages) {
                        setStopFetching(true);
                    }
                    setFetchLoading(false);
                })
                .catch((error) => {
                    handleServiceError(error)
                });
        }
    };

    const filter = (text) => {
        setSearchString(text)

        clearTimeout(timer)
        const newTimer = setTimeout(() => {
            //console.log(`Filtering categories. Searching for ${searchValue} with the string ${text}`)
            logger.logDebug(`Filtering categories. Searching for ${searchValue} with the string ${text}`)

            fetch(`${shareServiceURL}?page=1&${searchValue}=${text}`
                , { method: 'GET', })
                .then((response) => response.json())
                .then((responseJson) => {
                    setCategories(responseJson.sharedCategories);
                    setPage(responseJson.page);
                    setLoading(false);
                })
                .catch((error) => {
                    handleServiceError(error)
                });
        }, 400)

        setTimer(newTimer)
    }

    React.useEffect(() => {
        fetch(`${shareServiceURL}?page=${page}`
            , { method: 'GET', })
            .then((response) => response.json())
            .then((responseJson) => {
                setCategories(responseJson.sharedCategories);
                setPage(responseJson.page);
                setLoading(false);
            })
            .catch((error) => {
                handleServiceError(error)
            });
    }, []);

    return (
        <Kitten.Layout
            style={{
                flex: 1,
                backgroundColor: themeContext.backgroundColor,
                // padding: 10,
            }}>
            <Kitten.TopNavigation
                alignment="center"
                style={{ backgroundColor: themeContext.backgroundColor }}
                title="Community Categories"
                accessoryLeft={BackAction}
                accessoryRight={SearchAction}
            />
            {filterToggle ? (

                <Kitten.Layout
                    style={{ flexDirection: 'row' }}
                >
                    <Kitten.Input style={{ marginLeft: 10, flex: 1, marginRight: 10 }}
                        onChangeText={(text) => filter(text)}
                    >

                    </Kitten.Input>

                    <Kitten.Select
                        style={{ width: 170 }}
                        selectedIndex={selectedIndex}
                        onSelect={(index) => setSelectedIndex(index)}
                        value={displayValue}>
                        <Kitten.SelectItem title="Name" />
                        <Kitten.SelectItem title="Author" />
                        <Kitten.SelectItem title="Tag" />
                    </Kitten.Select>
                </Kitten.Layout>
            ) : <></>}
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
                <Kitten.Layout style={{
                    flex: 1, backgroundColor:
                        themeContext.theme === 'dark' ? '#1A2138' : '#FFFFEE'
                }}>
                    <Kitten.List
                        data={categories}
                        renderItem={({ item }) => renderItem(item)}

                        onEndReached={handleOnEndReached}
                        onEndReachedThreshold={0.009}
                        style={{
                            flex: 1,
                            paddingBottom: 30, backgroundColor:
                                themeContext.theme === 'dark' ? '#1A2138' : '#FFFFEE',
                        }}
                    />
                    {fetchLoading ? (
                        <ActivityIndicator
                            style={{
                                alignSelf: 'center', backgroundColor:
                                    themeContext.theme === 'dark' ? '#1A2138' : '#FFFFEE'
                            }}
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
