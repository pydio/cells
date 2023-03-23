/*
 * Copyright 2018-2023 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
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

import React from 'react';
import PropTypes from 'prop-types';
import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import TreeView from '@mui/lab/TreeView';
import TreeItem, { treeItemClasses } from '@mui/lab/TreeItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const StyledTreeItemRoot = styled(TreeItem)(({ theme, muiTheme}) => ({
    color: muiTheme.palette.mui3.secondary,
    [`& .${treeItemClasses.content}`]: {
        color: 'inherit',
        borderRadius: 20,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 8,
        transition:'background-color 250ms cubic-bezier(0.23, 1, 0.32, 1) 0ms',
        '&.Mui-expanded': {
            fontWeight: 500,
        },
        '&:hover': {
            backgroundColor: muiTheme.hoverBackgroundColor
        },
        '&.Mui-focused':{
            backgroundColor:'transparent'
        },
        '&.Mui-selected, &.Mui-selected.Mui-focused': {
            backgroundColor: muiTheme.palette.mui3['secondary-container'],
            color: muiTheme.palette.mui3['on-secondary-container'],
        },
        [`& .${treeItemClasses.label}`]: {
            fontSize: 14,
            fontWeight: 500,
            color: 'inherit',
        },
    },
    [`& .${treeItemClasses.group}`]: {
        marginLeft: 0,
        [`& .${treeItemClasses.content}`]: {
            paddingLeft: 16,
        },
    },
}));

function StyledTreeItem(props) {
    const {
        labelIcon,
        labelInfo,
        labelText,
        ...other
    } = props;

    return (
        <StyledTreeItemRoot
            label={
                <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
                    {labelIcon}
                    <span style={{ flex: 1, fontWeight: 'inherit', flexGrow: 1 }}>
                        {labelText}
                    </span>
                    <span>{labelInfo}</span>
                </Box>
            }
            style={{color:'inherit'}}
            {...other}
        />
    );
}

StyledTreeItem.propTypes = {
    labelIcon: PropTypes.object.isRequired,
    labelInfo: PropTypes.string,
    labelText: PropTypes.string.isRequired,
};

export default function TreePanel({pydio, muiTheme, style, model}) {

    const idsMap = {}

    const buildChildren = (parent) => {
        if(!parent.collections) {
            return [];
        }
        return parent.collections.map((coll) => {
            idsMap[coll.id] = coll
            return (
                <StyledTreeItem
                    muiTheme={muiTheme}
                    nodeId={coll.id}
                    labelText={coll.label}
                    labelIcon={<span style={{fontSize: 20, marginRight: 10}} className={coll.icon}/>}
                >{buildChildren(coll)}</StyledTreeItem>
            )
        });
    }

    return (
        <TreeView
            aria-label="gmail"
            defaultExpanded={['3']}
            defaultCollapseIcon={<ArrowDropDownIcon />}
            defaultExpandIcon={<ArrowRightIcon />}
            defaultEndIcon={<div style={{ width: 24 }} />}
            selected={model.contextItem().id}
            onNodeSelect={(event, nodeIds) => {
                if(idsMap[nodeIds]) {
                    model.setContext(idsMap[nodeIds])
                }
            }}
            style={style}
        >{buildChildren(model.getRoot())}</TreeView>
    );
}