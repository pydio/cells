import {Component} from 'react'
import ScrollArea from 'react-scrollbar'

export default function(PydioComponent, scrollAreaProps = {}){

    class VerticalScrollArea extends Component{

        render(){
            if(this.props.id || scrollAreaProps.id){
                const props = {...this.props, id:undefined, style:undefined, className: undefined};
                return (
                    <div
                        id={scrollAreaProps.id || this.props.id}
                        style={{...this.props.style, ...scrollAreaProps.style}}
                        className={scrollAreaProps.className || this.props.className}
                    ><ScrollArea
                            speed={0.8}
                            horizontal={false}
                            style={{height:'100%'}}
                            verticalScrollbarStyle={{borderRadius: 10, width: 6}}
                            verticalContainerStyle={{width: 8}}
                        ><PydioComponent {...props}/></ScrollArea>
                    </div>
                )
            }else{
                return (
                    <ScrollArea
                        speed={0.8}
                        horizontal={false}
                        verticalScrollbarStyle={{borderRadius: 10, width: 6}}
                        verticalContainerStyle={{width: 8}}
                        style={{...this.props.style, ...scrollAreaProps.style}}
                        className={scrollAreaProps.className || this.props.className}
                    ><PydioComponent {...this.props}/></ScrollArea>
                )
            }

        }

    }

    return VerticalScrollArea;

}