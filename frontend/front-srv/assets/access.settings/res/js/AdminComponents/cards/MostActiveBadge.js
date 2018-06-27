const {Component, PropTypes} = require('react')
const {Paper} = require('material-ui')
const {asGridItem, LabelWithTip} = require('pydio').requireLib('components')
const PathUtils = require('pydio/util/path')

class MostActiveBadge extends Component{

    constructor(props, context){
        super(props, context);
        this.state = {figure:this.props.figure || '-'};
    }

    loadStatus(){
        const {type, range, actionName, workspaceFilter, filenameFilter} = this.props;
        this.firstLoad = null;
        let params = {
            get_action  : 'most_active_type',
            type        : type||'user',
            date_range  : range||'last_day'
        };
        if(type === "action" && actionName){
            params["action"] = actionName;
        }
        if(workspaceFilter && workspaceFilter != -1) {
            params["ws_id"] = workspaceFilter;
        }
        if(filenameFilter) {
            params["filename_filter"] = filenameFilter;
        }

        PydioApi.getClient().request(params, function(transport){
            const data = transport.responseJSON;
            if(data.ERROR || !data.DATA || !data.DATA.length) return;
            let figure = data.DATA[0]['Object'];
            let additionalData;
            if(data.USERS && data.USERS['AJXP_USR_/'+figure]){
                try{
                    additionalData = figure;
                    figure = data.USERS['AJXP_USR_/'+figure]['AJXP_REPO_SCOPE_ALL']['core.conf']['USER_DISPLAY_NAME'];
                }catch(e){}
            }
            if( type === "action" && figure.indexOf("/") !== -1){
                additionalData = figure;
                figure = PathUtils.getBasename(figure);
            }
            this.setState({figure:figure, additionalData:additionalData});
        }.bind(this), null, {discrete:true});
    }

    componentDidMount(){
        this.firstLoad = global.setTimeout(this.loadStatus.bind(this), 500);
    }

    componentWillUnmount(){
        if(this.firstLoad){
            global.clearTimeout(this.firstLoad);
        }
    }

    render(){
        const className = (this.props.className?this.props.className + ' ':'') + 'graphs-badge most-active-badge';
        const labelElement = <h4 className="figure text ellipsis-label">{this.state.figure}</h4>;
        return (
            <Paper
                {...this.props}
                zDepth={1}
                className={className}
                transitionEnabled={false}
            >
                {this.props.closeButton}
                <div className="badge-content">
                    <LabelWithTip labelElement={labelElement} tooltip={this.state.additionalData} />
                    <div className="legend">{this.props.legend}</div>
                </div>
            </Paper>
        );
    }

}

MostActiveBadge.propTypes = {
    type:PropTypes.oneOf(['user','ip','action']),
    figure:PropTypes.number,
    range:PropTypes.string,
    legend:PropTypes.string,
    style:PropTypes.object,
    className:PropTypes.string,
    actionName:PropTypes.string,
    workspaceFilter:PropTypes.string,
    filenameFilter:PropTypes.string
};


const globalMessages = global.pydio.MessageHash;
const gridData = {
    gridDimension: {
        gridWidth:2,
        gridHeight:6
    },
    builderDisplayName:globalMessages['ajxp_admin.home.7'],
    builderFields:[
        {name:'legend',label:globalMessages['ajxp_admin.home.12'], type:'string', mandatory:true},
        {name:'range',label:globalMessages['ajxp_admin.home.13'],
            type:'select',
            choices:'' +
            'last_day|'+globalMessages['ajxp_admin.home.14']+',' +
            'last_week|'+globalMessages['ajxp_admin.home.15']+',' +
            'last_month|'+globalMessages['ajxp_admin.home.16'],
            mandatory:true,
            default:'last_day'
        },
        {name:'type',
            label:globalMessages['ajxp_admin.home.8'],
            type:'select',
            choices:'' +
            'user|'+globalMessages['ajxp_admin.home.9']+',' +
            'ip|'+globalMessages['ajxp_admin.home.10']+',' +
            'action|'+globalMessages['ajxp_admin.home.11'],
            default:'user',
            mandatory:true
        },
        {name:'actionName',label:globalMessages['ajxp_admin.home.17'], type:'select', choices:'json_list:list_query_actions', description:globalMessages['ajxp_admin.home.73']},
        {name:'workspaceFilter', label:globalMessages['ajxp_admin.home.69'], type:'select', choices:'AJXP_AVAILABLE_REPOSITORIES', description:globalMessages['ajxp_admin.home.70']},
        {name:'filenameFilter', label:globalMessages['ajxp_admin.home.71'], description:globalMessages['ajxp_admin.home.72'], type:'string'},
        {name:'interval',label:globalMessages['ajxp_admin.home.18'], type:'integer', default:300}
    ]

}

MostActiveBadge = asGridItem(MostActiveBadge, gridData.builderDisplayName, gridData.gridDimension, gridData.builderFields);
export {MostActiveBadge as default}