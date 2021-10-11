
import { logger, fileAsyncTransport } from "react-native-logs";
import RNFS from 'react-native-fs';


const config = {
    transport: fileAsyncTransport,
    transportOptions: {
        FS: RNFS,
        fileName: `imp-roll-logs.txt`,
        filePath: RNFS.DownloadDirectoryPath
    },
};


var rnLogger = logger.createLogger(config);

const logWarning = (log) => {
    console.log(log)
    rnLogger.warn(log)
}

const logDebug = (log) => {
    console.log(log)
    rnLogger.debug(log)
}

const logFatal = (log) => {
    rnLogger.error(log)
}

export { logWarning, logDebug, logFatal }