import React from 'react'
const {MasterLayout} = Pydio.requireLib('workspaces');
import {muiThemeable} from 'material-ui/styles'
const {DirectoryLayout, ListStylesCompact} = Pydio.requireLib('components')

class Directory extends React.Component {



    render() {

        const {pydio, muiTheme} = this.props;
        const  mainClasses = ['vertical_fit', 'react-fs-template', 'directory-template'];
        const styles = muiTheme.buildFSTemplate({})
        const headerHeight = 72;

        const leftPanelProps = {
            style: {...styles.leftPanel.masterStyle},
            headerHeight,
            onMouseOver:()=>{},
            userWidgetProps: {
                mergeButtonInAvatar:true,
                popoverDirection:'left',
                actionBarStyle:{
                    marginTop:0
                },
                style:{
                    height: headerHeight,
                    display:'flex',
                    alignItems:'center',
                    boxShadow: 'none',
                    background:'transparent'
                }
            }
        };

        return(
            <MasterLayout
                pydio={pydio}
                classes={mainClasses}
                style={{...styles.masterStyle}}
                leftPanelProps={leftPanelProps}
                drawerOpen={false}
                onCloseDrawerRequested={() => {
                    this.setState({drawerOpen: false})
                }}
            >
                <DirectoryLayout
                    {...this.props}
                    style={{width:'100%', flex: 1, flexGrow: 1, height:'100%'}}
                />
            </MasterLayout>
        )
    }

}

Directory = muiThemeable()(Directory)
export default Directory