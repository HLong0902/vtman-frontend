/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Modal, notification, Button, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import axiosInstance, { BASE_URL } from "../../../../axios";
import { useSelector } from "react-redux";
import { sortStringFunc, sortNumberFunc } from "../../../../reusable/utils";
const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Xoá page thành công",
    placement,
  });
};

const openErrorNotification = (errorName) => {
  notification.error({
    message: `Thông báo`,
    description: errorName,
    placement: "bottomRight",
  });
};

const SearchResult = (props) => {
  const permissions = useSelector((state) => state.user.permissions);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState(undefined);
  const [sortedInfo, setSortedInfo] = useState({});

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ["10", "15", "20"],
    showSizeChanger: true,
    locale: { items_per_page: "/ trang" },
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
  });

  const handleTableChange = (nextPagination, filters, sorter) => {
    if (
      nextPagination.current !== pagination.current ||
      nextPagination.pageSize !== pagination.pageSize
    ) {
      setSortedInfo({});
      fetch({
        sortField: sorter.columnKey,
        sortOrder: sorter.order,
        pagination: nextPagination,
        ...filters,
      });
    } else {
      setSortedInfo(sorter);
    }
  };

  useEffect(() => {
    fetch({ pagination });
    return () => {};
  }, []);

  useEffect(() => {
    setData(props.dataSource);
    setPagination({
      ...pagination,
      total: props.totalRecord,
    });
    setSortedInfo({});
  }, [props.dataSource, props.totalRecord]);

  useEffect(() => {
    if (props.isNewSearch) {
      setPagination({
        ...pagination,
        current: 1,
      });
    }
  }, [props.isNewSearch]);

  const getRandomuserParams = (params) => {
    return {
      pageSize: params.pagination.pageSize,
      page: params.pagination.current,
      pageName: props.pageName,
      pageCode: props.pageCode,
      menuId: props.menuId,
      status: props.status,
    };
  };

  const history = useHistory();
  const location = useLocation();
  const columns = [
    {
      title: "Mã page",
      dataIndex: "pageCode",
      key: "pageCode",
      sorter: (a, b) => sortStringFunc(a, b, "pageCode"),
      sortOrder: sortedInfo?.columnKey === "pageCode" && sortedInfo?.order,
      width: "9%",
      ellipsis: false,
      render: (pageCode) => (
        <div>
            {pageCode}
        </div>
      ),
    },
    {
      title: "Tên page",
      dataIndex: "pageName",
      key: "pageName",
      sorter: (a, b) => sortStringFunc(a, b, "pageName"),
      sortOrder: sortedInfo?.columnKey === "pageName" && sortedInfo?.order,
      width: "17%",
      ellipsis: false,
      render: (pageName) => (
        <div>
            {pageName}
        </div>
      ),
    },
    {
      title: "Tên menu",
      dataIndex: "menuName",
      key: "menuName",
      sorter: (a, b) => sortStringFunc(a, b, "menuName"),
      sortOrder: sortedInfo?.columnKey === "menuName" && sortedInfo?.order,
      ellipsis: false,
      width: "14%",
      render: (menuName) => (
        <div>
            {menuName}
        </div>
      ),
    },
    {
      title: "Thứ tự",
      align: "center",
      dataIndex: "numberOrder",
      width: "9%",
      key: "numberOrder",
      sorter: (a, b) => sortNumberFunc(a, b, "numberOrder"),
      sortOrder: sortedInfo?.columnKey === "numberOrder" && sortedInfo?.order,
      render: (numberOrder) => (
        <div style={{ textAlign: "center" }}>{numberOrder}</div>
      ),
    },
    {
      title: "Đường dẫn",
      dataIndex: "path",
      key: "path",
      sorter: (a, b) => sortStringFunc(a, b, "path"),
      sortOrder: sortedInfo?.columnKey === "path" && sortedInfo?.order,
      ellipsis: false,
      width: "14%",
      render: (path) => (
        <div>
            {path}
        </div>
      ),
    },
    {
      title: "Quyền",
      dataIndex: "actionName",
      key: "actionName",
      sorter: (a, b) => sortStringFunc(a, b, "actionName"),
      sortOrder: sortedInfo?.columnKey === "actionName" && sortedInfo?.order,
      width: "14%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "13%",
      render: (status) =>
        status === 1 ? (
          <p style={{ color: "#1890ff", margin: "0 0 0" }}>• Hoạt động</p>
        ) : (
          <p style={{ color: "#73777b", margin: "0 0 0" }}>• Không hoạt động</p>
        ),

    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      width: "10%",
      dataIndex: "",
      render: (page) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditPage(page.pageId);
              }}
              style={{
                color: "rgb(24, 144, 255)",
              }}
              className="mr-2"
            >
              Sửa
            </a>
          ) : (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
              }}
              style={{
                color: "rgb(115, 119, 123)",
                pointerEvents: "none",
              }}
              className="mr-2"
            >
              Sửa
            </a>
          )}
          {permissions[location.pathname].indexOf(4) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                if (permissions[location.pathname].indexOf(4) !== -1) {
                  setShowConfirm(true);
                  setSelectedPageId(page.pageId);
                } else {
                  openErrorNotification(
                    "Bạn không có quyền thực hiện hành động này"
                  );
                }
              }}
              style={{
                color: page.isSystemPage === 1 ? "rgb(115, 119, 123)" : "#ff4d4f",
                pointerEvents: page.isSystemPage === 1 ? "none" : "pointer",
              }}
            >
              Xoá
            </a>
          ) : (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
              }}
              style={{
                color: "rgb(115, 119, 123)",
                pointerEvents: "none",
              }}
            >
              Xoá
            </a>
          )}
        </div>
      ),
    },
  ];

  const handleDeletePage = () => {
    axiosInstance
      .get(`${BASE_URL}/api/page/getById?pageId=${selectedPageId}`)
      .then((response) => {
        if(response.data!=null && response.data.data!=null){
          if (response.data.data.length === 1) {
            axiosInstance
              .delete(`api/page/deletePage?pageId=${selectedPageId}`)
              .then((data) => {
                fetch({ pagination });
                openNotification();
              })
              .catch((error) => {
                let code = error.response?.data?.code;
                if (code === "413") {
                  openErrorNotification(
                    "Hiện tại Page đã được phân quyền, bạn không thể thực hiện thao tác này"
                  );
                } else {
                  openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
                }
              });
          }
        }
        else {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({pagination});
        }
      })
      .catch((error) => {});
  };

  const handleEditPage = (pageId) => {
    pageId = Number(pageId);
    axiosInstance
      .get(`${BASE_URL}/api/page/getById?pageId=${pageId}`)
      .then((response) => {
        if (response.data.data !== null) {
          history.push(location.pathname + `/edit/${pageId}`);
        } else {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({ pagination });
        }
      })
      .catch((error) => {});
  };

  const handleAddPage = () => {
    history.push(location.pathname + `/add`);
  };

  const fetch = (params = {}) => {
    setLoading(true);
    let fetchData = getRandomuserParams(params);
    axiosInstance
      .get(
        `${BASE_URL}/api/page/search?pageCode=
    ${fetchData.pageCode === undefined ? "" : fetchData.pageCode}
    &pageName=${fetchData.pageName === undefined ? "" : fetchData.pageName}
    &menuId=${fetchData.menuId === undefined ? "" : fetchData.menuId}
    &status=${fetchData.status === undefined ? "" : fetchData.status}
    &page=${params.pagination.current}&pageSize=${params.pagination.pageSize}`
      )
      .then((response) => {
        let data = response.data.data;
        if (data.length > 0) {
          let totalRecord = data[0].totalRecord;
          setLoading(false);
          setData(data);
          setPagination({
            ...params.pagination,
            total: totalRecord,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} / ${total} bản ghi`,
          });
        } else {
          setLoading(false);
          setData([]);
          setPagination({
            ...params.pagination,
            total: 0,
          });
        }
      });
  };

  return (
    <>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Thông báo
          </div>
        }
        visible={showConfirm}
        onOk={() => {
          setShowConfirm(false);
          handleDeletePage();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá page này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách page</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAddPage}
                  danger
                  disabled={permissions[location.pathname].indexOf(2) === -1}
                >
                  Thêm mới
                </Button>
              </CCol>
            </CRow>
            <div className="col-12">
              <Table
                className="table-data"
                rowKey={(record) => record.pageId}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty description={<span>Không có dữ liệu</span>} />
                  ),
                }}
              />
            </div>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default SearchResult;
