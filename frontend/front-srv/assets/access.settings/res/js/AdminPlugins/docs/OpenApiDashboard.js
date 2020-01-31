/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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
import React from 'react'
import PydioApi from 'pydio/http/api'
import {Paper} from 'material-ui'
import SwaggerUI from 'swagger-ui-react'

class OpenApiDashboard extends React.Component {


    constructor(props){
        super(props);
        this.state = {}
    }

    componentDidMount(){
        const {pydio} = this.props;
        const restEndpoint = pydio.Parameters.get("ENDPOINT_REST_API");
        PydioApi.getRestClient().getOrUpdateJwt().then((token) => {
            this.setState({
                bearerToken : token,
                specUrl: restEndpoint + '/config/discovery/openapi'
            })
        })
    }

    requestInterceptor(request) {
        // Allow developers to set a bearertoken since
        const {bearerToken} = this.state;
        request.headers.Authorization = `Bearer ${bearerToken}`;
        return request;
    };

    render(){
        const {pydio} = this.props;
        const {specUrl} = this.state;
        const adminStyles = AdminComponents.AdminStyles();

        return(
            <div className={"main-layout-nav-to-stack vertical-layout"}>
                <AdminComponents.Header
                    title={pydio.MessageHash['ajxp_admin.developer.rest.apis']}
                    icon="mdi mdi-routes"
                />
                <div className={"layout-fill"} style={{overflowY:'scroll'}}>
                    <div style={{margin:20}}>
                        {pydio.MessageHash['ajxp_admin.developer.rest.apis.legend']}
                        <span style={{cursor:'pointer'}} className={"mdi mdi-open-in-new"} onClick={()=>{open('https://pydio.com/en/docs/administration-guides')}}/>
                    </div>
                    <Paper {...adminStyles.body.block.props} style={{...adminStyles.body.block.container, paddingBottom: 1}}>
                        {specUrl &&
                            <SwaggerUI
                                url={specUrl}
                                requestInterceptor={this.requestInterceptor.bind(this)}
                            />
                        }
                    </Paper>
                </div>
            </div>

        );
    }

}

export {OpenApiDashboard as default}