/*
 * Copyright 2007-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */
import DOMUtils from 'pydio/util/dom'
import React, {useState, useRef, useLayoutEffect} from 'react'

export default function ExpandableStack(props) {

    const {children, ...otherProps} = props;
    const cont = useRef(null)
    const [sizes, setSizes] = useState(null)
    const [hover, setHover] = useState(false)
    useLayoutEffect(() => {
        const ss = [...cont.current.children].map((c) => {
            c.style.maxWidth = null;
            return c.getBoundingClientRect().width
        })
        setSizes(ss)
    }, [children])

    const styles = {
        container: {
            backgroundColor:'transparent',
            position:'relative',
            height: 40,
        },
        tags: {
            position:'absolute',
            right: 0,
            transition: DOMUtils.getBeziersTransition(),
            backgroundColor: 'white',
            borderRadius: 5,
            boxShadow:'1px 1px 3px rgba(0,0,0,.3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:'nowrap',
            maxWidth: 30, // Removed during layout compute
            opacity: 0
        },
    }

    let tStyle = {...styles.tags};
    let contStyle = {...styles.container};
    let subStyles = children.map(() => {}) // empty
    if(sizes === null) {
        tStyle = {}
        contStyle={display: 'flex'}
    } else if(hover) {
        tStyle = {...tStyle, opacity: 1, maxWidth: null}
        const w = sizes.reduce((c, s) => c+s, 0)
        contStyle = {...contStyle, width: w+(10*(sizes.length-1))}
        let sum = 0;
        subStyles = sizes.map((s,i) => {const res = {right:(sum+(sum>0?10*i:0)), top: 0}; sum+=s; return res})
    } else {
        subStyles = sizes.map((s,i) => {return {right:(i>0?4*i:0), top:(i>0?i*3:0)}})
    }

    return (
        <div
            ref={cont}
            style={contStyle}
            onMouseEnter={()=> setHover(true)}
            onMouseLeave={() => setHover(false)}
            {...otherProps}
        >
            {children.map((t,i) => <div style={{...tStyle, ...subStyles[i]}}>{t}</div>)}
        </div>
    )

}