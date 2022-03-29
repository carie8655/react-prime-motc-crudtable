/* eslint-disable react/jsx-fragments */
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
import "./index.css";

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
    const { onSubmit } = this.props;

    const callback = (message) => this.ToastRef.current.show(message);

    confirmDialog({
      message: "您確定要刪除此筆資料？",
      header: "刪除資料",
      icon: "pi pi-info-circle",
      acceptClassName: "p-button-danger",
      accept: () => onSubmit(record, "delete", callback),
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

  handleWidthStyle = (item) => {
    const { noAction, tableColumns, actionWidth, columnWidth } = this.props;
    const columns = [];
    _.map(tableColumns, (t) => {
      if (_.has(t, "children")) _.map(t.children, (c) => columns.push(c));
      else columns.push(t);
    });

    let colSum = _.sumBy(columns, (d) => _.get(d, "width", columnWidth));
    if (!noAction) colSum += actionWidth;
    const minWidth = _.get(item, "width", columnWidth);
    const width = (_.get(item, "width", columnWidth) / colSum) * 100;

    const target = document.getElementById("crud-table");
    const clientWidth = target.clientWidth;

    if ((width * clientWidth) / 100 < 150) return { minWidth, width: minWidth };
    else return { minWidth, width: width + "%" };
  };

  renderToolbar = () => {
    const { showDownload } = this.props;
    const DownloadButton = () =>
      showDownload && (
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
            className="p-button-success p-button-sm"
            style={{ marginRight: 12 }}
            data-pr-tooltip="CSV"
          />
        </React.Fragment>
      );

    return DownloadButton();
  };

  renderHeaderGroup = () => {
    const { noAction, tableColumns, actionWidth } = this.props;

    let hasChild = false;
    _.map(tableColumns, (t) => {
      return _.has(t, "children") ? (hasChild = true) : null;
    });

    const ActionColumn = () =>
      !noAction && (
        <Column
          frozen
          alignFrozen="right"
          field="action"
          header="操作"
          rowSpan={2}
          colSpan={1}
          style={this.handleWidthStyle({ width: actionWidth })}
        />
      );

    const renderParentCol = () =>
      _.map(tableColumns, (col) => {
        const hasChildren = _.has(col, "children");
        const rowSpan = hasChildren ? 1 : 2;
        const colSpan = hasChildren ? col.children.length : 1;
        const sortable = _.get(col, "sortable", false);
        const filterable = _.get(col, "filterable", false);
        const colTool = { sortable, filter: filterable };
        const temp = hasChildren ? {} : colTool;

        const body = {
          key: col.key,
          field: col.key,
          header: col.title,
          rowSpan,
          colSpan,
          style: this.handleWidthStyle(col),
          ...temp,
        };
        return <Column {...body} />;
      });

    const renderChildCol = () =>
      _.chain(tableColumns)
        .filter((c) => _.has(c, "children"))
        .map((col) => {
          const colTool = {
            sortable: true,
            filter: true,
            filterMatchMode: "contains",
            filterPlaceholder: "搜尋" + col.title,
          };

          const body = {
            key: col.key,
            field: col.key,
            header: col.title,
            style: this.handleWidthStyle(col),
            ...colTool,
          };
          return <Column {...body} />;
        })
        .value();

    const SecondRow = () => hasChild && <Row>{renderChildCol()}</Row>;

    return (
      <ColumnGroup>
        <Row>
          {renderParentCol()}
          {ActionColumn()}
        </Row>
        {SecondRow}
      </ColumnGroup>
    );
  };

  renderTableHeader = () => {
    const { globalFilter } = this.state;
    const { title, showCreate, isMobile } = this.props;

    const CreateTitle = "新增" + title;
    // prettier-ignore
    const openModal = () =>
      this.handleControlModal(true, "create", undefined, CreateTitle, undefined);

    const CreateButton = () =>
      showCreate && (
        <Button
          type="button"
          label={CreateTitle}
          icon="pi pi-plus"
          className="p-button-sm"
          style={{ marginRight: 12 }}
          onClick={openModal}
        />
      );

    const left = (
      <React.Fragment>
        {CreateButton()}
        <Button
          type="button"
          label="清除"
          className="p-button-sm p-button-outlined"
          icon="pi pi-filter-slash"
          onClick={this.handleResetFilter}
        />
      </React.Fragment>
    );

    const right = (
      <span className="p-input-icon-left w-full">
        <i className="pi pi-search" />
        <InputText
          type="search"
          className="block p-inputtext-lg w-full"
          value={globalFilter}
          onChange={(e) => this.setState({ globalFilter: e.target.value })}
          placeholder="請輸入要搜尋的文字"
        />
      </span>
    );

    if (isMobile) {
      return (
        <div className="flex flex-column">
          <div className="mb-1 flex justify-content-between">{left}</div>
          <div>{right}</div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-content-between">
          <div>{left}</div>
          <div>{right}</div>
        </div>
      );
    }
  };

  renderSelectionColumn = () => {
    const { selectionMode } = this.props;
    if (_.isNull(selectionMode)) return null;

    const style = { width: "3em" };
    return <Column selectionMode={selectionMode} style={style} />;
  };

  renderColumns = () => {
    const { tableColumns } = this.props;

    const renderBody = (col, data) => {
      if (_.has(col, "render")) return col.render(data[col.key], data);
      else return _.get(data, col.key);
    };

    const columns = [];
    _.map(tableColumns, (t) => {
      if (_.has(t, "children")) _.map(t.children, (c) => columns.push(c));
      else columns.push(t);
    });

    return _.map(columns, (column) => {
      const sortable = _.get(column, "sortable", false);
      const filterable = _.get(column, "filterable", false);
      const filter = _.get(column, "filter", {});

      return (
        <Column
          key={column.key}
          field={column.key}
          header={column.title}
          style={this.handleWidthStyle(column)}
          sortable={sortable}
          filter={filterable}
          filterMatchMode="contains"
          filterPlaceholder={"搜尋" + column.title}
          body={(data) => (
            <div style={{ wordBreak: "break-all" }}>
              {renderBody(column, data)}
            </div>
          )}
        />
      );
    });
  };

  renderActionColumn = () => {
    const { noAction, showEdit, showDelete, customAction, actionWidth } =
      this.props;

    if (noAction) return null;

    const CustomAction = (r) => customAction && customAction(r);

    const EditButton = (record) =>
      showEdit && (
        <Button
          icon="pi pi-pencil"
          className="p-button-warning p-button-sm"
          style={{ marginRight: 6 }}
          tooltip="編輯"
          tooltipOptions={{ position: "top" }}
          onClick={(e) => this.handleOnEdit(e, record)}
        />
      );

    const DeleteButton = (record) =>
      showDelete && (
        <Button
          icon="pi pi-trash"
          className="p-button-danger p-button-sm"
          tooltip="刪除"
          tooltipOptions={{ position: "top" }}
          onClick={(e) => this.handleOnDelete(e, record)}
        />
      );

    return (
      <Column
        frozen
        alignFrozen="right"
        field="action"
        header="操作"
        style={this.handleWidthStyle({ width: actionWidth })}
        body={(record) => (
          <React.Fragment>
            {CustomAction(record)}
            {EditButton(record)}
            {DeleteButton(record)}
          </React.Fragment>
        )}
      />
    );
  };

  renderTable = () => {
    const {
      tableData,
      tableColumns,
      rowKey,
      rows,
      selectionMode,
      selection,
      onSelectionChange,
      footer,
    } = this.props;
    const { globalFilter } = this.state;

    const columns = [];
    _.map(tableColumns, (t) => {
      if (_.has(t, "children")) _.map(t.children, (c) => columns.push(c));
      else columns.push(t);
    });

    let filterObj = {};
    _.map(columns, (col) => {
      const filterable = _.get(col, "filterable", false);
      const filter = _.get(col, "filter", {});
      if (filterable) filterObj = { ...filterObj, [col.key]: filter };
    });

    return (
      <DataTable
        ref={this.DataTableRef}
        scrollable
        scrollDirection="both"
        removableSort
        showGridlines
        stripedRows
        dataKey={rowKey}
        value={tableData}
        header={this.renderTableHeader()}
        headerColumnGroup={this.renderHeaderGroup()}
        footer={footer}
        globalFilter={globalFilter}
        emptyMessage="暫無資料"
        rows={rows || 10}
        paginator
        selection={selection}
        selectionMode={selectionMode}
        onSelectionChange={onSelectionChange}
        filters={filterObj}
        filterLocale="en"
      >
        {this.renderSelectionColumn()}
        {this.renderColumns()}
        {this.renderActionColumn()}
      </DataTable>
    );
  };

  render() {
    const { FormChild, formProps } = this.props;
    const { modalLoading, modalVisible, modalTitle, onEditValue } = this.state;

    const handleCancelModal = () => {
      this.handleControlModal(false, "create", undefined, "", undefined);
    };

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
                onClick={handleCancelModal}
                className="p-button-text p-button-sm"
              />
              <Button
                label="確定"
                icon="pi pi-check"
                loading={modalLoading}
                className="p-button-sm"
                autoFocus
                onClick={(e) => this.FormChildRef(e)}
              />
            </div>
          }
          onHide={handleCancelModal}
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
