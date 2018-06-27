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

import {Component} from 'react'
const {PydioContextConsumer} = require('pydio').requireLib('boot');
import {Card, CardActions, Divider, FontIcon, CardTitle, CardText, FlatButton} from 'material-ui'

class AboutCellsCard extends Component {

    openDocs(){
        open("https://github.com/pydio/cells/wiki");
    }

    openForum(){
        open("https://forum.pydio.com");
    }

    openGithub(){
        open("https://github.com/pydio/cells/issues");
    }

    render(){
        const {pydio, style} = this.props;
        const imgBase = pydio.Parameters.get('ajxpResourcesFolder') + '/themes/common/images';

        return (
            <Card style={style}>
                <CardTitle title="About Pydio Cells" subtitle="Future-proof file-sharing platform" />
                <CardText>
                    Pydio Cells is a full rewrite of the PHP server into #Go, the server language used by Google on their own datacenters all
                    over the world. It is designed with scalability and open standards in mind, and based on a micro-services architecture.
                    Please refer to the dedicated documentation to read more about this new architecture and how you can help testing it.
                    <br/>
                    Contributions and bug reports are welcome on our Github repository. Please make sure to read the Contributing instructions
                     and to give as much details as possible to provide a reproducible scenario!
                </CardText>
                <Divider/>
                <CardActions>
                    <FlatButton primary={true} icon={<FontIcon className="mdi mdi-book-variant" />} label="Docs" onTouchTap={this.openDocs} />
                    <FlatButton primary={true} icon={<FontIcon className="mdi mdi-slack" />} label="Forums" onTouchTap={this.openForum}/>
                    <FlatButton primary={true} icon={<FontIcon className="mdi mdi-github-box" />} label="Issues" onTouchTap={this.openGithub}/>
                </CardActions>
            </Card>
        );
    }

}

AboutCellsCard = PydioContextConsumer(AboutCellsCard);

export {AboutCellsCard as default}