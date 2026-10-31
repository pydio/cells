/*
 * Copyright (c) 2026. Pydio Cells Personal Fork contributors.
 * This file is part of the Pydio Cells Personal Fork.
 *
 * Licensed under the GNU Affero General Public License, version 3 or later.
 */

import Pydio from 'pydio'
import PydioApi from 'pydio/http/api'
import React, {Component} from 'react'
import {connect} from 'react-redux'

const {EditorActions} = Pydio.requireLib('hoc')

@connect(null, EditorActions)
class Editor extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            url: null,
            error: null
        }
        this.cancelled = false
    }

    componentDidMount() {
        const {pydio, editorModify, isActive} = this.props
        pydio.notify('longtask_starting')
        if (editorModify && isActive) {
            editorModify({fixedToolbar: true})
        }
        this.openDocument()
    }

    componentWillUnmount() {
        this.cancelled = true
        this.props.pydio.notify('longtask_finished')
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isActive && this.props.editorModify) {
            this.props.editorModify({fixedToolbar: true})
        }
    }

    async openDocument() {
        const {node, pydio} = this.props
        try {
            const uuid = node.getMetadata().get('uuid')
            if (!uuid) {
                throw new Error('Cells did not provide a document UUID.')
            }

            const token = await PydioApi.getRestClient().getOrUpdateJwt()
            const frontUrl = pydio.getFrontendUrl()
            const endpoint = new URL(
                '/wopi/editor/' + encodeURIComponent(uuid),
                frontUrl.protocol + '//' + frontUrl.host
            )
            const response = await fetch(endpoint.toString(), {
                method: 'GET',
                credentials: 'same-origin',
                cache: 'no-store',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            })

            if (!response.ok) {
                const message = await response.text()
                throw new Error(message || ('Cells returned HTTP ' + response.status))
            }

            const payload = await response.json()
            if (!payload || typeof payload.url !== 'string' || !payload.url) {
                throw new Error('Cells returned an invalid Euro-Office launch URL.')
            }
            if (!this.cancelled) {
                this.setState({loading: false, url: payload.url, error: null})
            }
        } catch (error) {
            if (!this.cancelled) {
                this.setState({
                    loading: false,
                    error: error && error.message ? error.message : 'Could not open this document in Euro-Office.'
                })
            }
        } finally {
            if (!this.cancelled) {
                pydio.notify('longtask_finished')
            }
        }
    }

    render() {
        const {url, loading, error} = this.state
        const frameStyle = {
            backgroundColor: 'white',
            width: '100%',
            height: '100%',
            border: 0,
            flex: 1
        }

        if (error) {
            return (
                <div role="alert" style={{padding: 24, whiteSpace: 'pre-wrap'}}>
                    <strong>Euro-Office could not open this document.</strong>
                    <div>{error}</div>
                </div>
            )
        }
        if (loading || !url) {
            return (
                <div role="status" style={{padding: 24}}>
                    Opening document in Euro-Office…
                </div>
            )
        }

        return (
            <iframe
                title="Euro-Office document editor"
                src={url}
                style={frameStyle}
                allow="clipboard-read; clipboard-write; fullscreen"
                referrerPolicy="no-referrer"
            />
        )
    }
}

export {Editor}
