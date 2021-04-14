import {View, StyleSheet, SafeAreaView} from 'react-native';
export default class StyleSheetFactory {
  static getSheet(themeBackgroundColor) {
    return StyleSheet.create({
      centered_container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: themeBackgroundColor,
      },
      columned_container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: themeBackgroundColor,
      },
      loading_container: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        backgroundColor: themeBackgroundColor,
      },
      modal_container: {
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
      },
      modal_backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
    });
  }
}
