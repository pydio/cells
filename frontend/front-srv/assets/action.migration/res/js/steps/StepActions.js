import React from 'react'

class StepActions extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            show: false
        }
    }

    componentDidMount() {
        setTimeout(() => this.show(), 451)
    }

    show() {
        this.setState({show: true});
    }

    render() {
        const {show} = this.state;

        if (!show) {
            return <div/>;
        }

        return (
            <div style={{padding: "20px 2px 2px"}}>
                {this.props.children}
            </div>
        )
    }
}

export {StepActions as default}