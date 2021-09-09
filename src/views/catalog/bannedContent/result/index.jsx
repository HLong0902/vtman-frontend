/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Modal, notification, Button, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import axiosInstance, { BASE_URL } from "../../../../axios";
import { useSelector } from "react-redux";
import { sortStringFunc } from "../../../../reusable/utils";

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Xoá từ khóa bị cấm thành công",
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
  const [selectedBannedContentId, setSelectedBannedContentId] =
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
      bannedContentName: props.bannedContentName,
    };
  };

  const history = useHistory();
  const location = useLocation();
  const columns = [
    {
      title: "Từ khóa bị cấm",
      dataIndex: "bannedContentName",
      key: "bannedContentName",
      sorter: (a, b) => sortStringFunc(a, b, "bannedContentName"),
      sortOrder:
        sortedInfo?.columnKey === "bannedContentName" && sortedInfo?.order,
      fixed: "center",
      width: "45%",
      ellipsis: false,
      render: (bannedContentName) => (
        <div>
          {bannedContentName}
        </div>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      ellipsis: false,
      width: "40%",
      render: (description) => (
        <div>
          {description}
        </div>
      ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      width: "15%",
      dataIndex: "",
      render: (bannedContent) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEdit(bannedContent.bannedContentId);
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
                  setSelectedBannedContentId(bannedContent.bannedContentId);
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

  const handleDeleteBannedContent = () => {
    axiosInstance
      .get(`${BASE_URL}/api/bannedContent/detail?id=${selectedBannedContentId}`)
      .then((response) => {
        if (response.status === 200) {
          axiosInstance
            .delete(`api/bannedContent/delete?id=${selectedBannedContentId}`)
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
        fetch({pagination});
      });
  };

  const handleEdit = (Id) => {
    axiosInstance
      .get(`${BASE_URL}/api/bannedContent/detail?id=${Id}`)
      .then((response) => {
        if (response.status === 200) {
          if (permissions[location.pathname].indexOf(3) !== -1) {
            history.push(location.pathname + `/edit/${Id}`);
          } else {
            openErrorNotification("Bạn không có quyền thực hiện hành động này");
          }
        }
      })
      .catch((error) => {
        openErrorNotification("Bản ghi không tồn tại trên hệ thống");
        fetch({ pagination });
      });
  };

  const handleAddBannedContent = () => {
    if (permissions[location.pathname].indexOf(2) !== -1) {
      history.push(location.pathname + "/add");
    } else {
      openErrorNotification("Bạn không có quyền thực hiện hành động này");
    }
  };

  const fetch = (params = {}) => {
    setLoading(true);
    let fetchData = getRandomuserParams(params);
    axiosInstance
      .get(
        `${BASE_URL}/api/bannedContent?name=${
          fetchData.bannedContentName === undefined
            ? ""
            : fetchData.bannedContentName
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
          handleDeleteBannedContent();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xóa từ khóa bị cấm này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách từ khóa bị cấm</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAddBannedContent}
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
                rowKey={(record) => record.bannedContentId}
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
