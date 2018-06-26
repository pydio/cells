(function(global){

    let DropUploader = React.createClass({

        propTypes: {
            onDismiss: React.PropTypes.func
        },

        getInitialState: function() {
            return {};
        },

        onDrop: function(files){
            let contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleDropEventResults(null, files, contextNode);
        },

        onFolderPicked: function(files){
            let contextNode = global.pydio.getContextHolder().getContextNode();
            UploaderModel.Store.getInstance().handleFolderPickerResult(files, contextNode);
        },

        start: function(e){
            e.preventDefault();
            UploaderModel.Store.getInstance().processNext();
        },
        clear: function(e){
            e.preventDefault();
            UploaderModel.Store.getInstance().clearAll();
        },
        toggleOptions: function(e){
            if (e.preventDefault) e.preventDefault();
            let crtOptions = this.state && this.state.options ? this.state.options : false;
            this.setState({
                options: !crtOptions,
                optionsAnchorEl: e.currentTarget,
            });
        },

        openFilePicker: function(e){
            e.preventDefault();
            this.refs.dropzone.open();
        },

        openFolderPicker: function(e){
            e.preventDefault();
            this.refs.dropzone.openFolderPicker();
        },

        render: function(){

            let optionsEl;
            let messages = global.pydio.MessageHash;
            const connectDropTarget = this.props.connectDropTarget || (c => {return c});
            const {options} = this.state;

            let dismiss = function(e){
                this.toggleOptions(e);
                if(UploaderModel.Configs.getInstance().getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true)){
                    UploaderModel.Store.getInstance().processNext();
                }
            }.bind(this);
            optionsEl = <UploadOptionsPane open={options} anchorEl={this.state.optionsAnchorEl} onDismiss={dismiss}/>

            let folderButton, startButton;
            let e = global.document.createElement('input');
            e.setAttribute('type', 'file');
            if('webkitdirectory' in e){
                folderButton = <ReactMUI.RaisedButton style={{marginRight: 10}} label={messages['html_uploader.5']} onClick={this.openFolderPicker}/>;
            }
            e = null;
            let configs = UploaderModel.Configs.getInstance();
            if(!configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true)){
                startButton = <ReactMUI.FlatButton style={{marginRight: 10}} label={messages['html_uploader.11']} onClick={this.start} secondary={true}/>
            }
            return connectDropTarget(
                <div style={{position:'relative', padding: '10px'}}>
                    <MaterialUI.Toolbar style={{backgroundColor: '#fff'}}>
                        <div style={{display:'flex', justifyContent: 'space-between', padding: '0px 24px', width: '100%', height: '100%'}}>
                            <div style={{display:'flex', alignItems: 'center', marginLeft: '-48px'}}>
                                <MaterialUI.RaisedButton secondary={true} style={{marginRight: 10}} label={messages['html_uploader.4']} onClick={this.openFilePicker}/>
                                {folderButton}
                                {startButton}
                                <MaterialUI.FlatButton label={messages['html_uploader.12']} style={{marginRight: 10}} onClick={this.clear}/>
                            </div>
                            <div style={{display:'flex', alignItems: 'center', marginRight: '-48px'}}>
                                <MaterialUI.FlatButton style={{float: 'right'}} label={messages['html_uploader.22']} onClick={this.toggleOptions}/>
                            </div>
                        </div>
                    </MaterialUI.Toolbar>
                    <PydioForm.FileDropZone
                        className="transparent-dropzone"
                        ref="dropzone"
                        multiple={true}
                        enableFolders={true}
                        supportClick={false}
                        ignoreNativeDrop={true}
                        onDrop={this.onDrop}
                        onFolderPicked={this.onFolderPicked}
                        style={{width:'100%', height: 300}}
                    >
                        <TransfersList onDismiss={this.props.onDismiss}/>
                    </PydioForm.FileDropZone>
                    {optionsEl}
                </div>
            );

        }

    });

    DropUploader = Pydio.requireLib('hoc').dropProvider(DropUploader);

    const TransferFile = React.createClass({

        propTypes: {
            item: React.PropTypes.object.isRequired,
            className:React.PropTypes.string
        },

        componentDidMount: function(){
            this.props.item.observe('progress', function(value){
                this.setState({progress: value});
            }.bind(this));
            this.props.item.observe('status', function(value){
                this.setState({status: value});
            }.bind(this));
        },

        getInitialState: function(){
            return {
                progress: this.props.item.getProgress(),
                status: this.props.item.getStatus()
            };
        },

        abortTransfer: function(){
            UploaderModel.Store.getInstance().stopOrRemoveItem(this.props.item);
        },

        render: function(){
            let style, relativeMessage;
            const messageIds = {
                "new" : 433,
                "loading":434,
                "loaded":435,
                "error":436
            };
            let statusMessage = this.props.item.getStatus();
            let stopButton;
            if(statusMessage === 'loading'){
                stopButton = <span className="stop-button icon-stop" onClick={this.abortTransfer}/>;
            }else{
                stopButton = <span className="stop-button mdi mdi-close" onClick={this.abortTransfer}/>;
            }
            if(statusMessage === 'error' && this.props.item.getErrorMessage()){
                statusMessage = this.props.item.getErrorMessage();
            }
            if(global.pydio.MessageHash[messageIds[statusMessage]]){
                statusMessage = global.pydio.MessageHash[messageIds[statusMessage]];
            }
            if(this.props.item.getRelativePath()){
                relativeMessage = <span className="path">{this.props.item.getRelativePath()}</span>;
            }
            if(this.state && this.state.progress){
                style = {width: this.state.progress + '%'};
            }
            return (
                <div className={"file-row upload-" + this.props.item.getStatus() + " " + (this.props.className?this.props.className:"")}>
                    <span className="mdi mdi-file"/> {this.props.item.getFile().name}
                    {relativeMessage}
                    <span className="status">{statusMessage}</span>
                    {stopButton}
                    <div className="uploader-pgbar" style={style}/>
                </div>
            );
        }
    });

    const TransferFolder = React.createClass({

        propTypes: {
            item: React.PropTypes.object.isRequired
        },

        render: function(){
            let statusMessage;
            if(this.props.item.getStatus() === 'loaded'){
                statusMessage = global.pydio.MessageHash['html_uploader.13'];
            }
            return (
                <div className={"folder-row upload-" + this.props.item.getStatus() + " " + (this.props.className?this.props.className:"")}>
                    <span className="mdi mdi-folder"/> {this.props.item.getPath()} <span className="status">{statusMessage}</span>
                </div>
            );
        }
    });

    const TransfersList = React.createClass({

        propTypes: {
            onDismiss: React.PropTypes.func
        },

        componentDidMount: function(){
            let store = UploaderModel.Store.getInstance();
            this._storeObserver = function(){
                if(!this.isMounted()) return;
                this.setState({items: store.getItems()});
            }.bind(this);
            store.observe("update", this._storeObserver);
            store.observe("auto_close", function(){
                if(this.props.onDismiss){
                    this.props.onDismiss();
                }
            }.bind(this));
            this.setState({items: store.getItems()});
        },

        componentWillUnmount: function(){
            if(this._storeObserver){
                UploaderModel.Store.getInstance().stopObserving("update", this._storeObserver);
                UploaderModel.Store.getInstance().stopObserving("auto_close");
            }
        },

        renderSection: function(accumulator, items, title = "", className=""){
            if(title && items.length){
                accumulator.push(<div className={className + " header"}>{title}</div>);
            }
            items.sort(function(a, b){
                let aType = a instanceof UploaderModel.FolderItem? 'folder' : 'file';
                let bType = b instanceof UploaderModel.FolderItem? 'folder' : 'file';
                if(aType === bType){
                    return 0;
                }else{
                    return aType === 'folder' ? -1 : 1;
                }
            });
            items.forEach(function(f){
                if(f instanceof UploaderModel.FolderItem){
                    accumulator.push( <TransferFolder key={f.getId()} item={f} className={className}/> );
                }else{
                    accumulator.push( <TransferFile key={f.getId()} item={f} className={className}/> );
                }
            });
        },

        render: function(){
            let items = [];
            if(this.state && this.state.items){
                this.renderSection(items, this.state.items.processing, global.pydio.MessageHash['html_uploader.14'], 'section-processing');
                this.renderSection(items, this.state.items.pending, global.pydio.MessageHash['html_uploader.15'], 'section-pending');
                this.renderSection(items, this.state.items.errors, global.pydio.MessageHash['html_uploader.23'], 'section-errors');
                this.renderSection(items, this.state.items.processed, global.pydio.MessageHash['html_uploader.16'], 'section-processed');
            }
            return (
                <div id="upload_files_list" style={{height: '100%'}} className={UploaderModel.Configs.getInstance().getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false) ? 'show-processed' : ''}>
                    {items}
                </div>
            )
        }
    });

    const UploadOptionsPane = React.createClass({

        propTypes: {
            open: React.PropTypes.boolean,
            anchorEl: React.PropTypes.string,
            onDismiss: React.PropTypes.func.isRequired
        },

        getInitialState: function(){
            let configs = UploaderModel.Configs.getInstance();
            return {
                configs: configs
            };
        },

        updateField: function(fName, event){
            if(fName === 'autostart'){
                let toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send', true);
                toggleStart = !toggleStart;
                this.state.configs.updateOption('upload_auto_send', toggleStart, true);
            }else if(fName === 'autoclose'){
                let toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close', true);
                toggleStart = !toggleStart;
                this.state.configs.updateOption('upload_auto_close', toggleStart, true);
            }else if(fName === 'existing'){
                this.state.configs.updateOption('upload_existing', event.target.getSelectedValue());
            }else if(fName === 'show_processed'){
                let toggleShowProcessed = this.state.configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
                toggleShowProcessed = !toggleShowProcessed;
                this.state.configs.updateOption('upload_show_processed', toggleShowProcessed, true);
            }
            this.setState({random: Math.random()});
        },

        radioChange: function(e, newValue){
            this.state.configs.updateOption('upload_existing', newValue);
            this.setState({random: Math.random()});
        },

        render: function(){

            let maxUploadMessage
            if(!global.pydio.getPluginConfigs('mq').get('UPLOAD_ACTIVE')){
                let maxUpload = this.state.configs.getOption('UPLOAD_MAX_SIZE');
                maxUploadMessage = global.pydio.MessageHash[282] + ': ' + PathUtils.roundFileSize(maxUpload, '');
                maxUploadMessage = <div className="option-row">{maxUploadMessage}</div>;
            }
            let toggleStart = this.state.configs.getOptionAsBool('DEFAULT_AUTO_START', 'upload_auto_send');
            let toggleClose = this.state.configs.getOptionAsBool('DEFAULT_AUTO_CLOSE', 'upload_auto_close');
            let toggleShowProcessed = this.state.configs.getOptionAsBool('UPLOAD_SHOW_PROCESSED', 'upload_show_processed', false);
            let overwriteType = this.state.configs.getOption('DEFAULT_EXISTING', 'upload_existing');

            return (
                <MaterialUI.Popover
                  open={this.props.open}
                  anchorEl={this.props.anchorEl}
                  anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
                  targetOrigin={{horizontal: 'right', vertical: 'top'}}
                  onRequestClose={this.props.onDismiss}
                >
                    <MaterialUI.List style={{width: 260}}>
                        <MaterialUI.ListItem primaryText={global.pydio.MessageHash[337]} rightToggle={<MaterialUI.Toggle toggled={toggleStart} defaultToggled={toggleStart} onToggle={this.updateField.bind(this, 'autostart')} />} />
                        <MaterialUI.ListItem primaryText={global.pydio.MessageHash[338]} rightToggle={<MaterialUI.Toggle toggled={toggleClose} onToggle={this.updateField.bind(this, 'autoclose')} />} />
                        <MaterialUI.ListItem primaryText={global.pydio.MessageHash['html_uploader.17']} rightToggle={<MaterialUI.Toggle toggled={toggleShowProcessed} onToggle={this.updateField.bind(this, 'show_processed')} />} />
                        <MaterialUI.Divider />
                        <MaterialUI.Subheader>{global.pydio.MessageHash['html_uploader.18']}</MaterialUI.Subheader>
                        <MaterialUI.ListItem disabled={true} style={{paddingTop: 0}}>
                            <MaterialUI.RadioButtonGroup ref="group" name="shipSpeed" defaultSelected={overwriteType} onChange={this.radioChange}>
                                <MaterialUI.RadioButton value="alert" label={global.pydio.MessageHash['html_uploader.19']} style={{paddingBottom: 8}} />
                                <MaterialUI.RadioButton value="rename" label={global.pydio.MessageHash['html_uploader.20']} style={{paddingBottom: 8}}/>
                                <MaterialUI.RadioButton value="overwrite" label={global.pydio.MessageHash['html_uploader.21']}/>
                            </MaterialUI.RadioButtonGroup>
                        </MaterialUI.ListItem>
                    </MaterialUI.List>
                </MaterialUI.Popover>
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
