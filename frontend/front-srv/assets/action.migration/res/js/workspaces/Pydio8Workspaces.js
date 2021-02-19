import React from 'react'
import HasherUtils from 'pydio/util/hasher'
import LangUtils from 'pydio/util/lang'
import {List, ListItem, Subheader, IconMenu, Menu, MenuItem, IconButton, RaisedButton, Divider, FontIcon, Popover} from 'material-ui'

const styles = {
    selected: {
        backgroundColor: "#eeeeee"
    },
    valid: {
        backgroundColor: "rgba(0, 171, 102, 0.1)"
    },
    invalid: {
        backgroundColor: "#ffebee"
    }
};

class Pydio8Workspaces extends React.Component {

    static toString({accessType: type, parameters = {}}) {
        switch (type) {
            case "s3":
                return parameters['STORAGE_URL'] ? "S3-compatible storage URL" : "Amazon S3";

                break;
            default:
                return parameters['PATH'];
        }
    }

    static extractPath({accessType: type, parameters = {}}) {
        if (type === "fs") {
            return parameters['PATH'];
        } else {
            const parts = [];

            parts.push(parameters['STORAGE_URL'] ? 'custom:' + HasherUtils.base64_encode(parameters['STORAGE_URL']) : 's3');
            parts.push(parameters['API_KEY'], parameters['SECRET_KEY']);
            parts.push(parameters['CONTAINER']);

            if (parameters['PATH']) {
                const paths = LangUtils.trim(parameters['PATH'], '/').split('/');
                parts.push(...paths)
            }

            return parts.join('/');
        }
    }

    render() {
        const {workspaces, isInvalid, isValid, selected, onSelect, onHover} = this.props;

        return (
            <List style={{flex: 1, display: "flex", flexDirection: "column"}}>
                {workspaces.map((workspace, idx) => {
                    return (
                        <Workspace
                            style={{flex: 1}}
                            workspace={workspace}
                            valid={isValid(workspace)}
                            invalid={isInvalid(workspace)}
                            selected={selected === workspace}
                            onSelect={(ws) => onSelect(ws)} onHover={(ws) => onHover(ws)}
                        />
                    )
                })}
            </List>
        );
    }
}

class Workspace extends React.Component {
    handleSelect(ws) {
        const {workspace, selected, onSelect} = this.props

        if (!selected) {
            onSelect(workspace)
        } else {
            onSelect(null)
        }
    }

    handleHover() {
        const {workspace, selected, onHover} = this.props

        if (selected) {
            return
        }

        onHover(workspace)
    }

    render() {
        const {workspace, valid, invalid, selected} = this.props;

        let style = this.props.style;

        if (selected) {
            style = {...style, ...styles.selected}
        }

        if (valid) {
            style = {...style, ...styles.valid}
        } else if (invalid) {
            style = {...style, ...styles.invalid}
        }

        return (
            <ListItem
                leftIcon={<FontIcon className={"mdi mdi-database"} />}
                primaryText={workspace.display}
                secondaryText={Pydio8Workspaces.toString(workspace)}
                style={style}
                onMouseOver={() => this.handleHover()}
                onClick={() => this.handleSelect()}
            />
        );
    }
}

export {Pydio8Workspaces as default}
