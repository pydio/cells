const PropTypes = require('prop-types');
const {
    Component
} = require('react')

export default function(PydioComponent){

    class ReloadWrapper extends Component{

        componentDidMount(){
            if(this.props.interval){
                this.interval = setInterval(() => {
                    this.refs['component'].triggerReload();
                }, this.props.interval * 1000);
            }
        }

        componentWillUnmount(){
            if(this.interval){
                clearInterval(this.interval);
            }
        }

        render(){

            return <PydioComponent {...this.props} ref="component"/>

        }

    }

    ReloadWrapper.propTypes = {
        interval:PropTypes.number
    };

    ReloadWrapper.displayName = PydioComponent.displayName || PydioComponent.name;

    return ReloadWrapper;

}