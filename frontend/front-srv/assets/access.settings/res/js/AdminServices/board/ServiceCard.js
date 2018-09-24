import React from 'react'
import {Paper, FontIcon} from 'material-ui'

class ServiceCard extends React.Component {

    /**
     *
     * @param service Object
     * @param tag String
     * @param m Function
     * @return {*}
     */
    renderServiceLine(service, tag, m){
        const iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';

        const isGrpc = service.Name.startsWith('pydio.grpc.');
        let legend = isGrpc ? "Grpc" : "Rest";

        if(tag === 'gateway') {
            legend = service.Name.split('.').pop();
        } else if (tag === 'datasource') {
            if(service.Name.startsWith('pydio.grpc.data.sync.')){
                legend=m('datasource.sync')
            } else if(service.Name.startsWith('pydio.grpc.data.objects.')){
                legend=m('datasource.objects')
            } else if(service.Name.startsWith('pydio.grpc.data.index.')){
                legend=m('datasource.index')
            }
        }

        let peers = [];
        if(service.Status === 'STARTED' && service.RunningPeers) {
            service.RunningPeers.map(p => {
                peers.push(p.Address + ':' + p.Port);
            });
        } else {
            peers.push('N/A');
        }

        return (
            <div style={{padding:'8px'}}>
                <div style={{fontWeight:500, color:'#9e9e9e'}}>{legend}</div>
                <div style={{display:'flex', alignItems: 'center', marginTop: 6}}>
                    <FontIcon style={{margin:'0 9px 0 4px', fontSize: 20}} className={"mdi-traffic-light"} color={iconColor}/>
                    <span>{peers.join(', ')}</span>
                </div>
            </div>
        );
    }

    render() {

        const {title, services, tagId, showDescription, pydio} = this.props;
        const m = id => pydio.MessageHash['ajxp_admin.services.service.' + id] || id;

        let grpcDescription;
        if(services.length > 1) {
            services.map(s => {
                if (s.Name.startsWith('pydio.grpc.')) {
                    grpcDescription = s.Description;
                }
            })
        }
        let description = grpcDescription || services[0].Description;
        if(!description && tagId === 'datasource') {
            if(services[0].Name.startsWith('pydio.grpc.data.objects.')){
                description=m('datasource.objects.legend')
            } else {
                description=m('datasource.legend')
            }
        }

        const styles = {
            container: {
                width: 200, margin: 8, display:'flex', flexDirection:'column',
            },
            title : {
                padding: 8, fontSize: 16, backgroundColor: '#607D8B', color: 'white',
            },
            description: {
                padding: 8, color: 'rgba(0,0,0,0.53)', borderTop:'1px solid #eee'
            }
        };

        return (
            <Paper zDepth={1} style={styles.container}>
                <div style={styles.title}>{title}</div>
                <div style={{flex: 1}} >
                    {services.map(service => this.renderServiceLine(service, tagId, m))}
                </div>
                {showDescription && <div style={styles.description}>{description}</div>}
            </Paper>
        )
    }

}

export {ServiceCard as default}