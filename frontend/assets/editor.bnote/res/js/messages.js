import Pydio from 'pydio';

const mm = Pydio.getMessages();
const t = (id) => mm['bnote.' + id] || id;
export { t };
