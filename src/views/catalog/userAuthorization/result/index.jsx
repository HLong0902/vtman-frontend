/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
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
  const [sortedInfo, setSortedInfo] = useState({});

  const history = useHistory();
  const location = useLocation();

  const columns = [
    {
      title: "Mã nhân viên",
      dataIndex: "employeeCode",
      key: "employeeCode",
      sorter: (a, b) => sortStringFunc(a, b, "employeeCode"),
      sortOrder: sortedInfo?.columnKey === "employeeCode" && sortedInfo?.order,
      width: "10%",
      render: (employeeCode) => (
        <div>
            {employeeCode}
        </div>
      ),
    },
    {
      title: "Tên nhân viên",
      dataIndex: "employeeName",
      key: "employeeName",
      sorter: (a, b) => sortStringFunc(a, b, "employeeName"),
      sortOrder: sortedInfo?.columnKey === "employeeName" && sortedInfo?.order,
      width: "15%",
      render: (employeeName) => (
        <div>
            {employeeName}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => sortStringFunc(a, b, "email"),
      sortOrder: sortedInfo?.columnKey === "email" && sortedInfo?.order,
      width: "15%",
      render: (email) => (
        <div>
            {email}
        </div>
      ),
    },
    {
      title: "Mã bưu cục",
      dataIndex: "postOfficeCode",
      key: "postOfficeCode",
      sorter: (a, b) => sortStringFunc(a, b, "postOfficeCode"),
      sortOrder: sortedInfo?.columnKey === "postOfficeCode" && sortedInfo?.order,
      width: "10%",
      render: (postOfficeCode) => (
        <div>
            {postOfficeCode}
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      sorter: (a, b) => sortStringFunc(a, b, "phone"),
      sortOrder: sortedInfo?.columnKey === "phone" && sortedInfo?.order,
      width: "10%",
      render: (phone) => (
        <div>
            {phone}
        </div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "",
      key: "departmentName",
      sorter: (a, b) => sortStringFunc(a, b, "departmentName"),
      sortOrder:
        sortedInfo?.columnKey === "departmentName" && sortedInfo?.order,
      width: "15%",
      render: (employee) => (
        <div>
            {employee.departmentName}
        </div>
      ),
    },
    {
      title: "Nhóm quản trị",
      dataIndex: "roleName",
      key: "roleName",
      sorter: (a, b) => sortStringFunc(a, b, "roleName"),
      sortOrder: sortedInfo?.columnKey === "roleName" && sortedInfo?.order,
      width: "15%",
      render: (roleName) => (
        <div>
            {roleName}
        </div>
      ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "10%",
      render: (employee) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditEmployee(employee.employeeId);
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
        </div>
      ),
    },
  ];

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

  const handleEditEmployee = (employeeId) => {
    history.push(location.pathname + `/edit/${employeeId}`);
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
      .get("/api/userAuthorization/get", {
        params: {
          pageSize: params.pagination.pageSize,
          page: params.pagination.current,
          departmentId: props.departmentId === "undefined" ? "" : props.departmentId,
          roleId: props.roleId === "undefined" ? "" : props.roleId,
          employee: props.employee,
          sortField: params.sortField,
          sortOrder: params.sortOrder,
        },
      })
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
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách người dùng</h5>
              </CCol>
              <CCol md="6"></CCol>
            </CRow>
            <div className="col-12">
              <Table
                className="table-data"
                columns={columns}
                rowKey={(record) => record.employeeId}
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
