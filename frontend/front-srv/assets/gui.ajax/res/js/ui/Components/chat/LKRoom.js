import React, {useState} from 'react'
import {
    LiveKitRoom,
    ConnectionState,
    ControlBar,
    GridLayout,
    ParticipantTile,
    RoomName,
    TrackContext,
    useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

function Stage() {
    const cameraTracks = useTracks([Track.Source.Camera]);
    const screenShareTrack = useTracks([Track.Source.ScreenShare])[0];

    return (
        <>
            {screenShareTrack && <ParticipantTile {...screenShareTrack} />}
            <GridLayout tracks={cameraTracks}>
                <TrackContext.Consumer>{(track) => <ParticipantTile {...track} />}</TrackContext.Consumer>
            </GridLayout>
        </>
    );
}

export const LKRoom = ({url, token, onRoomConnected, style, stageRenderer}) => {
    const [connect, setConnect] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const handleDisconnect = () => {
        setConnect(false);
        setIsConnected(false);
    };
    return (
        <div className="roomContainer" style={{color:'white', ...style}}>
            <LiveKitRoom
                serverUrl={url}
                token={token}
                connect={connect}
                audio={true}
                video={true}
                onConnected={() => setIsConnected(true)}
                onDisconnected={handleDisconnect}
            >
                <RoomName />
                <ConnectionState />
                {isConnected && <Stage />}
                <ControlBar />
            </LiveKitRoom>
        </div>
    )
}