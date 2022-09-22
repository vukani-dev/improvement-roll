
import * as K from '../utility_components/ui-kitten.component.js';
import * as React from 'react';

const BackIcon = (props) => <K.Icon {...props} name="arrow-back" />;
const CautionIcon = (props) => (
    <K.Icon name="alert-triangle-outline" {...props} />
);
const ImportIcon = (props) => (
    <K.Icon name="arrow-downward-outline" {...props} />
);
const ExportIcon = (props) => (
    <K.Icon name="arrow-upward-outline" {...props} />
);
const OctoIcon = (props) => <K.Icon name="github-outline" {...props} />;
const DebugIcon = (props) => <K.Icon name="book-outline" {...props} />;


const RollIcon = (props) => <K.Icon name="flip-outline" {...props} />;
const ListIcon = (props) => <K.Icon name="list-outline" {...props} />;
const SettingsIcon = (props) => <K.Icon name="settings-2-outline" {...props} />;
const GlobeIcon = (props) => <K.Icon name="globe-outline" {...props} />;

const SaveIcon = (props) => <K.Icon {...props} name="save" />;
const TrashIcon = (props) => <K.Icon {...props} name="trash" />;
const AddIcon = (props) => (
    <K.Icon {...props} name="plus-circle-outline" />
);

export {
    BackIcon, CautionIcon, ImportIcon, ExportIcon,
    OctoIcon, DebugIcon, RollIcon, ListIcon, SettingsIcon, GlobeIcon,
    SaveIcon, TrashIcon, AddIcon
}