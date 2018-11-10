/*
 * Copyright 2007-2018 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import React from 'react'
import PathUtils from 'pydio/util/path'
import {LinearProgress, CircularProgress} from 'material-ui'

const uploadStatusMessages = {
    "new" : 433,
    "loading":434,
    "loaded":435,
    "error":436
};

class Transfer extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            open: false,
            showAll: false,
            status: props.item.getStatus(),
            previewUrl: null,
            progress: props.item.getProgress() || 0
        };
    }

    componentDidMount(){
        const {item} = this.props;
        this._pgObserver = (value) => {this.setState({progress: value});};
        this._statusObserver = (value) => {this.setState({status: value});};
        item.observe('progress', this._pgObserver);
        item.observe('status', this._statusObserver);
        item.observe('children', () => {
            this.forceUpdate();
        });
        if(item instanceof UploaderModel.UploadItem &&  /\.(jpe?g|png|gif)$/i.test(item.getFile().name)){
            if(item.previewUrl){
                this.setState({previewUrl: item.previewUrl});
                return;
            }
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                item.previewUrl = reader.result;
                this.setState({previewUrl: reader.result});
            }, false);
            reader.readAsDataURL(item.getFile());
        }
    }

    componentWillUnmount(){
        const {item} = this.props;
        item.stopObserving('progress', this._pgObserver);
        item.stopObserving('status', this._statusObserver);
    }

    remove(){
        const {item} = this.props;
        if(item.getParent()){
            item.getParent().removeChild(item);
        }
    }

    abort(){
        const {item} = this.props;
        item.abort();
    }

    render(){
        const {item, className, style, limit, level, extensions} = this.props;
        const {open, showAll, progress, status, previewUrl} = this.state;
        const children = item.getChildren();
        let isDir = item instanceof UploaderModel.FolderItem;
        let isSession = item instanceof UploaderModel.Session;

        const styles = {
            main: {
                ...style,
                fontSize:14,
                color:'#424242'
            },
            line: {
                paddingLeft: (level-1)*20,
                display:'flex',
                alignItems: 'center',
                paddingTop:12,
                paddingBottom:12,
                borderBottom: "1px solid #eeeeee",
                backgroundColor: 'white',
                cursor: children.length ? 'pointer' : 'default',
                borderLeft: (level === 1?'3px solid transparent':'')
            },
            leftIcon: {
                display: 'inline-block',
                width: 36,
                textAlign: 'center',
                color: '#616161',
                fontSize: 16
            },
            previewImage: {
                display:'inline-block',
                backgroundColor:'#eee',
                backgroundSize:'cover',
                height: 24,
                width: 24,
                borderRadius: '50%'
            },
            label: {
                fontWeight: isDir ? 500: 400,
            },
            pgBar: {
                width: 80,
                position:'relative'
            },
            rightButton: {
                display: 'inline-block',
                width: 48,
                textAlign: 'center',
                cursor: 'pointer',
                color: '#9e9e9e',
                fontSize: 16
            },
            toggleIcon: {
                color: '#bdbdbd',
                marginLeft: 4
            }
        };


        let childComps = [], iconClass, rightButton, leftIcon, toggleOpen, toggleCallback, pgColor;

        if (children.length){
            if(open || (isSession && status !== 'analyse')){
                const sliced = showAll ? children : children.slice(0, limit);
                childComps = sliced.map(child => <Transfer
                    key={child.getId()}
                    item={child}
                    limit={limit}
                    level={level + 1}
                    extensions={extensions}
                />);
                if(children.length > sliced.length){
                    childComps.push(
                        <div style={{...styles.line, cursor:'pointer', borderLeft:'', paddingLeft: level * 20}} onClick={() => {this.setState({showAll: true})}}>
                            <span style={styles.leftIcon} className={"mdi mdi-plus-box-outline"}/>
                            <span style={{flex:1, fontStyle:'italic'}}>{children.length-sliced.length} more - show all</span>
                        </div>
                    );
                }
            }
            toggleCallback = ()=>{this.setState({open:!open})};
            toggleOpen = <span onClick={toggleCallback} style={styles.toggleIcon} className={"mdi mdi-chevron-" + (open?"down":"right")}/>;
        }

        if(isDir){
            iconClass = "mdi mdi-folder";
            rightButton = <span className="mdi mdi-delete" onClick={()=>{this.remove()}}/>;
            if(progress === 100){
                pgColor = '#4caf50';
            }
        } else {
            const status = item.getStatus();
            iconClass = "mdi mdi-file";
            const ext = PathUtils.getFileExtension(item.getFullPath());
            if(extensions.has(ext)) {
                const {fontIcon} = extensions.get(ext);
                iconClass = 'mimefont mdi mdi-' + fontIcon;
            }

            if(status === 'loading') {
                rightButton = <span className="mdi mdi-stop" onClick={() => this.abort()}/>;
            } else if (status === 'error'){
                pgColor = '#e53935';
                rightButton = <span className={"mdi mdi-restart"} style={{color:'#e53935'}} onClick={() => {item.process(()=>{})}}/>;
            }else{
                pgColor = '#4caf50';
                rightButton = <span className="mdi mdi-delete" onClick={()=>{this.remove()}}/>;
            }
        }

        let label = PathUtils.getBasename(item.getFullPath());
        let progressBar = (<LinearProgress style={{backgroundColor:'#eeeeee'}} color={pgColor} min={0} max={100} value={progress} mode={"determinate"}/>);

        if(isSession){
            // Do not display level 0
            if (status === 'analyse') {
                label = "Preparing files and folders for upload...";
                progressBar = null;
                toggleCallback = null;
                toggleOpen = null;
                rightButton = <CircularProgress size={16} thickness={2} style={{marginTop: 1}}/>
            } else {
                return <div>{childComps}</div>
            }
        }

        if(previewUrl){
            leftIcon = (
                <span style={{...styles.leftIcon, marginTop:-4, marginBottom: -5}}>
                    <div style={{background:'url('+previewUrl+')', ...styles.previewImage}}/>
                </span>
            )
        } else {
            leftIcon = <span className={iconClass} style={styles.leftIcon}/>
        }

        return (
            <div style={styles.main} className={"upload-" + status + " " + (className?className:"")}>
                <div style={styles.line}>
                    {leftIcon}
                    <span onClick={toggleCallback} style={styles.label}>{label}</span>
                    {toggleOpen}
                    <span style={{flex: 1}}/>
                    <div style={styles.pgBar}>{progressBar}</div>
                    <span style={styles.rightButton}>{rightButton}</span>
                </div>
                {childComps}
            </div>
        );
    }
}

export {Transfer as default}

