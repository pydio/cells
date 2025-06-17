import Pydio from 'pydio'
import {createContext} from 'react'

export const PydioContext = createContext({
    dataModel:Pydio.getInstance().getContextHolder()
})