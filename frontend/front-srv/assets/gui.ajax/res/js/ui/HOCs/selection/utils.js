import { getActiveTab } from "../selectors";

export const mapStateToProps = (state, props) => {
    return {
        ...props,
        tab: getActiveTab(state),
    }
}