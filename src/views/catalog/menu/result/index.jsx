/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Modal, notification, Button, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import axiosInstance, { BASE_URL } from "../../../../axios";
import { useSelector } from "react-redux";
import { sortStringFunc, sortNumberFunc } from "../../../../reusable/utils";

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Xoá menu thành công",
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
  const [selectedMenuId, setSelectedMenuId] = useState(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ["10", "15", "20"],
    showSizeChanger: true,
    locale: { items_per_page: "/ trang" },
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
  });
  const [sortedInfo, setSortedInfo] = useState({});

  const handleTableChange = (nextPagination, filters, sorter) => {
    if (
      nextPagination.current !== pagination.current ||
      nextPagination.pageSize !== pagination.pageSize
    ) {
      setSortedInfo({});
      fetch({
        sortField: sorter.field,
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
      menuName: props.menuName,
    };
  };

  const history = useHistory();
  const location = useLocation();
  const columns = [
    {
      title: "Tên menu",
      dataIndex: "menuName",
      key: "menuName",
      sorter: (a, b) => sortStringFunc(a, b, "menuName"),
      sortOrder: sortedInfo?.columnKey === "menuName" && sortedInfo?.order,
      fixed: "center",
      ellipsis: false,
      width: "25%",
      render: (menuName) => (
        <div>
            {menuName}
        </div>
      ),
    },
    {
      title: "Biểu tượng",
      align: "center",
      dataIndex: "icon",
      width: "15%",
      ellipsis: false,
      render: (icon) =>
        icon !== "" ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            {" "}
            <CIcon name={icon} />
          </div>
        ) : null,
    },
    {
      title: "Thứ tự",
      align: "center",
      dataIndex: "numberOrder",
      key: "numberOrder",
      width: "10%",
      sorter: (a, b) => sortNumberFunc(a, b, "numberOrder"),
      sortOrder: sortedInfo?.columnKey === "numberOrder" && sortedInfo?.order,
      render: (numberOrder) => (
        <div style={{ textAlign: "center" }}>{numberOrder}</div>
      ),
    },
    {
      title: "Đường dẫn",
      dataIndex: "menuPath",
      key: "menuPath",
      width: "15%",
      sorter: (a, b) => sortStringFunc(a, b, "menuPath"),
      sortOrder: sortedInfo?.columnKey === "menuPath" && sortedInfo?.order,
      ellipsis: false,
      render: (menuPath) => (
        <div>{menuPath}</div>
      )
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      ellipsis: false,
      width: "20%",
      render: (description) => (
        <div>
            {description}
        </div>
      )
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "15%",
      render: (menu) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditMenu(menu.menuId);
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
                  setSelectedMenuId(menu.menuId);
                } else {
                  openErrorNotification(
                    "Bạn không có quyền thực hiện hành động này"
                  );
                }
              }}
              style={{
                color: "#ff4d4f",
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

  const handleDeleteMenu = () => {
      axiosInstance
        .get(`api/menu/delete?menuId=${selectedMenuId}`)
        .then((response) => {
          if (response.data.code === "50") {
            openErrorNotification(
              "Hiện tại menu có chứa page, bạn không thể thực hiện thao tác này"
            );
          }
          else {
            openNotification();
            fetch({ pagination });
          }
        }).catch((error) => {
        let code = error.response?.data?.code;
        if (code === "401") {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({ pagination });
        }
      });
  };

  const handleEditMenu = (menuId) => {
    axiosInstance
      .get(`${BASE_URL}/api/menu/detail?menuId=${menuId}`)
      .then((response) => {
        if(response.data !== ""){
          history.push(location.pathname + `/edit/${menuId}`);
        }
        else {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({pagination});
        }
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  const handleAddMenu = () => {
    history.push(location.pathname + `/add`);
  };

  const fetch = (params = {}) => {
    setLoading(true);
    let fetchData = getRandomuserParams(params);

    axiosInstance
      .get(
        `${BASE_URL}/api/menu?keyword=${
          fetchData.menuName === undefined ? "" : fetchData.menuName
        }&page=${params.pagination.current}&pageSize=${
          params.pagination.pageSize
        }`
      )
      .then((response) => {
        let data = response.data;
        if (data.length > 0) {
          let totalRecord = response.headers.count;
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
          handleDeleteMenu();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xóa menu này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách menu</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAddMenu}
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
                columns={columns}
                rowKey={(record) => record.menuId}
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
