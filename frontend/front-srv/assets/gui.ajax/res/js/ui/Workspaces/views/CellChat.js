import React from 'react'
import Pydio from 'pydio'
const {Chat} = Pydio.requireLib('components');

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
        const {pydio, style} = this.props;
        const {cellModel, cellId} = this.state;
        let chatRoomType = 'WORKSPACE';
        return (
            <div id="info_panel" style={{display:'flex', flexDirection:'column', borderLeft: '1px solid #e0e0e0', ...style}}>
                <Chat
                    pydio={pydio}
                    roomType={chatRoomType}
                    roomObjectId={cellId}
                    style={{flex: 1, display:'flex', flexDirection:'column'}}
                    msgContainerStyle={{maxHeight:null, flex:1, paddingTop: '10px !important', backgroundColor:'#FAFAFA'}}
                    fieldHint={pydio.MessageHash['636']}
                    pushMessagesToBottom={true}
                    emptyStateProps={{
                        iconClassName:'mdi mdi-comment-account-outline',
                        primaryTextId:pydio.MessageHash['637'],
                        style:{padding:'0 10px', backgroundColor: 'transparent'}
                    }}
                    computePresenceFromACLs={cellModel?cellModel.getAcls():{}}
                />
            </div>
        );
    }

}

export {CellChat as default}