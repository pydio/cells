import Pydio from 'pydio';

const { AbstractDialogModifier } = Pydio.requireLib('boot');

const LoginMessage = () => (
    <div>
        <div>Please use one of the following username / password to log in :</div>
        <br/>
        <div>- admin / admin</div>
        <div>- demo / demo</div>
        <div>- alice / P@ssw0rd</div>
        <div>- bob / P@ssw0rd</div>
    </div>
)


export default class LoginDialogModifier extends AbstractDialogModifier {
    renderAdditionalComponents(props, state, accumulator) {
        accumulator.top.push(<LoginMessage />);
    }
}
