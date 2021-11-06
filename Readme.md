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
                <MOTCCRUDTable />
            </div>
        </React.Fragment>
    )
}

export default MOTCCRUDTableDemo;
```

## Props

| Name              | Type              | Default                                 |
| ----------------- | ----------------- | --------------------------------------- |
| title             | 'string'          | ''                                      |
| footer            | 'React Component' | null                                    |
| tableData         | 'array'           | []                                      |
| tableColumns      | 'array'           | []                                      |
| rowKey            | 'string'          | ''                                      |
| rows              | 'number'          | 10                                      |
| columnWidth       | 'number'          | 150                                     |
| showCreate        | 'boolean'         | []                                      |
| showEdit          | 'boolean'         | false                                   |
| showDelete        | 'boolean'         | false                                   |
| showDownload      | 'boolean'         | false                                   |
| isMobile          | 'boolean'         | false                                   |
| customAction      | 'function'        | () => React.Component                   |
| customHeader      | 'function'        | () => React.Component                   |
| noAction          | 'boolean'         | false                                   |
| actionWidth       | 'number'          | 150                                     |
| onSubmit          | 'function'        | (values, type, callback, loading) => {} |
| FormChild         | 'React Component' | null                                    |
| formProps         | 'object'          | {}                                      |
| selectionMode     | 'string'          | null                                    |
| selection         | 'array'           | null                                    |
| onSelectionChange | 'function'        | () => {}                                |
