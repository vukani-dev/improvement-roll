
import * as React from 'react';
import { Linking, ActivityIndicator } from 'react-native';
import * as K from '../utility_components/ui-kitten.component.js';
import * as Icons from '../utility_components/icon.component.js';
import * as logger from '../utility_components/logging.component.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemeContext } from '../utility_components/theme-context';
import StyleSheetFactory from '../utility_components/styles.js';
import { getVersion } from 'react-native-device-info';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

import BTCIcon from '../pictures/bitcoin-btc-logo.svg';
import ETHIcon from '../pictures/ethereum-eth-logo.svg';
import Toast from 'react-native-simple-toast';
export default ({ navigation }) => {

    const [resetModalVisible, setResetModalVisible] = React.useState(false);
    const [debugModalVisible, setDebugModalVisible] = React.useState(false);
    const [debugModeText, setDebugModeText] = React.useState(
        global.settings.debugMode ? 'Disable Debug Mode' : 'Enable Debug Mode',
    );
    const [loading, setLoading] = React.useState(false);
    const themeContext = React.useContext(ThemeContext);
    const styleSheet = StyleSheetFactory.getSheet(themeContext.backgroundColor);

    const BackAction = () => (
        <K.TopNavigationAction icon={Icons.BackIcon} onPress={navigation.goBack} />
    );
    const checkPermissions = (value) => {
        if (value) {
            check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((status) => {
                if (status != RESULTS.GRANTED) {
                    setLoading(true);
                    request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE).then((result) => {
                        if (result != RESULTS.GRANTED) {
                            Toast.show(
                                'You must grant write access to use this feature.',
                                5000,
                            );
                            setDebugModalVisible(false);
                            setLoading(false);
                            return;
                        }
                        setDebugging(value);
                    });
                } else {
                    setDebugging(value);
                }
            });
        } else {
            setDebugging(value);
        }
    };

    const setDebugging = (value) => {
        global.settings.debugMode = value;
        AsyncStorage.setItem('settings', JSON.stringify(global.settings)).then(
            () => {
                setDebugModalVisible(false);
                setDebugModeText(value ? 'Disable Debug Mode' : 'Enable Debug Mode');
                Toast.show(`Debug mode ${value ? 'enabled.' : 'disabled.'}`);
                setLoading(false);
            },
        );
    };


    const _renderResetModal = () => {
        return (
            <K.Modal
                transparent={true}
                visible={resetModalVisible}
                backdropStyle={styleSheet.modal_backdrop}
                onBackdropPress={() => setResetModalVisible(false)}>
                <K.Layout style={styleSheet.modal_container}>
                    <K.Layout
                        style={{
                            flex: 1,
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: 15,
                        }}>
                        <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                            This will clear all of your categories and re-add the "General"
                            category.
                        </K.Text>
                        <K.Text>Are you sure you want to do this?</K.Text>
                    </K.Layout>
                    <K.Layout
                        style={{
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10,
                            marginHorizontal: 70,
                        }}>
                        <K.Button onPress={() => setResetModalVisible(false)}>
                            No
                        </K.Button>
                        <K.Button onPress={() => clearData()}>Yes</K.Button>
                    </K.Layout>
                </K.Layout>
            </K.Modal>
        );
    };

    const _renderDebugModal = () => {
        return (
            <>
                {loading ? (
                    <K.Layout
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
                    </K.Layout>
                ) : (
                    <K.Modal
                        transparent={true}
                        visible={debugModalVisible}
                        backdropStyle={styleSheet.modal_backdrop}
                        onBackdropPress={() => setDebugModalVisible(false)}>
                        <K.Layout style={styleSheet.modal_container}>
                            <K.Layout
                                style={{
                                    flex: 1,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    padding: 15,
                                }}>
                                {_debugModalText(global.settings.debugMode)}
                                <K.Text>Are you sure you want to do this?</K.Text>
                            </K.Layout>
                            <K.Layout
                                style={{
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    marginTop: 10,
                                    marginHorizontal: 70,
                                }}>
                                <K.Button onPress={() => setDebugModalVisible(false)}>
                                    No
                                </K.Button>
                                <K.Button
                                    onPress={() => checkPermissions(!global.settings.debugMode)}>
                                    Yes
                                </K.Button>
                            </K.Layout>
                        </K.Layout>
                    </K.Modal>
                )}
            </>
        );
    };

    const _debugModalText = (debugMode) => (
        <K.Layout>
            {debugMode ? (
                <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                    This will disable Debug Mode.
                </K.Text>
            ) : (
                <K.Text style={{ textAlign: 'center', marginBottom: 10 }}>
                    This will enable logging on the app. Logs about crashes and warnings
                    will be saved to the Downloads folder with the name
                    "imp-roll-logs.txt"
                </K.Text>
            )}
        </K.Layout>
    );
    return (
        <K.Layout>
            <K.TopNavigation
                alignment="center"
                style={styleSheet.top_navigation}
                title={'Advanced Settings'}
                accessoryLeft={BackAction}
            />

            <K.Button
                style={{ marginBottom: 10 }}
                status="info"
                accessoryLeft={Icons.DebugIcon}
                onPress={() => setDebugModalVisible(true)}>
                {debugModeText}
            </K.Button>
            <K.Button
                status="warning"
                accessoryLeft={Icons.CautionIcon}
                onPress={() => setResetModalVisible(true)}>
                Reset Data
            </K.Button>

            {_renderResetModal()}
            {_renderDebugModal()}
        </K.Layout>
    )


}