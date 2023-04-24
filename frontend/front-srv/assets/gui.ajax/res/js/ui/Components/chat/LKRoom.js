import React from 'react'
import { LiveKitRoom} from 'livekit-react'
import {createLocalAudioTrack, createLocalVideoTrack} from 'livekit-client/room/track/create.js'

export const LKRoom = ({url, token, onRoomConnected, style, stageRenderer}) => {
    return (
        <div className="roomContainer" style={{color:'white', ...style}}>
            <LiveKitRoom
                url={url}
                token={token}
                stageRenderer={stageRenderer}
                onConnected={room => onConnected(room, onRoomConnected)}
            />
        </div>
    )
}

async function onConnected(room, onRoomConnected) {
    const audioTrack = await createLocalAudioTrack()
    await room.localParticipant.publishTrack(audioTrack)
    const videoTrack = await createLocalVideoTrack();
    await room.localParticipant.publishTrack(videoTrack)
    if(onRoomConnected) {
        onRoomConnected(room)
    }
}