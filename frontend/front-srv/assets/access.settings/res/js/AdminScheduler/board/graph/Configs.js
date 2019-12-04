
const Blue = '#2196f3';
const DarkGrey = '#424242';
const LightGrey = '#e0e0e0';
const Grey = '#9e9e9e';
const White = '#ffffff';
const Orange= '#ff9800';
const Stale = '#607D8B';

const BoxSize = {width: 150, height: 64};

const dropShadow = {
    name: 'dropShadow',
    args: {
        opacity: 0.1,
        dx: 1,
        dy: 1,
        blur: 5
    }
};

const TextIconMarkup = [{
    tagName: 'rect',
    selector: 'rect',
}, {
    tagName: 'text',
    selector: 'icon'
}, {
    tagName: 'text',
    selector: 'text'
}];

const PortsConfig = {
    groups: {
        'in': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5
                },
                '.port-label': {
                    fill: White
                }
            }
        },
        'out': {
            attrs: {
                '.port-body': {
                    fill: Blue,
                    stroke:'white',
                    'stroke-width':1.5,
                    r:5
                },
                '.port-label': {
                    fill: White
                }
            }
        }
    }
};


const BlueRect = {fill: Blue ,rx: 5,ry: 5, 'stroke-width':1,  'stroke': Blue, filter:dropShadow};
const WhiteRect = {fill: White ,rx: 5,ry: 5, 'stroke-width':1,  'stroke': LightGrey, filter:dropShadow};

const LightIcon = { refY:18, refY2: 0, 'text-anchor':'middle', refX:'50%', fill:'#e3f2fd'};
const LightLabel = { refY:'60%', refY2: 0, 'text-anchor':'middle', refX:'50%', 'font-size': 15, fill:White, 'font-family':'Roboto', 'font-weight':500};
const DarkLabel = {...LightLabel, fill: DarkGrey};
const DarkIcon = {...LightIcon, fill: Blue};

export {PortsConfig, TextIconMarkup, BoxSize, BlueRect, LightLabel, LightIcon, DarkIcon, WhiteRect, DarkLabel, Blue, Orange, LightGrey, Grey, Stale}