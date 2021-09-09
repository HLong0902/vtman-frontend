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
import { sortStringFunc, sortNumberFunc } from "../../../../reusable/utils";

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
  const [selectedTopicId, setSelectedTopicId] = useState(undefined);
  const [sortedInfo, setSortedInfo] = useState({});

  const history = useHistory();
  const location = useLocation();

  const columns = [
    {
      title: "Mã chủ đề",
      dataIndex: "topicCode",
      key: "topicCode",
      sorter: (a, b) => sortStringFunc(a, b, "topicCode"),
      sortOrder: sortedInfo?.columnKey === "topicCode" && sortedInfo?.order,
      width: "8%",
      render: (topicCode) => (
        <div>
            {topicCode}
        </div>
      ),
    },
    {
      title: "Tên chủ đề",
      dataIndex: "topicName",
      key: "topicName",
      sorter: (a, b) => sortStringFunc(a, b, "topicName"),
      sortOrder: sortedInfo?.columnKey === "topicName" && sortedInfo?.order,
      width: "17%",
      render: (topicName) => (
        <div>
            {topicName}
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
      width: "17%",
      render: (topic) => (
        <div>
            {topic.departmentName}
        </div>
      ),
    },
    {
      title: "Đầu mối trả lời",
      dataIndex: "answerEmployeeName",
      key: "answerEmployeeName",
      sorter: (a, b) => sortStringFunc(a, b, "answerEmployeeName"),
      sortOrder:
        sortedInfo?.columnKey === "answerEmployeeName" && sortedInfo?.order,
      width: "17%",
      render: (answerEmployeeName) => (
        <div>
            {answerEmployeeName}
        </div>
      ),
    },
    {
      title: "Thứ tự",
      align: "center",
      dataIndex: "numberOrder",
      key: "numberOrder",
      sorter: (a, b) => sortNumberFunc(a, b, "numberOrder"),
      sortOrder: sortedInfo?.columnKey === "numberOrder" && sortedInfo?.order,
      width: "6%",
      render: (numberOrder) => (
        <div style={{ textAlign: "center" }}>{numberOrder}</div>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => sortStringFunc(a, b, "description"),
      sortOrder: sortedInfo?.columnKey === "description" && sortedInfo?.order,
      width: "17%",
      render: (description) => (
        <div>
            {description}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) =>
        status === 1 ? (
          <div style={{ color: "#1890ff" }}>• Hoạt động</div>
        ) : (
          <div style={{ color: "#73777b" }}>• Không hoạt động</div>
        ),
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "8%",
      render: (topic) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              onClick={(e) => {
                e.preventDefault();
                handleEditTopic(topic.topicId);
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
                setSelectedTopicId(topic.topicId);
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

  const handleDeleteTopic = () => {
    axiosInstance
      .get("/api/topic/delete", {
        params: {
          topicId: selectedTopicId,
        },
      })
      .then((response) => {
        if (response.data.code === "50") {
          openErrorNotification(
            "Hiện tại chủ đề có chứa câu hỏi, bạn không thể thực hiện thao tác này"
          );
        } else {
          openNotification("Xoá chủ để thành công");
          fetch({
            pagination,
            sortField: sortedInfo.columnKey,
            sortOrder: sortedInfo.order,
          });
        }
      })
      .catch((error) => {
        let code = error.response?.data?.code;
        if (code === "401") {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({ pagination });
        }
      });
  };

  useEffect(() => {
    setData(props.dataSource);
    setPagination({
      ...pagination,
      total: props.totalTopic,
      current: 1,
    });
    setSortedInfo({});
  }, [props.dataSource, props.totalTopic]);

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

  const handleAddTopic = () => {
    history.push(location.pathname + "/add");
  };

  const handleEditTopic = (topicId) => {
    history.push(location.pathname + `/edit/${topicId}`);
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
      .get("/api/topic/search", {
        params: {
          pageSize: params.pagination.pageSize,
          page: params.pagination.current,
          topicName: encodeURIComponent(props.topicName),
          departmentId:
            props.departmentId === "undefined" ? "" : props.departmentId,
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
          handleDeleteTopic();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá chủ đề này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách chủ đề</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={handleAddTopic}
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
                rowKey={(record) => record.topicId}
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
