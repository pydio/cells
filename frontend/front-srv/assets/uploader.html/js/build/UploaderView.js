'use strict';

(function (global) {

    var DropUploader = React.createClass({
        displayName: 'DropUploader',

        propTypes: {
            onDismiss: React.PropTypes.func
        },

        getInitialState: function getInitialState() {
            return {};
        },

        onDrop: function onDrop(files) {
            var contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleDropEventResults(null, files, contextNode);
        },

        onFolderPicked: function onFolderPicked(files) {
            var contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleFolderPickerResult(files, contextNode);
        },

        start: function start(e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().processNext();
        },
        clear: function clear(e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().clearAll();
        },
        toggleOptions: function toggleOptions(e) {
            if (e.preventDefault) e.preventDefault();
            var crtOptions = this.state && this.state.options ? this.state.options : false;
            this.setState({
                options: !crtOptions,
                optionsAnchorEl: e.currentTarget
            });
        },

        openFilePicker: function openFilePicker(e) {
            e.preventDefault();
            this.refs.dropzone.open();
        },

        openFolderPicker: function openFolderPicker(e) {
            e.preventDefault();
            this.refs.dropzone.openFolderPicker();
        },

        render: function render() {

            var optionsEl = undefined;
            var messages = global.pydio.MessageHash;
            var connectDropTarget = this.props.connectDropTarget || function (c) {
                return c;
            };
            var options = this.state.options;

            var dismiss = (function (e) {
                this.toggleOptions(e);
                if (UploaderModel.Configs.getInstance().getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true)) {
                    UploaderModel.Store.getInstance().processNext();
                }
            }).bind(this);
            optionsEl = React.createElement(UploadOptionsPane, { open: options, anchorEl: this.state.optionsAnchorEl, onDismiss: dismiss });

            var folderButton = undefined,
                startButton = undefined;
            var e = global.document.createElement('input');
            e.setAttribute('type', 'file');
            if ('webkitdirectory' in e) {
                folderButton = React.createElement(ReactMUI.RaisedButton, { style: { marginRight: 10 }, label: messages['html_uploader.5'], onClick: this.openFolderPicker });
            }
            e = null;
            var configs = UploaderModel.Configs.getInstance();
            if (!configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true)) {
                startButton = React.createElement(ReactMUI.FlatButton, { style: { marginRight: 10 }, label: messages['html_uploader.11'], onClick: this.start, secondary: true });
            }
            return connectDropTarget(React.createElement(
                'div',
                { style: { position: 'relative', padding: '10px' } },
                React.createElement(
                    MaterialUI.Toolbar,
                    { style: { backgroundColor: '#fff' } },
                    React.createElement(
                        'div',
                        { style: { display: 'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%' } },
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', marginLeft: '-48px' } },
                            React.createElement(MaterialUI.RaisedButton, { secondary: true, style: { marginRight: 10 }, label: messages['html_uploader.4'], onClick: this.openFilePicker }),
                            folderButton,
                            startButton,
                            React.createElement(MaterialUI.FlatButton, { label: messages['html_uploader.12'], style: { marginRight: 10 }, onClick: this.clear })
                        ),
                        React.createElement(
                            'div',
                            { style: { display: 'flex', alignItems: 'center', marginRight: '-48px' } },
                            React.createElement(MaterialUI.FlatButton, { style: { float: 'right' }, label: messages['html_uploader.22'], onClick: this.toggleOptions })
                        )
                    )
                ),
                React.createElement(
                    PydioForm.FileDropZone,
                    {
                        className: 'transparent-dropzone',
                        ref: 'dropzone',
                        multiple: true,
                        enableFolders: true,
                        supportClick: false,
                        ignoreNativeDrop: true,
                        onDrop: this.onDrop,
                        onFolderPicked: this.onFolderPicked,
                        style: { width: '100%', height: 300 }
                    },
                    React.createElement(TransfersList, { onDismiss: this.props.onDismiss })
                ),
                optionsEl
            ));
        }

    });

    DropUploader = Pydio.requireLib('hoc').dropProvider(DropUploader);

    var TransferFile = React.createClass({
        displayName: 'TransferFile',

        propTypes: {
            item: React.PropTypes.object.isRequired,
            className: React.PropTypes.string
        },

        componentDidMount: function componentDidMount() {
            this.props.item.observe('progress', (function (value) {
                this.setState({ progress: value });
            }).bind(this));
            this.props.item.observe('status', (function (value) {
                this.setState({ status: value });
            }).bind(this));
        },

        getInitialState: function getInitialState() {
            return {
                progress: this.props.item.getProgress(),
                status: this.props.item.getStatus()
            };
        },

        abortTransfer: function abortTransfer() {
            UploaderModel.Store.getInstance().stopOrRemoveItem(this.props.item);
        },

        render: function render() {
            var style = undefined,
                relativeMessage = undefined;
            var messageIds = {
                "new": 433,
                "loading": 434,
                "loaded": 435,
                "error": 436
            };
            var statusMessage = this.props.item.getStatus();
            var stopButton = undefined;
            if (statusMessage === 'loading') {
                stopButton = React.createElement('span', { className: 'stop-button icon-stop', onClick: this.abortTransfer });
            } else {
                stopButton = React.createElement('span', { className: 'stop-button mdi mdi-close', onClick: this.abortTransfer });
            }
            if (statusMessage === 'error' && this.props.item.getErrorMessage()) {
                statusMessage = this.props.item.getErrorMessage();
            }
            if (global.pydio.MessageHash[messageIds[statusMessage]]) {
                statusMessage = global.pydio.MessageHash[messageIds[statusMessage]];
            }
            if (this.props.item.getRelativePath()) {
                relativeMessage = React.createElement(
                    'span',
                    { className: 'path' },
                    this.props.item.getRelativePath()
                );
            }
            if (this.state && this.state.progress) {
                style = { width: this.state.progress + '%' };
            }
            return React.createElement(
                'div',
                { className: "file-row upload-" + this.props.item.getStatus() + " " + (this.props.className ? this.props.className : "") },
                React.createElement('span', { className: 'mdi mdi-file' }),
                ' ',
                this.props.item.getFile().name,
                relativeMessage,
                React.createElement(
                    'span',
                    { className: 'status' },
                    statusMessage
                ),
                stopButton,
                React.createElement('div', { className: 'uploader-pgbar', style: style })
            );
        }
    });

    var TransferFolder = React.createClass({
        displayName: 'TransferFolder',

        propTypes: {
            item: React.PropTypes.object.isRequired
        },

        render: function render() {
            var statusMessage = undefined;
            if (this.props.item.getStatus() === 'loaded') {
                statusMessage = global.pydio.MessageHash['html_uploader.13'];
            }
            return React.createElement(
                'div',
                { className: "folder-row upload-" + this.props.item.getStatus() + " " + (this.props.className ? this.props.className : "") },
                React.createElement('span', { className: 'mdi mdi-folder' }),
                ' ',
                this.props.item.getPath(),
                ' ',
                React.createElement(
                    'span',
                    { className: 'status' },
                    statusMessage
                )
            );
        }
    });

    var TransfersList = React.createClass({
        displayName: 'TransfersList',

        propTypes: {
            onDismiss: React.PropTypes.func
        },

        componentDidMount: function componentDidMount() {
            var store = UploaderModel.Store.getInstance();
            this._storeObserver = (function () {
                if (!this.isMounted()) return;
                this.setState({ items: store.getItems() });
            }).bind(this);
            store.observe("update", this._storeObserver);
            store.observe("auto_close", (function () {
                if (this.props.onDismiss) {
                    this.props.onDismiss();
                }
            }).bind(this));
            this.setState({ items: store.getItems() });
        },

        componentWillUnmount: function componentWillUnmount() {
            if (this._storeObserver) {
                UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
                UploaderModel.Store.getInstance().stopObserving("auto_close");
            }
        },

        renderSection: function renderSection(accumulator, items) {
            var title = arguments.length <= 2 || arguments[2] === undefined ? "" : arguments[2];
            var className = arguments.length <= 3 || arguments[3] === undefined ? "" : arguments[3];

            if (title && items.length) {
                accumulator.push(React.createElement(
                    'div',
                    { className: className + " header" },
                    title
                ));
            }
            items.sort(function (a, b) {
                var aType = a instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                var bType = b instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                if (aType === bType) {
                    return 0;
                } else {
                    return aType === 'folder' ? -1 : 1;
                }
            });
            items.forEach(function (f) {
                if (f instanceof UploaderModel.FolderItem) {
                    accumulator.push(React.createElement(TransferFolder, { key: f.getId(), item: f, className: className }));
                } else {
                    accumulator.push(React.createElement(TransferFile, { key: f.getId(), item: f, className: className }));
                }
            });
        },

        render: function render() {
            var items = [];
            if (this.state && this.state.items) {
                this.renderSection(items, this.state.items.processing, global.pydio.MessageHash['html_uploader.14'], 'section-processing');
                this.renderSection(items, this.state.items.pending, global.pydio.MessageHash['html_uploader.15'], 'section-pending');
                this.renderSection(items, this.state.items.errors, global.pydio.MessageHash['html_uploader.23'], 'section-errors');
                this.renderSection(items, this.state.items.processed, global.pydio.MessageHash['html_uploader.16'], 'section-processed');
            }
            return React.createElement(
                'div',
                { id: 'upload_files_list', style: { height: '100%' }, className: UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : '' },
                items
            );
        }
    });

    var UploadOptionsPane = React.createClass({
        displayName: 'UploadOptionsPane',

        propTypes: {
            open: React.PropTypes.boolean,
            anchorEl: React.PropTypes.string,
            onDismiss: React.PropTypes.func.isRequired
        },

        getInitialState: function getInitialState() {
            var configs = UploaderModel.Configs.getInstance();
            return {
                configs: configs
            };
        },

        updateField: function updateField(fName, event) {
            if (fName === 'autostart') {
                var toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true);
                toggleStart = !toggleStart;
                this.state.configs.updateOption('upload_auto_send', toggleStart, true);
            } else if (fName === 'autoclose') {
                var toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close', true);
                toggleStart = !toggleStart;
                this.state.configs.updateOption('upload_auto_close', toggleStart, true);
            } else if (fName === 'existing') {
                this.state.configs.updateOption('upload_existing', event.target.getSelectedValue());
            } else if (fName === 'show_processed') {
                var toggleShowProcessed = this.state.configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
                toggleShowProcessed = !toggleShowProcessed;
                this.state.configs.updateOption('upload_show_processed', toggleShowProcessed, true);
            }
            this.setState({ random: Math.random() });
        },

        radioChange: function radioChange(e, newValue) {
            this.state.configs.updateOption('upload_existing', newValue);
            this.setState({ random: Math.random() });
        },

        render: function render() {

            var maxUploadMessage = undefined;
            if (!global.pydio.getPluginConfigs('mq').get('UPLOAD_ACTIVE')) {
                var maxUpload = this.state.configs.getOption('UPLOAD_MAX_SIZE');
                maxUploadMessage = global.pydio.MessageHash[282] + ': ' + PathUtils.roundFileSize(maxUpload, '');
                maxUploadMessage = React.createElement(
                    'div',
                    { className: 'option-row' },
                    maxUploadMessage
                );
            }
            var toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
            var toggleClose = this.state.configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close');
            var toggleShowProcessed = this.state.configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
            var overwriteType = this.state.configs.getOption('DEFAULT_EXISTING', 'upload_existing');

            return React.createElement(
                MaterialUI.Popover,
                {
                    open: this.props.open,
                    anchorEl: this.props.anchorEl,
                    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: this.props.onDismiss
                },
                React.createElement(
                    MaterialUI.List,
                    { style: { width: 260 } },
                    React.createElement(MaterialUI.ListItem, { primaryText: global.pydio.MessageHash[337], rightToggle: React.createElement(MaterialUI.Toggle, { toggled: toggleStart, defaultToggled: toggleStart, onToggle: this.updateField.bind(this, 'autostart') }) }),
                    React.createElement(MaterialUI.ListItem, { primaryText: global.pydio.MessageHash[338], rightToggle: React.createElement(MaterialUI.Toggle, { toggled: toggleClose, onToggle: this.updateField.bind(this, 'autoclose') }) }),
                    React.createElement(MaterialUI.ListItem, { primaryText: global.pydio.MessageHash['html_uploader.17'], rightToggle: React.createElement(MaterialUI.Toggle, { toggled: toggleShowProcessed, onToggle: this.updateField.bind(this, 'show_processed') }) }),
                    React.createElement(MaterialUI.Divider, null),
                    React.createElement(
                        MaterialUI.Subheader,
                        null,
                        global.pydio.MessageHash['html_uploader.18']
                    ),
                    React.createElement(
                        MaterialUI.ListItem,
                        { disabled: true, style: { paddingTop: 0 } },
                        React.createElement(
                            MaterialUI.RadioButtonGroup,
                            { ref: 'group', name: 'shipSpeed', defaultSelected: overwriteType, onChange: this.radioChange },
                            React.createElement(MaterialUI.RadioButton, { value: 'alert', label: global.pydio.MessageHash['html_uploader.19'], style: { paddingBottom: 8 } }),
                            React.createElement(MaterialUI.RadioButton, { value: 'rename', label: global.pydio.MessageHash['html_uploader.20'], style: { paddingBottom: 8 } }),
                            React.createElement(MaterialUI.RadioButton, { value: 'overwrite', label: global.pydio.MessageHash['html_uploader.21'] })
                        )
                    )
                )
            );
        }

    });

    global.UploaderView = {
        DropUploader: DropUploader,
        TransferFile: TransferFile,
        TransfersList: TransfersList,
        TransferFolder: TransferFolder
    };
})(window);
