import Pydio from 'pydio'
import React, {useState} from 'react'

export default (name, def, pydio) => {
    if(!pydio) {
        pydio = Pydio.getInstance()
    }
    const {user} = pydio
    const [internal, setInternal] = useState(user.getWorkspacePreference(name, def))
    const setWrapped = (value) => {
        user.setWorkspacePreference(name, value)
        setInternal(value)
    }
    return [internal, setWrapped]

}