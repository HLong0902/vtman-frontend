/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Modal, notification, Button, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import axiosInstance, { BASE_URL } from "../../../../axios";
import moment from "moment";
import { useSelector } from "react-redux";
import { sortStringFunc } from "../../../../reusable/utils";

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Xoá tin nhắn thành công",
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
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [selectedAutomaticContentId, setSelectedAutomaticContentId] =
    useState(undefined);
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
      current: 1,
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
      automaticContentName: props.automaticContentName,
      automaticContentType:
        props.automaticContentType === "undefined"
          ? ""
          : props.automaticContentType,
    };
  };

  const history = useHistory();
  const location = useLocation();
  const columns = [
    {
      title: "Loại tin nhắn tự động",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => sortStringFunc(a, b, "type"),
      sortOrder: sortedInfo?.columnKey === "type" && sortedInfo?.order,
      fixed: "center",
      width: "20%",
      render: (type) => (
        <div>
          {type}
        </div>
      ),
    },
    {
      title: "Nội dung tin nhắn tự động",
      dataIndex: "automaticContentName",
      key: "automaticContentName",
      width: "30%",
      sorter: (a, b) => sortStringFunc(a, b, "automaticContentName"),
      sortOrder:
        sortedInfo?.columnKey === "automaticContentName" && sortedInfo?.order,
      ellipsis: false,
      render: (automaticContentName) => (
        <div>
          {automaticContentName}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      width: "20%",
      render: (description) => (
        <div>
          {description}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      width: "15%",
      render: (isActive) =>
        isActive === 1 ? (
          <p style={{ color: "#1890ff", margin: "0 0 0" }}>• Hoạt động</p>
        ) : (
          <p style={{ color: "#73777b", margin: "0 0 0" }}>• Không hoạt động</p>
        ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      width: "15%",
      dataIndex: "",
      render: (autoContent) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditAutoContent(autoContent.automaticContentId);
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
                  setSelectedAutomaticContentId(autoContent.automaticContentId);
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

  const handleDeleteAutoContent = () => {
    axiosInstance
      .get(
        `${BASE_URL}/api/autoContent/detail?autoContentId=${selectedAutomaticContentId}`
      )
      .then((response) => {
        if (response.status === 200) {
          axiosInstance
            .delete(
              `/api/autoContent/delete?autoContentId=${selectedAutomaticContentId}`
            )
            .then((data) => {
              fetch({ pagination });
              openNotification();
            })
            .catch((error) => {
              openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
            });
        }
      })
      .catch((error) => {
        openErrorNotification("Bản ghi không tồn tại trên hệ thống");
        fetch({ pagination });
      });
  };

  const handleEditAutoContent = (selectedAutoContentId) => {
    axiosInstance
      .get(
        `${BASE_URL}/api/autoContent/detail?autoContentId=${selectedAutoContentId}`
      )
      .then((response) => {
        if (response.status === 200) {
          history.push(location.pathname + `/edit/${selectedAutoContentId}`);
        }
      })
      .catch((error) => {
        openErrorNotification("Bản ghi không tồn tại trên hệ thống");
        fetch({ pagination });
      });
  };

  const handleAddAutoContent = () => {
    history.push(location.pathname + `/add`);
  };

  const handleExport = () => {
    setShowExportConfirm(false);
    props.setSpinning(true);
    axiosInstance
      .get(
        `/api/autoContent/export?name=${props.automaticContentName}
                   &autoContentType=${props.automaticContentType}`
      )
      .then((response) => {
        props.setSpinning(false);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `Danh sách tin nhắn tự động_${moment().format(
          "YYMMDD_HHmmss"
        )}.xlsx`;
        link.click();
        document.body.removeChild(link);
      })
      .catch(() => {});
  };

  const fetch = (params = {}) => {
    setLoading(true);
    let fetchData = getRandomuserParams(params);
    axiosInstance
      .get(
        `${BASE_URL}/api/autoContent/find?name=${
          fetchData.automaticContentName === undefined
            ? ""
            : fetchData.automaticContentName
        }&autoContentType=${
          fetchData.automaticContentType === "undefined"
            ? ""
            : fetchData.automaticContentType
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
        visible={showExportConfirm}
        onOk={handleExport}
        onCancel={() => {
          setShowExportConfirm(false);
        }}
        zIndex={9999}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn thực hiện hành động này không?
      </Modal>
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
          handleDeleteAutoContent();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá tin nhắn tự động này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách tin nhắn tự động</h5>
              </CCol>
              <CCol md="6" className="d-flex justify-content-end">
                <Button
                  className="mt-3"
                  type="primary"
                  onClick={() => {
                    if (data.length > 0) {
                      setShowExportConfirm(true);
                    } else {
                      openErrorNotification("Không có dữ liệu để export");
                    }
                  }}
                  danger
                >
                  Export
                </Button>
                <Button
                  className="m-3 "
                  type="primary"
                  onClick={handleAddAutoContent}
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
                rowKey={(record) => record.automaticContentId}
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
