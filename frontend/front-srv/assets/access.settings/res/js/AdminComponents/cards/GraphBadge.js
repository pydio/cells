import AdminStyles from "../board/AdminStyles";

const {Component, PropTypes} = require('react')
const {Paper} = require('material-ui')
const {asGridItem} = require('pydio').requireLib('components')

import ReloadWrapper from '../util/ReloadWrapper'
import RemoteGraphLine from '../graph/RemoteGraphLine'

class GraphBadge extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {figure:this.props.figure || '-'};
    }

    triggerReload(){
        this.refs['chart'].triggerReload();
    }

    onLoadedData(receivedData, preparedDataSet){
        // Count total of all values
        let figure = 0;
        try{
            const data = preparedDataSet[0].data;
            if(data.length){
                data.map(value => { figure += value; });
            }
        }catch(e){}
        if (!figure) figure = '-';
        this.setState({figure:figure});
    }

    render(){

        const {style, className, frequency, workspaceFilter, filenameFilter, closeButton, queryName, muiTheme, legend} = this.props;

        const containerW = parseInt(style.width);
        const containerH = parseInt(style.height);

        const chartOptions = {
            showScale:false,
            showTooltip:false,
            showGridLines: false,
            pointDot: false,
            bezierCurveTension:0.3,
            datasetStrokeWidth:0,
            showTooltips:false,
            responsive:true,
            maintainAspectRatio:false
        };
        let filters = {};
        if(workspaceFilter && workspaceFilter != -1) {
            filters["ws_id"] = workspaceFilter;
        }
        if(filenameFilter) {
            filters["filename_filter"] = filenameFilter;
        }
        const adminStyles = AdminStyles();

        return (
            <Paper
                transitionEnabled={false}
                {...this.props}
                className={(className?className + ' ':'') + 'graphs-badge'}
                {...adminStyles.body.block.props}
                style={{...adminStyles.body.block.container, margin:0, ...style}}>
                {closeButton}
                <div className="badge-canvas-container">
                    <RemoteGraphLine
                        ref="chart"
                        queryName={queryName}
                        start={0}
                        colorIndex={0}
                        frequency={frequency}
                        width={containerW+10}
                        height={containerH+5}
                        chartOptions={chartOptions}
                        onDataLoaded={this.onLoadedData.bind(this)}
                        filters={filters}
                    />
                </div>
                <div className="badge-content" style={{borderLeft: '3px solid ' + muiTheme.palette.primary1Color}}>
                    <h4 className="figure">{this.state.figure}</h4>
                    <div className="legend">{legend}</div>
                </div>
            </Paper>
        );
    }
}

GraphBadge.propTypes = {
    queryName:PropTypes.string,
    defaultInterval:PropTypes.number,
    figure:PropTypes.number,
    frequency:PropTypes.string,
    legend:PropTypes.string,
    style:PropTypes.object,
    className:PropTypes.string
};

const globalMessages = global.pydio.MessageHash;
const gridData = {
    gridDimension: {
        gridWidth:2,
        gridHeight:6
    },
    builderDisplayName:globalMessages['ajxp_admin.home.19'],
    builderFields:[
        {name:'legend',label:globalMessages['ajxp_admin.home.12'], type:'string', mandatory:true},
        {name:'queryName',
            label:globalMessages['ajxp_admin.home.21'],
            type:'select',
            choices:'' +
            'uploads_per_day|'+globalMessages['ajxp_admin.home.22']+',' +
            'downloads_per_day|'+globalMessages['ajxp_admin.home.23']+',' +
            'sharedfiles_per_day|'+globalMessages['ajxp_admin.home.24']+',' +
            'connections_per_day|'+globalMessages['ajxp_admin.home.25']
        },
        {
            name:'frequency',
            label:globalMessages['ajxp_admin.home.29'],
            type:'select',
            choices:"" +
            "day|"+globalMessages['ajxp_admin.home.26']+"," +
            "week|"+globalMessages['ajxp_admin.home.27']+"," +
            "month|"+globalMessages['ajxp_admin.home.28'],
            default:'day',
            mandatory:true
        },
        {name:'workspaceFilter', label:globalMessages['ajxp_admin.home.69'], type:'select', choices:'AJXP_AVAILABLE_REPOSITORIES', description:globalMessages['ajxp_admin.home.70']},
        {name:'filenameFilter', label:globalMessages['ajxp_admin.home.71'], description:globalMessages['ajxp_admin.home.72'], type:'string'},
        {name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:300}
    ]
};

GraphBadge = ReloadWrapper(GraphBadge);
GraphBadge = asGridItem(GraphBadge, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
export {GraphBadge as default}