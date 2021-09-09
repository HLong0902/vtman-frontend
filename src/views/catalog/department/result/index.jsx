/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect, useState} from "react";
import {Table, Modal, notification, Button, Empty} from "antd";
import {CCard, CCol, CRow} from "@coreui/react";
import {useHistory, useLocation} from "react-router-dom";
import "./style.less";
import axiosInstance, {BASE_URL} from "../../../../axios";
import {useSelector} from "react-redux";
import { sortStringFunc } from "../../../../reusable/utils";

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Xoá phòng ban thành công",
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
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    pageSizeOptions: ["10", "15", "20"],
    showSizeChanger: true,
    locale: {items_per_page: "/ trang"},
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
  });
  const [sortedInfo, setSortedInfo] = useState({});

  const initValue = {
    pageIndex: 1,
    pageSize: 10,
    departmentName: "",
    departmentCode: "",
    status:null,
  }

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
    }else{
      setSortedInfo(sorter);
    }
  };

  useEffect(() => {
    fetch({pagination});
    return () => {
    };
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

  const history = useHistory();
  const location = useLocation();
  const columns = [
    {
      title: "Mã phòng ban",
      dataIndex: "departmentCode",
      key: "departmentCode",
      sorter: (a, b) => sortStringFunc(a, b, "departmentCode"),
      sortOrder: sortedInfo?.columnKey === "departmentCode" && sortedInfo?.order,
      width: "15%",
      ellipsis: false,
    },
    {
      title: "Tên phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      sorter: (a, b) => sortStringFunc(a, b, "departmentName"),
      sortOrder: sortedInfo?.columnKey === "departmentName" && sortedInfo?.order,
      ellipsis: false,
      width: "30%",
      render: (departmentName) => (
        <div>{departmentName}</div>
      )
    },
    {
      title: "Ghi chú",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      width: "25%",
      ellipsis: false,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "15%",
      render: (status) =>
        status === 1 ? (
          <p style={{color: "#1890ff", margin: "0 0 0"}}>• Hoạt động</p>
        ) : (
          <p style={{color: "#73777b", margin: "0 0 0"}}>• Không hoạt động</p>
        ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      width: "15%",
      dataIndex: "",
      render: (department) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEdit(department.departmentId);
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
                  setSelectedDepartmentId(department.departmentId);
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

  const handleDelete = () => {
    axiosInstance
      .get(`${BASE_URL}/api/department/view?departmentId=${selectedDepartmentId}`)
      .then((response) => {
        if(response.data.data.departmentId !== null){
          axiosInstance.get(`api/department/delete?departmentId=${selectedDepartmentId}`)
            .then((response) => {
              fetch({pagination});
              openNotification();
            })
            .catch((error) => {
              let code = error.response?.data?.code;
              if(code === "422"){
                openErrorNotification("Phòng ban đã có nhân viên, không thể thực hiện thao tác này");
              }
              else  if(code === "425"){
                openErrorNotification("Bản ghi không tồn tại trên hệ thống");
                fetch({ pagination });
              }
              else {
                openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
              }
            });
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

  const handleEdit = (Id) => {
    axiosInstance
      .get(`${BASE_URL}/api/department/view?departmentId=${Id}`)
      .then((response) => {
        if(response.data.data.departmentId !== null){
          if (permissions[location.pathname].indexOf(3) !== -1) {
            history.push(
              location.pathname + `/edit/${Id}`
            );
          } else {
            openErrorNotification("Bạn không có quyền thực hiện hành động này");
          }
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

  const handleAdd = () => {
    if (permissions[location.pathname].indexOf(2) !== -1) {
      history.push(location.pathname + "/add");
    } else {
      openErrorNotification("Bạn không có quyền thực hiện hành động này");
    }
  }

  const fetch = (params = {}) => {
    setLoading(true);
    initValue.pageIndex = params.pagination.current;
    initValue.pageSize = params.pagination.pageSize;
    initValue.departmentCode = props.departmentCode;
    initValue.departmentName = props.departmentName
    initValue.status=(props.status!==""?Number(props.status):"");
    let url = `/api/department/search`;
    axiosInstance
      .post(url, initValue)
      .then((response) => {
        let data = response.data.data.list;
        if (data.length > 0) {
          let totalRecord = response.data.data.count;
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
          handleDelete();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xóa phòng ban này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách phòng ban</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAdd}
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
                dataSource={data}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
                locale={{
                  emptyText: (
                    <Empty description={<span>Không có dữ liệu</span>}/>
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
