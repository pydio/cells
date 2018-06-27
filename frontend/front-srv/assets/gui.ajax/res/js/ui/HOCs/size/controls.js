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

import { ToolbarTitle, DropDownMenu, MenuItem, IconButton, Slider } from 'material-ui';
import ActionAspectRatio from 'material-ui/svg-icons/action/aspect-ratio'
import { connect } from 'react-redux';
import { mapStateToProps } from './utils';
import { handler } from '../utils';

const styles = {
    sliderContainer: {
        width: "100%",
        height: 150,
        display: "flex",
        justifyContent: "center"
    },
    slider: {
        margin: 0
    }
}

export const AspectRatio = connect(mapStateToProps)((props) =>
    <IconButton onClick={() => handler("onSizeChange", props)({size: "contain"})}>
        <ActionAspectRatio />
    </IconButton>
);

export const Scale = connect(mapStateToProps)((props) =>
    <DropDownMenu>
        <MenuItem primaryText={`${parseInt(props.scale * 100)}%`} />
        <Slider
            axis="y"
            style={styles.sliderContainer}
            sliderStyle={styles.slider}
            value={props.scale}
            min={0.01}
            max={4}
            onChange={(_, scale) => handler("onSizeChange", props)({size: "auto", scale})} />
    </DropDownMenu>
);
