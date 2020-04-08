import React from 'react'
import Pydio from 'pydio'
import {MenuItem} from 'material-ui'
const {ModernSelectField} = Pydio.requireLib('hoc');

import PydioApi from 'pydio/http/api'
import {ActivityServiceApi, ActivitySubscription, ActivityOwnerType} from 'pydio/http/rest-api'


class WatchSelector extends React.Component{

    constructor(props){
        super(props);
        const {nodes} = this.props;
        this.state = this.valueFromNodes(nodes);
    }

    valueFromNodes(nodes = []) {

        let mixed =false, value = undefined;
        nodes.forEach(n => {
            const nVal = n.getMetadata().get('meta_watched') || '';
            if(value !== undefined && nVal !== value) {
                mixed = true;
            }
            value = nVal;
        });
        return {value, mixed};

    }


    onSelectorChange(value){

        if(value === 'mixed'){
            return;
        }

        const {pydio, nodes} = this.props;
        this.setState({saving: true});

        const proms = nodes.map(node => {
            const nodeUuid = node.getMetadata().get('uuid');
            const userId = pydio.user.id;
            let subscription = new ActivitySubscription();
            const type = new ActivityOwnerType();
            subscription.UserId = userId;
            subscription.ObjectId = nodeUuid;
            subscription.ObjectType = type.NODE;
            let events = [];
            if (value === 'META_WATCH_CHANGE' || value === 'META_WATCH_BOTH') {
                events.push('change');
            }
            if(value === 'META_WATCH_READ' || value === 'META_WATCH_BOTH'){
                events.push('read');
            }
            subscription.Events = events;
            const api = new ActivityServiceApi(PydioApi.getRestClient());
            return api.subscribe(subscription).then((outSub) => {
                let overlay = node.getMetadata().get('overlay_class') || '';
                if(value === '') {
                    node.getMetadata().delete('meta_watched');
                    node.getMetadata().set('overlay_class', overlay.replace('mdi mdi-bell', ''));
                } else {
                    node.getMetadata().set('meta_watched', value);
                    let overlays = overlay.replace('mdi mdi-bell', '').split(',');
                    overlays.push('mdi mdi-bell');
                    node.getMetadata().set('overlay_class', overlays.join(','));
                }
                node.notify('node_replaced');
            });
        });
        Promise.all(proms).then(() => {
            this.setState({value: value, mixed: false});
            window.setTimeout(()=>{
                this.setState({saving: false});
            }, 250);
        }).catch(() => {
            this.setState({saving: false});
        });
    }

    render(){

        const {value, mixed, saving} = this.state;

        if(saving){
            return (
                <ModernSelectField value={"saving"} onChange={(e,i,v) => {}} disabled={true}>
                    <MenuItem value={"saving"} primaryText={"Saving status..."}/>
                </ModernSelectField>
            );
        }

        return (
            <ModernSelectField value={mixed ?'mixed': value} onChange={(e,i,v) => {this.onSelectorChange(v)}}>
                {mixed && <MenuItem value={"mixed"} primaryText={"Mixed values..."}/>}
                <MenuItem value={""} primaryText={"Ignore"}/>
                <MenuItem value={"META_WATCH_READ"} primaryText={"On consultation"}/>
                <MenuItem value={"META_WATCH_CHANGE"} primaryText={"On modification"}/>
                <MenuItem value={"META_WATCH_BOTH"} primaryText={"On consultation or modification"}/>
            </ModernSelectField>
        );

    }

}

export default WatchSelector