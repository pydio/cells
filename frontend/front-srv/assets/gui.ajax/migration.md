Currently React 16.3

Codemod tools
```
npx react-codemod class ./res/js/ --parser babylon
npx react-codemod React-PropTypes-to-prop-types ./res/js/ --parser babylon
```

if required in Gruntfile for babel task
```
    options: {
        optional: ['es7.classProperties'],
    },
```

Find & replace

- Replace all 'pydio/http/rest-api' with 'cells-sdk'
- Replace all 'onTouchTap' by 'onClick'
- look for onClick={(e) => e.stopPropagation()} 