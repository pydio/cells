const {Component} = require('react')
const {Paper, List, ListItem} = require('material-ui')
const {asGridItem} = require('pydio').requireLib('components')
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import ReloadWrapper from '../util/ReloadWrapper'

import PydioApi from 'pydio/http/api'
import {ConfigServiceApi} from 'pydio/http/rest-api'


class ServicesStatus extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {services:[]};
    }

    loadStatus(){
        const api = new ConfigServiceApi(PydioApi.getRestClient());
        api.listServices().then((servicesCollection) => {
            this.setState({services: servicesCollection.Services});
        });

    }

    componentDidMount(){
        this.loadStatus();
    }

    componentWillUnmount(){
        if(this.firstLoad){
            clearTimeout(this.firstLoad);
        }
    }

    triggerReload(){
        this.loadStatus();
    }

    render(){

        const {services} = this.state;

        let tags = new Map(), items = [];
        services.forEach((service) => {
            const tag = service.Tag || 'General';
            if(!tags.has(tag)) {
                tags.set(tag, {running:[], stopped: []});
            }
            if(service.Status === 'STARTED'){
                tags.get(tag).running.push(service);
            } else {
                tags.get(tag).stopped.push(service);
            }
        });
        tags.forEach((v, k) => {
            const tagTitle = k.charAt(0).toUpperCase() + k.substr(1);
            items.push(<ListItem primaryText={tagTitle} secondaryText={v.running.length + ' services running, ' + v.stopped.length + ' stopped'}/>)
        });

        const style = {
            ...this.props.style,
            display: 'flex',
            flexDirection:'column'
        };

        return (
            <Paper {...this.props} zDepth={1} transitionEnabled={false} style={style}>
                {this.props.closeButton}
                <h4>{this.props.getMessage('home.35')}</h4>
                <List style={{flex: 1, overflowY: 'auto'}}>
                    {items}
                </List>
            </Paper>
        );
    }
}

const globalMessages = global.pydio.MessageHash;

ServicesStatus.displayName = 'ServerStatus';
ServicesStatus = PydioContextConsumer(ReloadWrapper(ServicesStatus));
ServicesStatus = asGridItem(
    ServicesStatus,
    globalMessages['ajxp_admin.home.35'],
    {gridWidth:3,gridHeight:26},
    [{name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:20}]
);

export {ServicesStatus as default}