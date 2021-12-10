import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import Toast from 'react-native-simple-toast';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Kitten from '../utility_components/ui-kitten.component.js';

const SearchIcon = (props) => (
    <Kitten.Icon {...props} name='search-outline' />
);
const BackIcon = (props) => <Kitten.Icon {...props} name="arrow-back" />;

export default ({ route, navigation }) => {
    const themeContext = React.useContext(ThemeContext);
    const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

    const [searchString, setSearchString] = React.useState('');
    const [loading, setLoading] = React.useState(true);
    const [categories, setCategories] = React.useState([]);
    const [page, setPage] = React.useState(1);


    const BackAction = () => (
        <Kitten.TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
    );

    React.useEffect(() => {
        fetch('http://10.0.2.2:3000', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                // console.log(responseJson.sharedCategories[0]);
                setCategories(responseJson.sharedCategories)
                setPage(responseJson.page)
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });
    }, [])


    return (
        <Kitten.Layout style={{ flex: 1, backgroundColor: themeContext.backgroundColor }}>
            <Kitten.TopNavigation
                alignment="center"
                style={{ backgroundColor: themeContext.backgroundColor }}
                title='Community Categories'
                accessoryLeft={BackAction}
            />
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
                <Kitten.Text>
                    {page}
                </Kitten.Text>
            )}


            {/* <Kitten.Input
            value={searchString}
            placeholder='Search'
            accessoryRight={SearchIcon}
            keyboardType={'visible-password'}
            secureTextEntry={true}
            onChangeText={nextValue => setSearchString(nextValue)}
        /> */}

        </Kitten.Layout>
    )
}