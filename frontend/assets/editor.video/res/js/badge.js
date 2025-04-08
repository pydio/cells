import React from 'react'
import Pydio from 'pydio'
const {useDiaporamaBadge} = Pydio.requireLib('hoc')

const VideoBadge = ({node, pydio, mimeFontStyle}) => {

    const {Badge} = useDiaporamaBadge(node)
    if(Badge) {
        return <Badge pydio={pydio} node={node} mimeFontStyle={mimeFontStyle}/>
    } else {
        return <div className="mimefont mdi-file-video" style={mimeFontStyle}/>;
    }

}

export {VideoBadge as default}