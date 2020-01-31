import AdminStyles from "../board/AdminStyles";

const {Component, PropTypes} = require('react')
const {Paper} = require('material-ui')
const {asGridItem} = require('pydio').requireLib('components')

import ReloadWrapper from '../util/ReloadWrapper'
import RemoteGraphLine from '../graph/RemoteGraphLine'
import GraphPaginator from '../graph/GraphPaginator'

class GraphCard extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {
            start:0,
            frequency: this.props.frequency || 'H',
        };
    }

    triggerReload(){
        if(this.state.start === 0){
            this.refs['chart'].triggerReload();
        }
    }

    onPaginatorChange(start){
        this.setState({start});
    }

    onGraphDataLoaded(data){
        this.setState({links:data.links});
    }

    render(){

        const containerW = parseInt(this.props.style.width);
        const containerH = parseInt(this.props.style.height);
        const className = (this.props.className?this.props.className + ' ':'') + 'graphs-card';
        const adminStyles = AdminStyles();

        let filters = this.props.filters || {};
        if(this.props.workspaceFilter && this.props.workspaceFilter != -1) {
            filters["ws_id"] = this.props.workspaceFilter;
        }
        if(this.props.filenameFilter) {
            filters["filename_filter"] = this.props.filenameFilter;
        }

        return (
            <Paper
                {...this.props}
                className={className}
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0,...this.props.style}}
                transitionEnabled={false}>
                {this.props.closeButton}
                <GraphPaginator
                    ref="paginator"
                    start={this.state.start}
                    links={this.state.links}
                    frequency={this.state.frequency}
                    onRangeChange={this.onPaginatorChange.bind(this)}
                    onFrequencyChange={(value) => this.setState({frequency:value, start: 0})}
                    pickerOnShow={this.props.onFocusItem}
                    pickerOnDismiss={this.props.onBlurItem}
                />
                <h4>
                    {this.props.title}
                </h4>
                <div style={{margin:16, maxHeight:210}}>
                    <RemoteGraphLine
                        ref="chart"
                        queryName={this.props.queryName}
                        frequency={this.state.frequency}
                        filters={filters}
                        colorIndex={2}
                        start={this.state.start}
                        onDataLoaded={this.onGraphDataLoaded.bind(this)}
                        width={containerW-40}
                        height={containerH-90}
                    />
                </div>
            </Paper>
        );
    }

}

GraphCard.displayName = 'GraphCard';

GraphCard.propTypes = {
    queryName:PropTypes.string,
    title:PropTypes.string,
    defaultInterval:PropTypes.number,
    style:PropTypes.object,
    className:PropTypes.string,
    zDepth:PropTypes.number
};

GraphCard.defaultProps = {
    style:{
        width:540, height:350, zDepth:1
    }
}

const globalMessages = global.pydio.MessageHash;

const gridData = {
    gridDimension: {
        gridWidth:4,
        gridHeight:20,
    },
    builderDisplayName:globalMessages['ajxp_admin.home.20'],
    builderFields:[
        {name:'title',label:globalMessages['ajxp_admin.home.30'], type:'string', mandatory:true},
        {name:'queryName',
            label:globalMessages['ajxp_admin.home.21'],
            type:'select',
            choices:'' +
            'uploads_per_day|'+globalMessages['ajxp_admin.home.22']+',' +
            'downloads_per_day|'+globalMessages['ajxp_admin.home.23']+',' +
            'sharedfiles_per_day|'+globalMessages['ajxp_admin.home.24']+',' +
            'connections_per_day|'+globalMessages['ajxp_admin.home.25']
        },
        {name:'workspaceFilter', label:globalMessages['ajxp_admin.home.69'], type:'select', choices:'AJXP_AVAILABLE_REPOSITORIES', description:globalMessages['ajxp_admin.home.70']},
        {name:'filenameFilter', label:globalMessages['ajxp_admin.home.71'], description:globalMessages['ajxp_admin.home.72'], type:'string'},
        {name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:300}
    ]
};

GraphCard = ReloadWrapper(GraphCard);
GraphCard = asGridItem(GraphCard, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
export {GraphCard as default}