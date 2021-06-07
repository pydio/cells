import React from 'react'
import Pydio from 'pydio'
import {List, ListItem, Subheader, IconMenu, Menu, MenuItem, IconButton, RaisedButton, Divider, FontIcon, Popover} from 'material-ui'

const removeComments = (str) => {
    return str.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "").replace(/(\r\n|\n|\r)/gm,"")
}

const styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
}

class Ws2TemplatePaths extends React.Component {

    render() {
        const {title, selectable, highlighted, templatePaths, onCreate, onSelect} = this.props;

        return (
            <List style={{flex: 1}}>
                {templatePaths.map((templatePath, idx) => {
                    return (
                        <TemplatePath
                            selectable={selectable(templatePath)}
                            highlighted={highlighted(templatePath)}
                            templatePath={templatePath}
                            onSelect={(tp) => onSelect(tp)}
                        />
                    )
                })}
            </List>
        );
    }
}

class TemplatePath extends React.Component {
    handleSelect() {
        const {templatePath, onSelect} = this.props

        onSelect(templatePath)
    }

    T(id){
        return Pydio.getInstance().MessageHash['migration.' + id] || id;
    }

    render() {
        const {selectable, highlighted, templatePath} = this.props;

        let style = this.props.style

        if (highlighted) {
            style = {...style, ...styles.highlighted}
        }

        if (!templatePath) {
            return <ListItem style={style} leftIcon={<FontIcon className={"mdi mdi-folder-outline"} />} primaryText={this.T('step.mapper.notplpath.primary')} secondaryText={this.T('step.mapper.notplpath.secondary')} />
        }

        if (selectable) {
            style = {...style, ...styles.selectable}
        }

        return (
            <ListItem
                style={style}
                leftIcon={<FontIcon className={"mdi mdi-file-tree"} />}
                primaryText={templatePath.Path}
                secondaryText={removeComments(templatePath.MetaStore.resolution)}
                disabled={!selectable}
                onClick={() => this.handleSelect()}
            />
        );
    }
}

export {Ws2TemplatePaths as default}
