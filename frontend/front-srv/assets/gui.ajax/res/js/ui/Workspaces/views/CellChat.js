import React from 'react'
import Pydio from 'pydio'
import {Paper, IconButton} from 'material-ui'
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
        const {pydio, style, chatStyle, fieldContainerStyle, zDepth, onRequestClose, muiTheme} = this.props;
        const {cellModel, cellId} = this.state
        const chatBoxStyle = {
            flex: 1,
            display:'flex',
            flexDirection:'column',
            overflow: 'hidden',
            background:muiTheme.palette.mui3['surface-2'],
            borderRadius: muiTheme.palette.mui3['card-border-radius'],
            margin: muiTheme.palette.mui3['fstemplate-master-margin'],
            border: '1px solid ' + muiTheme.palette.mui3['outline-variant-50'],
            ...chatStyle
        };
        let chatRoomType = 'WORKSPACE';
        return (
            <Paper zDepth={zDepth} rounded={false} style={{display:'flex', flexDirection:'column', ...style}}>
                {onRequestClose &&
                    <div style={{position:'absolute', right: 0, top: 0}}>
                        <IconButton iconClassName={'mdi mdi-close'} onClick={onRequestClose} iconStyle={{opacity:0.3}}/>
                    </div>
                }
                <Chat
                    pydio={pydio}
                    roomType={chatRoomType}
                    roomObjectId={cellId}
                    style={chatBoxStyle}
                    fieldContainerStyle={fieldContainerStyle}
                    chatUsersStyle={{padding: '8px 10px', borderBottom:'1px solid ' + muiTheme.palette.mui3['outline-variant-50'], display:'flex', flexWrap:'wrap'}}
                    msgContainerStyle={{maxHeight:null, flex:1, paddingTop: '10px !important', backgroundColor:muiTheme.palette.mui3['surface'], borderBottom: chatBoxStyle.border}}
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