/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import {
  openErrorNotification,
  openNotification,
} from "../../../base/notification/notification";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../axios";
import { sortStringFunc } from "../../../../reusable/utils";

const SearchResult = (props) => {
  const permissions = useSelector((state) => state.user.permissions);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
    showSizeChanger: true,
    pageSizeOptions: ["10", "15", "20"],
  });
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState(undefined);
  const [sortedInfo, setSortedInfo] = useState({});

  const history = useHistory();
  const location = useLocation();

  const columns = [
    {
      title: "Nhóm quản trị",
      dataIndex: "roleName",
      key: "roleName",
      sorter: (a, b) => sortStringFunc(a, b, "roleName"),
      sortOrder: sortedInfo?.columnKey === "roleName" && sortedInfo?.order,
      width: "40%",
      render: (roleName) => (
        <div>
            {roleName
              ? roleName
              : ""}
        </div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      width: "40%",
      render: (description) => (
        <div>
            {description
              ? description
              : ""}
        </div>
      ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "20%",
      render: (role) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditRole(role.roleId);
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
                setShowConfirm(true);
                setSelectedRoleId(role.roleId);
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

  const handleDeleteRole = () => {
    axiosInstance
      .delete("/api/role/delete", {
        params: {
          roleId: selectedRoleId,
        },
      })
      .then((response) => {
        let status = response.status;
        if (status === 200) {
          openNotification("Xoá nhóm quản trị thành công");
        } else if (status === 204) {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
        }
        fetch({
          pagination,
          sortField: sortedInfo.columnKey,
          sortOrder: sortedInfo.order,
        });
      })
      .catch((error) => {
        let status = error.response?.data?.code;
        if (status === "417") {
          openErrorNotification("Đã tồn tại nhân viên thuộc nhóm quản trị này");
          return;
        }
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

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

  useEffect(() => {
    setLoading(props.loading);
  }, [props.loading]);

  const handleAddRole = () => {
    history.push(location.pathname + "/add");
  };

  const handleEditRole = (roleId) => {
    history.push(location.pathname + `/edit/${roleId}`);
  };

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

  const fetch = (params = {}) => {
    setLoading(true);
    axiosInstance
      .get("/api/role", {
        params: {
          pageSize: params.pagination.pageSize,
          page: params.pagination.current,
          keyword: encodeURIComponent(props.roleName),
          sortField: params.sortField,
          sortOrder: params.sortOrder,
        },
      })
      .then((response) => {
        let data = response.data;
        if (data.length > 0) {
          let totalRecord = Number(response.headers.count);
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
          if (params.pagination.current !== 1) {
            fetch({
              pagination: { ...params.pagination, current: 1 },
            });
          } else {
            setPagination({
              ...params.pagination,
              total: 0,
            });
          }
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
          handleDeleteRole();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá nhóm quản trị này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách nhóm quản trị</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAddRole}
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
                rowKey={(record) => record.roleId}
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
