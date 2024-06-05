import React from 'react'
import ReactDOM from 'react-dom'

import {LKRoom} from './LKRoom'

const styles = {
    inline: {
        backgroundColor: 'rgba(0,0,0)'
    },
    fullscreen:{
        position:'absolute',
        top: 0, left: 0, bottom: 0, right: 0,
        padding: 30,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.75)',
        overflowY: 'auto'
    }
}

class LKContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {mode: 'inline'}
    }

    componentWillUnmount() {
        if(this.videoRoomConnected){
            this.videoRoomConnected.disconnect()
        }
    }

    toggleMode(){
        if(this.videoRoomConnected){
            this.videoRoomConnected.disconnect()
        }
        const {mode} = this.state;
        this.setState({mode: mode === 'inline' ? 'fullscreen': 'inline'})
    }

    render() {
        const {mode} = this.state;
        let stageRenderer;
        if(mode === 'inline') {
            //stageRenderer = MobileStage
        }
        const room = (
            <div style={styles[mode]}>
                <a style={{color: 'white'}} onClick={() => this.toggleMode()}>Toogle</a>
                <LKRoom
                    {...this.props}
                    stageRenderer={stageRenderer}
                    onRoomConnected={(room) => {this.videoRoomConnected = room}}
                />
            </div>
        )
        if(mode === 'inline') {
            return room
        } else {
            return ReactDOM.createPortal(room, document.body)
        }
    }

}

export default LKContainer