# react-prime-motc-sider

Source code at https://github.com/carie8655/react-prime-motc-sider

## Installation

    npm install --save react-prime-motc-curdtable

or

    yarn add react-prime-motc-curdtable

## Usage

```
import React from 'react';
import MOTCCRUDTable from 'react-prime-motc-curdtable';

function MOTCCRUDTableDemo(){
    return(
        <React.Fragment>
            <div>
                <MOTCCRUDTable
                    title="Test"
                    width={250}
                    menu={[]}
                    apps={[]}
                />
            </div>
        </React.Fragment>
    )
}

export default MOTCCRUDTableDemo;
```

## Props

| Name  | Type     | Default |
| ----- | -------- | ------- |
| title | 'string' | ''      |
| width | 'number' | ''      |
| menu  | 'array'  | []      |
| apps  | 'array'  | []      |
