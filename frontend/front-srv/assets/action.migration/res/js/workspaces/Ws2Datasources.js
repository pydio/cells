import React from 'react'
import HasherUtils from 'pydio/util/hasher'
import LangUtils from 'pydio/util/lang'
import {List, ListItem, Subheader, IconMenu, Menu, MenuItem, IconButton, RaisedButton, Divider, FontIcon, Popover} from 'material-ui'

const styles = {
    highlighted: {
        backgroundColor: "rgba(204, 204, 204, 0.2)"
    },
    selectable: {
        backgroundColor: "rgba(255, 215, 0, 0.2)"
    }
}

class Ws2Datasources extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            startedServices: []
        }
    }

    static toString(datasource) {
        const {StorageType, StorageConfiguration = {}} = datasource

        switch (StorageType) {
            case "S3":
                const {customEndpoint} = StorageConfiguration

                return customEndpoint ? "S3-compatible storage URL" : "Amazon S3";

                break;
            default:
                return StorageConfiguration.folder
        }
    }

    static extractPath(datasource) {
        const {StorageType, StorageConfiguration = {}} = datasource

        switch (StorageType) {
            case "S3":
                const {ApiKey, ApiSecret, ObjectsBucket, ObjectsBaseFolder} = datasource
                const {customEndpoint} = StorageConfiguration

                const parts = [];
                parts.push(customEndpoint ? 'custom:' + HasherUtils.base64_encode(customEndpoint) : 's3');
                parts.push(ApiKey, ApiSecret);

                parts.push(ObjectsBucket);

                if (ObjectsBaseFolder) {
                    const paths = LangUtils.trim(ObjectsBaseFolder, '/').split('/');
                    parts.push(...paths)
                }

                return parts.join('/');

                break;
            default:
                return StorageConfiguration.folder
        }
    }

    componentDidMount() {
        this.statusPoller = setInterval(() => {
            AdminWorkspaces.DataSource.loadStatuses().then(data => {
                this.setState({startedServices: data.Services});
            });
        }, 2500);
    }

    componentWillUnmount() {
        clearInterval(this.statusPoller);
    }


    render() {
        const {header, headerIcons, highlighted, selectable, datasources, onCreate, onSelect} = this.props;
        const {startedServices} = this.state;

        return (
            <List>
                <Subheader>{header} {headerIcons}</Subheader>

                {datasources.map((datasource, idx) => {

                    const path = ""


                // Check if selected datasource is properly running

                const sync = startedServices.reduce((acc, service) => acc || service.Name === 'pydio.grpc.data.sync.' + datasource.Name, false)
                const index = startedServices.reduce((acc, service) => acc || service.Name === 'pydio.grpc.data.index.' + datasource.Name, false)
                const objects = startedServices.reduce((acc, service) => acc || service.Name === 'pydio.grpc.data.objects.' + datasource.ObjectsServiceName, false)

                return (
                    <Datasource
                        path={path}
                        selectable={selectable(datasource)}
                        highlighted={highlighted(datasource)}
                        datasource={datasource}
                        running={sync && index && objects}
                        onSelect={(ds) => onSelect(ds)}
                    />
                )})}
            </List>
        );
    }
}

class Datasource extends React.Component {
    handleSelect() {
        const {datasource, onSelect} = this.props

        onSelect(datasource)
    }

    render() {
        const {datasource, selectable, highlighted, running} = this.props;
        const {StorageType = ""} = datasource

        const menuIcon = {lineHeight: '24px'};
        const icon = !running ? 'sync' : StorageType === 's3' ? 'cloud-circle' : 'folder';

        let style = this.props.style

        if (highlighted) {
            style = {...style, ...styles.highlighted}
        }
        if (selectable) {
            style = {...style, ...styles.selectable}
        }

        return (
            <div>
                <ListItem
                    leftIcon={<FontIcon style={menuIcon} className={"mdi mdi-" + icon} />}
                    primaryText={datasource.Name}
                    secondaryText={Ws2Datasources.toString(datasource)}
                    style={style}
                    disabled={!selectable}
                    onClick={() => this.handleSelect()}
                />
            </div>
        );
    }
}

export {Ws2Datasources as default}
