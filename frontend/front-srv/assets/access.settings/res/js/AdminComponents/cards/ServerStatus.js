const {Component, PropTypes} = require('react')
const {Paper} = require('material-ui')
const {Doughnut} = require('react-chartjs')
const {asGridItem} = require('pydio').requireLib('components')
const {PydioContextConsumer} = require('pydio').requireLib('boot')
import ReloadWrapper from '../util/ReloadWrapper'

class ServerStatus extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {cpu:0,disk:{free:0,total:1}, load:['-','-','-']};
    }

    loadStatus(){
        this.firstLoad = null;
        PydioApi.getClient().request({
            get_action:'system_status'
        }, function(transport){

            this.setState(transport.responseJSON);

        }.bind(this), null, {discrete:true});
    }

    componentDidMount(){
        this.firstLoad = setTimeout(this.loadStatus.bind(this), 500);
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
        const cpuData = [
            {
                value: this.state.cpu,
                color:"rgba(247, 70, 74, 0.51)",
                highlight: "#FF5A5E",
                label: this.props.getMessage("home.36")
            },
            {
                value: 100 - this.state.cpu,
                color: "rgba(70, 191, 189, 0.59)",
                highlight: "#5AD3D1",
                label: this.props.getMessage("home.37")
            }
        ];
        const freePercent = Math.round(this.state.disk.free / this.state.disk.total * 100);
        const diskData = [
            {
                value: 100 - freePercent,
                color:"rgba(247, 70, 74, 0.51)",
                highlight: "#FF5A5E",
                label: this.props.getMessage("home.38")
            },
            {
                value: freePercent,
                color: "rgba(70, 191, 189, 0.59)",
                highlight: "#5AD3D1",
                label: this.props.getMessage("home.39")
            }
        ];

        return (
            <Paper
                {...this.props}
                zDepth={1}
                transitionEnabled={false}
            >
                {this.props.closeButton}
                <h4>{this.props.getMessage('home.35')}</h4>
                <div className="server-status">
                    <div className="doughnut-chart">
                        <h5>{this.props.getMessage('home.40')}</h5>
                        <Doughnut
                            data={cpuData}
                            options={{}}
                            width={200}
                        />
                        <span className="figure">{this.state.cpu}%</span>
                    </div>
                    <div className="doughnut-chart">
                        <h5>{this.props.getMessage('home.41')}</h5>
                        <Doughnut
                            data={diskData}
                            options={{}}
                            width={200}
                        />
                        <span className="figure">{100 - freePercent}%</span>
                    </div>
                </div>
                <div>
                    <h4>{this.props.getMessage('home.42')}</h4>
                    <div className="server-loads">
                        <span className="server-load legend">1mn</span>
                        <span className="server-load legend">5mn</span>
                        <span className="server-load legend">15mn</span>
                    </div>
                    <div className="server-loads">
                        <span className="server-load">{this.state.load[0]!='-'?Math.round(this.state.load[0]*100)/100:'-'}</span>
                        <span className="server-load">{this.state.load[1]!='-'?Math.round(this.state.load[1]*100)/100:'-'}</span>
                        <span className="server-load">{this.state.load[2]!='-'?Math.round(this.state.load[2]*100)/100:'-'}</span>
                    </div>
                </div>
            </Paper>
        );
    }
}

const globalMessages = global.pydio.MessageHash;

ServerStatus.displayName = 'ServerStatus';
ServerStatus = PydioContextConsumer(ReloadWrapper(ServerStatus));
ServerStatus = asGridItem(
    ServerStatus,
    globalMessages['ajxp_admin.home.35'],
    {gridWidth:5,gridHeight:26},
    [{name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:20}]
);

export {ServerStatus as default}