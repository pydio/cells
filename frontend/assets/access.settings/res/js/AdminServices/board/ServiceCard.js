import React from 'react'
import {Paper, FontIcon} from 'material-ui'

class ServiceCard extends React.Component {

    /**
     *
     * @param service Object
     * @param tag String
     * @param showDescription boolean
     * @param m Function
     * @return {*}
     */
    renderServiceLine(service, tag, showDescription, m){
        let iconColor = service.Status === 'STARTED' ? '#33691e' : '#d32f2f';
        let standBy = false
        if( service.Status !== 'STARTED' && service.Metadata && service.Metadata.unique ){
            iconColor = '#9E9E9E';
            standBy = true
        }

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
                if(p.Port){
                    peers.push(p.Address + ':' + p.Port);
                } else {
                    peers.push(p.Address);
                }
            });
        } else if (standBy) {
            peers.push('Standby');
        } else{
            peers.push('N/A');
        }

        let style = {
            display: 'flex', alignItems: 'center',
            margin: '6px 8px',
            backgroundColor: '#F5F5F5',
            padding: '8px 6px',
            borderRadius: 2
        };

        return (
            <div style={style}>
                <FontIcon style={{margin:'0 9px 0 4px', fontSize: 20}} className={"mdi-traffic-light"} color={iconColor}/>
                <span style={{flex: 1}}>{peers.join(', ')}</span>
                {showDescription &&
                    <span style={{fontStyle:'italic', paddingRight: 6, fontWeight:500, color:'#9e9e9e'}}>{legend}</span>
                }
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
                flex: 1, minWidth: 200, margin: 4, display:'flex', flexDirection:'column',
            },
            title : {
                padding: 8, fontSize: 15, fontWeight: 500, borderBottom:'1px solid #eee'
            },
            description: {
                padding: 8, flex: 1
            }
        };

        return (
            <Paper zDepth={1} style={styles.container}>
                <div style={styles.title}>{title}</div>
                {showDescription && <div style={styles.description}>{description}</div>}
                <div>
                    {services.map(service => this.renderServiceLine(service, tagId, showDescription, m))}
                </div>
            </Paper>
        )
    }

}

export {ServiceCard as default}