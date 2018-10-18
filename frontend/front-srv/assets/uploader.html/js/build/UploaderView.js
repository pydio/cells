(function (global) {

    let DropUploader = React.createClass({

        propTypes: {
            onDismiss: React.PropTypes.func
        },

        getInitialState: function () {
            return {
                showOptions: false,
                configs: UploaderModel.Configs.getInstance()
            };
        },

        onDrop: function (files) {
            let contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleDropEventResults(null, files, contextNode);
        },

        onFolderPicked: function (files) {
            let contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleFolderPickerResult(files, contextNode);
        },

        start: function (e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().processNext();
        },
        clear: function (e) {
            e.preventDefault();
            UploaderModel.Store.getInstance().clearAll();
        },
        toggleOptions: function (e) {
            if (e.preventDefault) e.preventDefault();

            const { showOptions = false, currentTarget } = this.state;

            this.setState({
                showOptions: !showOptions,
                optionsAnchorEl: e.currentTarget
            });
        },

        openFilePicker: function (e) {
            e.preventDefault();
            this.refs.dropzone.open();
        },

        openFolderPicker: function (e) {
            e.preventDefault();
            this.refs.dropzone.openFolderPicker();
        },

        render: function () {

            let optionsEl;
            let messages = global.pydio.MessageHash;
            const connectDropTarget = this.props.connectDropTarget || (c => {
                return c;
            });
            const { configs, showOptions } = this.state;

            let dismiss = function (e) {
                this.toggleOptions(e);
            }.bind(this);

            optionsEl = React.createElement(UploadOptionsPane, { configs: configs, open: showOptions, anchorEl: this.state.optionsAnchorEl, onDismiss: dismiss });

            let folderButton, startButton;
            let e = global.document.createElement('input');
            e.setAttribute('type', 'file');
            if ('webkitdirectory' in e) {
                folderButton = React.createElement(ReactMUI.RaisedButton, { style: { marginRight: 10 }, label: messages['html_uploader.5'], onClick: this.openFolderPicker });
            }
            e = null;

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
                    React.createElement(TransfersList, {
                        autoStart: configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send'),
                        onDismiss: this.props.onDismiss
                    })
                ),
                optionsEl
            ));
        }
    });

    DropUploader = Pydio.requireLib('hoc').dropProvider(DropUploader);

    const TransferFile = React.createClass({

        propTypes: {
            item: React.PropTypes.object.isRequired,
            className: React.PropTypes.string
        },

        componentDidMount: function () {
            this.props.item.observe('progress', function (value) {
                this.setState({ progress: value });
            }.bind(this));
            this.props.item.observe('status', function (value) {
                this.setState({ status: value });
            }.bind(this));
        },

        getInitialState: function () {
            return {
                progress: this.props.item.getProgress(),
                status: this.props.item.getStatus()
            };
        },

        abortTransfer: function () {
            UploaderModel.Store.getInstance().stopOrRemoveItem(this.props.item);
        },

        render: function () {
            const { item, progress, className } = this.props;
            let style, relativeMessage;
            const messageIds = {
                "new": 433,
                "loading": 434,
                "loaded": 435,
                "error": 436
            };
            let statusMessage = item.getStatus();
            let stopButton;
            if (statusMessage === 'loading') {
                stopButton = React.createElement('span', { className: 'stop-button icon-stop', onClick: this.abortTransfer });
            } else if (statusMessage === 'error') {
                stopButton = React.createElement(
                    'span',
                    { style: { fontWeight: 500, marginBottom: 0, color: '#e53935' }, className: 'stop-button', onClick: () => {
                            item.process();
                        } },
                    'RETRY ',
                    React.createElement('span', { className: 'mdi mdi-restart' })
                );
            } else {
                stopButton = React.createElement('span', { className: 'stop-button mdi mdi-close', onClick: this.abortTransfer });
            }
            if (statusMessage === 'error' && item.getErrorMessage()) {
                statusMessage = item.getErrorMessage();
            }
            if (global.pydio.MessageHash[messageIds[statusMessage]]) {
                statusMessage = global.pydio.MessageHash[messageIds[statusMessage]];
            }
            if (item.getRelativePath()) {
                relativeMessage = React.createElement(
                    'span',
                    { className: 'path' },
                    item.getRelativePath()
                );
            }
            if (progress) {
                style = { width: progress + '%' };
            }
            return React.createElement(
                'div',
                { className: "file-row upload-" + item.getStatus() + " " + (className ? className : "") },
                React.createElement('span', { className: 'mdi mdi-file' }),
                ' ',
                item.getFile().name,
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

    const TransferFolder = React.createClass({

        propTypes: {
            item: React.PropTypes.object.isRequired
        },

        render: function () {
            let statusMessage;
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

    const TransfersList = React.createClass({

        propTypes: {
            autoStart: React.PropTypes.bool,
            showAll: React.PropTypes.bool,
            onDismiss: React.PropTypes.func
        },

        componentDidMount() {
            let store = UploaderModel.Store.getInstance();
            this._storeObserver = function () {
                if (!this.isMounted()) {
                    return;
                }
                this.setState({ items: store.getItems() });
            }.bind(this);
            store.observe("update", this._storeObserver);
            store.observe("auto_close", function () {
                if (this.props.onDismiss) {
                    this.props.onDismiss();
                }
            }.bind(this));
            this.setState({ items: store.getItems() });
        },

        componentWillReceiveProps(nextProps) {

            const { autoStart } = nextProps;
            const { items } = this.state;

            if (autoStart && items["pending"].length) {
                UploaderModel.Store.getInstance().processNext();
            }
        },

        componentWillUnmount() {
            if (this._storeObserver) {
                UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
                UploaderModel.Store.getInstance().stopObserving("auto_close");
            }
        },

        renderSection(accumulator, items, title = "", className = "") {
            const { showAll } = this.state;
            if (title && items.length) {
                accumulator.push(React.createElement(
                    'div',
                    { className: className + " header" },
                    title
                ));
            }
            items.sort(function (a, b) {
                let aType = a instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                let bType = b instanceof UploaderModel.FolderItem ? 'folder' : 'file';
                if (aType === bType) {
                    return 0;
                } else {
                    return aType === 'folder' ? -1 : 1;
                }
            });
            const limit = 50;
            const sliced = showAll ? items : items.slice(0, limit);
            sliced.forEach(function (f) {
                if (f instanceof UploaderModel.FolderItem) {
                    accumulator.push(React.createElement(TransferFolder, { key: f.getId(), item: f, className: className }));
                } else {
                    accumulator.push(React.createElement(TransferFile, { key: f.getId(), item: f, className: className }));
                }
            });
            if (!showAll && items.length > limit) {
                accumulator.push(React.createElement(
                    'div',
                    { style: { cursor: 'pointer' }, className: className, onClick: () => {
                            this.setState({ showAll: true });
                        } },
                    'And ',
                    items.length - limit,
                    ' more ...'
                ));
            }
        },

        render() {
            let items = [];
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

    const UploadOptionsPane = React.createClass({

        propTypes: {
            open: React.PropTypes.boolean,
            anchorEl: React.PropTypes.string,
            onDismiss: React.PropTypes.func.isRequired
        },

        updateField: function (fName, event) {

            const { configs } = this.props;

            if (fName === 'autostart') {
                let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true);
                toggleStart = !toggleStart;
                configs.updateOption('upload_auto_send', toggleStart, true);
            } else if (fName === 'autoclose') {
                let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close', true);
                toggleStart = !toggleStart;
                configs.updateOption('upload_auto_close', toggleStart, true);
            } else if (fName === 'existing') {
                configs.updateOption('upload_existing', event.target.getSelectedValue());
            } else if (fName === 'show_processed') {
                let toggleShowProcessed = configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
                toggleShowProcessed = !toggleShowProcessed;
                configs.updateOption('upload_show_processed', toggleShowProcessed, true);
            }
            this.setState({ random: Math.random() });
        },

        radioChange: function (e, newValue) {
            const { configs } = this.props;

            configs.updateOption('upload_existing', newValue);
            this.setState({ random: Math.random() });
        },

        render: function () {
            const { configs } = this.props;

            let maxUploadMessage;
            if (!global.pydio.getPluginConfigs('mq').get('UPLOAD_ACTIVE')) {
                let maxUpload = configs.getOption('UPLOAD_MAX_SIZE');
                maxUploadMessage = global.pydio.MessageHash[282] + ': ' + PathUtils.roundFileSize(maxUpload, '');
                maxUploadMessage = React.createElement(
                    'div',
                    { className: 'option-row' },
                    maxUploadMessage
                );
            }
            let toggleStart = configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
            let toggleClose = configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close');
            let toggleShowProcessed = configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
            let overwriteType = configs.getOption('DEFAULT_EXISTING', 'upload_existing');

            return React.createElement(
                MaterialUI.Popover,
                {
                    open: this.props.open,
                    anchorEl: this.props.anchorEl,
                    anchorOrigin: { horizontal: 'right', vertical: 'bottom' },
                    targetOrigin: { horizontal: 'right', vertical: 'top' },
                    onRequestClose: e => {
                        this.props.onDismiss(e);
                    }
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
        DropUploader,
        TransferFile,
        TransfersList,
        TransferFolder
    };
})(window);
