import React from 'react'
import {List, ListItem, Subheader, IconMenu, Menu, MenuItem, IconButton, RaisedButton, Divider, FontIcon, Popover} from 'material-ui'

class Ws2RootNodes extends React.Component {

    component;

    componentDidMount() {
        this.component = AdminWorkspaces.WsAutoComplete;
    }

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {
        const {pydio, style, workspaces, paths, onSelect, onError} = this.props;

        if (!this.component) {
            return null
        }

        const Tag = this.component;

        return (
            <List style={{...style, minWidth: 400}}>
                {paths.map((path, idx) => (
                    <ListItem innerDivStyle={{height: "72px", padding: "0 16px", display: "flex"}} disabled={true}>
                        {path && (
                            <Tag
                                pydio={pydio}
                                key={path}
                                style={{backgroundColor: "#ffffff", width: 400, margin: 0, padding: 0}}
                                value={path}
                                validateOnLoad={true}
                                onChange={(key, node) => onSelect(workspaces[idx], {[key]: node})}
                                onError={() => onError(workspaces[idx])}
                            />
                        ) || (
                            <span style={{display: "flex", fontStyle:"italic", height: "72px", alignItems: "center"}}>{this.T('step.mapper.invalid')}</span>
                        )}
                    </ListItem>
                ))}
            </List>
        );
    }
}

export {Ws2RootNodes as default}
