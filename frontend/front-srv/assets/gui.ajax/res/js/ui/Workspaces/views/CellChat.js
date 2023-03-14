import React from 'react'
import Pydio from 'pydio'
import {Paper} from 'material-ui'
const {Chat} = Pydio.requireLib('components');
import {muiThemeable} from 'material-ui/styles'

class CellChat extends React.Component{

    constructor(props){
        super(props);
        this.state = {cellModel: null, cellId: ''};
    }

    loadRoomData(){
        const user = this.props.pydio.user;
        user.getActiveRepositoryAsCell().then(c => {
            this.setState({cellModel: c, cellId : c ? user.activeRepository : ''});
        });
    }

    componentWillMount(){
        this.loadRoomData();
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.pydio.user.activeRepository !== this.state.cellId){
            this.loadRoomData();
        }
    }

    render(){
        const {pydio, style, zDepth, onRequestClose, muiTheme} = this.props;
        const {cellModel, cellId} = this.state;
        let chatRoomType = 'WORKSPACE';
        return (
            <Paper id="info_panel" zDepth={zDepth} rounded={false} style={{display:'flex', flexDirection:'column', ...style}}>
                <Chat
                    pydio={pydio}
                    roomType={chatRoomType}
                    roomObjectId={cellId}
                    style={{flex: 1, display:'flex', flexDirection:'column', overflow: 'hidden', background:muiTheme.palette.mui3['surface-2'], borderRadius: 10, margin: '0 5px 5px 5px'}}
                    chatUsersStyle={{borderBottom: 0, padding: 5, backgroundColor:'rgba(0,0,0,.05)', display:'flex', flexWrap:'wrap'}}
                    msgContainerStyle={{maxHeight:null, flex:1, paddingTop: '10px !important'}}
                    fieldHint={pydio.MessageHash['636']}
                    pushMessagesToBottom={true}
                    emptyStateProps={{
                        iconClassName:'mdi mdi-comment-account-outline',
                        primaryTextId:pydio.MessageHash['637'],
                        style:{padding:'0 10px', backgroundColor: 'transparent'},
                        iconStyle:{fontSize: 60},
                        legendStyle:{fontSize: 14, padding: 20}
                    }}
                    computePresenceFromACLs={cellModel?cellModel.getAcls():{}}
                    onRequestClose={onRequestClose}
                />
            </Paper>
        );
    }

}
CellChat = muiThemeable()(CellChat)
export {CellChat as default}