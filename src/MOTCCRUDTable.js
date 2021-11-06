import "primeflex/primeflex.css";
import "primereact/resources/themes/nova/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import React, { Component } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import { ColumnGroup } from "primereact/columngroup";
import { Row } from "primereact/row";
import "src/MOTCCRUDTable.css";

class MOTCCRUDTable extends Component {
  DataTableRef = React.createRef();

  FormChildRef = React.createRef();

  ToastRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      modalType: "create",
      modalTempValue: undefined,
      modalLoading: false,
      modalTitle: "",
      onEditValue: undefined,
      globalFilter: "",
    };
  }

  handleBindForm = (submitForm, key) => {
    this[key] = submitForm;
  };

  handleResetFilter = () => {
    this.setState({
      globalFilter: "",
    });

    if (!_.isNull(this.DataTableRef.current)) {
      this.DataTableRef.current.reset();
    }
  };

  handleModalSubmit = (values) => {
    const { onSubmit } = this.props;
    const { modalType, onEditValue } = this.state;

    const callback = (message) => {
      this.setState({
        modalVisible: false,
        modalType: "create",
        modalTempValue: undefined,
        onEditValue: undefined,
      });
      this.ToastRef.current.show(message);
    };
    const loading = (bool) => this.setState({ modalLoading: bool });
    if (onSubmit) {
      onSubmit(values, modalType, callback, loading, onEditValue);
    }
  };

  handleOnEdit = (e, record) => {
    e.preventDefault();
    const { title } = this.props;
    this.handleControlModal(true, "edit", record, `編輯${title}`, record);
  };

  handleOnDelete = (e, record) => {
    e.preventDefault();
    const { onDelete } = this.props;

    const callback = (message) => this.ToastRef.current.show(message);

    confirmDialog({
      message: "您確定要刪除此筆資料？",
      header: "刪除資料",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => onDelete(record, callback),
    });
  };

  handleControlModal = (visible, type, record, title, onEditValue) => {
    this.setState({
      modalVisible: visible,
      modalType: type,
      modalTempValue: record,
      modalTitle: title,
      onEditValue,
    });
  };

  renderTable = () => {
    const {
      title,
      tableData,
      tableColumns,
      rowKey,
      rows,
      columnWidth,
      isMobile,
      showCreate,
      showEdit,
      showDelete,
      showDownload,
      customAction,
      customHeader,
      noAction,
      actionWidth,
      selectionMode,
      selection,
      onSelectionChange,
      footer,
    } = this.props;
    const { globalFilter } = this.state;

    const columns = [];
    _.map(tableColumns, (col) => {
      if (!_.has(col, "children")) {
        columns.push(col);
      } else {
        _.map(col.children, (c) => {
          columns.push(c);
        });
      }
    });

    let colSum = _.sumBy(columns, (d) => d.width || 150);
    if (!noAction) colSum += actionWidth;

    const headerGroup = (
      <ColumnGroup>
        <Row>
          {_.map(tableColumns, (col) => {
            const rowSpan = _.has(col, "children") ? 1 : 2;
            const colSpan = _.has(col, "children") ? col.children.length : 1;
            const temp = _.has(col, "children")
              ? {}
              : {
                  sortable: true,
                  filter: true,
                  filterMatchMode: "contains",
                  filterPlaceholder: `搜尋${col.title}`,
                };

            const minWidth = _.get(col, "width", columnWidth);
            const width = (_.get(col, "width", columnWidth) / colSum) * 100;

            return (
              <Column
                key={col.key}
                field={col.key}
                header={col.title}
                rowSpan={rowSpan}
                colSpan={colSpan}
                headerStyle={{ minWidth, width: `${width}%` }}
                {...temp}
              />
            );
          })}
        </Row>
        <Row>
          {_.chain(tableColumns)
            .filter((col) => _.has(col, "children"))
            .map(({ children }) => {
              return _.map(children, (c) => {
                const minWidth = _.get(c, "width", columnWidth);
                const width = (_.get(c, "width", columnWidth) / colSum) * 100;
                return (
                  <Column
                    key={c.key}
                    field={c.key}
                    header={c.title}
                    headerStyle={{ minWidth, width: `${width}%` }}
                    sortable
                    filter
                    filterMatchMode="contains"
                    filterPlaceholder={`搜尋${c.title}`}
                  />
                );
              });
            })
            .value()}
        </Row>
      </ColumnGroup>
    );

    return (
      <DataTable
        removableSort
        footer={footer}
        ref={this.DataTableRef}
        paginator
        rows={rows || 10}
        showGridlines
        dataKey={rowKey}
        value={tableData}
        scrollable
        selectionMode={selectionMode}
        selection={selection}
        onSelectionChange={onSelectionChange}
        headerColumnGroup={headerGroup}
        header={
          <div className="table-header p-grid">
            <div className="left-btn p-col-12 p-md-6">
              {customHeader && customHeader()}
              {showCreate && (
                <Button
                  type="button"
                  label={`新增${title}`}
                  icon={`pi pi-plus`}
                  className="p-button-sm p-mr-12"
                  onClick={() =>
                    this.handleControlModal(
                      true,
                      "create",
                      undefined,
                      `新增${title}`,
                      undefined
                    )
                  }
                />
              )}
              {showDownload && (
                <React.Fragment>
                  <Button
                    type="button"
                    icon="pi pi-file-excel"
                    label="CSV"
                    onClick={() =>
                      this.DataTableRef.current.exportCSV({
                        selectionOnly: false,
                      })
                    }
                    className="p-button-success p-button-sm p-mr-2"
                    data-pr-tooltip="CSV"
                  />
                </React.Fragment>
              )}
              <Button
                type="button"
                label="清除"
                className="p-button-sm p-button-outlined"
                icon="pi pi-filter-slash"
                onClick={this.handleResetFilter}
              />
            </div>
            <div className="right-btn p-col-12 p-md-6">
              <div className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  type="search"
                  value={globalFilter}
                  className="p-inputtext-lg p-d-block"
                  onChange={(e) =>
                    this.setState({ globalFilter: e.target.value })
                  }
                  placeholder="請輸入要搜尋的文字"
                />
              </div>
            </div>
          </div>
        }
        globalFilter={globalFilter}
        emptyMessage="暫無資料。"
      >
        {!_.isNull(selectionMode) && (
          <Column
            selectionMode={selectionMode}
            headerStyle={{ width: "3em" }}
          />
        )}
        {_.map(columns, (column) => (
          <Column
            key={column.key}
            field={column.key}
            header={column.title}
            headerStyle={{
              minWidth: _.get(column, "width", columnWidth),
              width: `${(_.get(column, "width", columnWidth) / colSum) * 100}%`,
            }}
            sortable
            filter
            filterMatchMode="contains"
            filterPlaceholder={`搜尋${column.title}`}
            body={(rowData) =>
              _.get(column, "render")
                ? column.render(rowData)
                : _.get(rowData, column.key)
            }
          />
        ))}
        {!noAction && (
          <Column
            field="action"
            header="操作"
            style={{
              minWidth: actionWidth,
              width: `${(actionWidth / colSum) * 100}%`,
            }}
            body={(record) => (
              <React.Fragment>
                {customAction && customAction(record)}
                {showEdit && (
                  <Button
                    icon="pi pi-pencil"
                    className="p-button-warning p-mr-6"
                    tooltip="編輯"
                    tooltipOptions={{ position: "top" }}
                    onClick={(e) => this.handleOnEdit(e, record)}
                  />
                )}
                {showDelete && (
                  <Button
                    icon="pi pi-trash"
                    className="p-button-danger"
                    tooltip="刪除"
                    tooltipOptions={{ position: "top" }}
                    onClick={(e) => this.handleOnDelete(e, record)}
                  />
                )}
              </React.Fragment>
            )}
          />
        )}
      </DataTable>
    );
  };

  render() {
    const { FormChild, formProps } = this.props;
    const { modalLoading, modalVisible, modalTitle, onEditValue } = this.state;

    return (
      <div id="crud-table">
        <Toast ref={this.ToastRef} />
        {this.renderTable()}
        <Dialog
          header={modalTitle}
          visible={modalVisible}
          breakpoints={{ "960px": "90vw" }}
          style={{ width: "50vw" }}
          footer={
            <div>
              <Button
                label="取消"
                icon="pi pi-times"
                onClick={() =>
                  this.handleControlModal(
                    false,
                    "create",
                    undefined,
                    "",
                    undefined
                  )
                }
                className="p-button-text"
              />
              <Button
                label="確定"
                icon="pi pi-check"
                loading={modalLoading}
                onClick={(e) => this.FormChildRef(e)}
                autoFocus
              />
            </div>
          }
          onHide={() =>
            this.handleControlModal(false, "create", undefined, "", undefined)
          }
        >
          {!_.isNull(FormChild) && (
            <FormChild
              {...formProps}
              initialValues={onEditValue}
              bindForm={(e) => this.handleBindForm(e, "FormChildRef")}
              onSubmit={this.handleModalSubmit}
            />
          )}
        </Dialog>
      </div>
    );
  }
}

MOTCCRUDTable.propTypes = {
  footer: PropTypes.any,
  title: PropTypes.string,
  tableData: PropTypes.array,
  tableColumns: PropTypes.array,
  rowKey: PropTypes.string,
  rows: PropTypes.number,
  columnWidth: PropTypes.number,

  showCreate: PropTypes.bool,
  showEdit: PropTypes.bool,
  showDelete: PropTypes.bool,
  showDownload: PropTypes.bool,

  isMobile: PropTypes.bool,
  customAction: PropTypes.func,
  customHeader: PropTypes.func,
  noAction: PropTypes.bool,
  actionWidth: PropTypes.number,

  onSubmit: PropTypes.func,
  FormChild: PropTypes.any,
  formProps: PropTypes.object,

  selectionMode: PropTypes.any,
  selection: PropTypes.any,
  onSelectionChange: PropTypes.func,
};

MOTCCRUDTable.defaultProps = {
  footer: null,
  title: "Something",
  tableData: [],
  tableColumns: [],
  rowKey: "id",
  rows: 10,
  columnWidth: 150,

  showCreate: false,
  showEdit: false,
  showDelete: false,
  showDownload: false,

  isMobile: false,
  customAction: null,
  customHeader: null,
  noAction: false,
  actionWidth: 150,

  onSubmit: (values, type, callback, loading) => callback(),
  FormChild: null,
  formProps: {},

  selectionMode: null,
  selection: null,
  onSelectionChange: () => {},
};

export default MOTCCRUDTable;
