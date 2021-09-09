/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Empty } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { useHistory, useLocation } from "react-router-dom";
import "./style.less";
import { openErrorNotification } from "../../../base/notification/notification";
import { sortStringFunc, sortDateFunc } from "../../../../reusable/utils";

const SearchResult = (props) => {
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
  const [sortedInfo, setSortedInfo] = useState({});
  const location = useLocation();

  const history = useHistory();

  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "historyFaqName",
      key: "historyFaqName",
      sorter: (a, b) => sortStringFunc(a, b, "historyFaqName"),
      sortOrder:
        sortedInfo?.columnKey === "historyFaqName" && sortedInfo?.order,
      width: "10%",
      render: (historyFaqName) => (
        <div>
          {historyFaqName != null
              ?  historyFaqName
              : ""}
        </div>
      ),
    },
    {
      title: "Câu trả lời",
      dataIndex: "answer",
      key: "answer",
      sorter: (a, b) => sortStringFunc(a, b, "answer"),
      sortOrder: sortedInfo?.columnKey === "answer" && sortedInfo?.order,
      width: "10%",
      render: (answer) => (
        <div>
          {answer != null
              ? answer
              : ""}
        </div>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "topicName",
      key: "topicName",
      sorter: (a, b) => sortStringFunc(a, b, "topicName"),
      sortOrder: sortedInfo?.columnKey === "topicName" && sortedInfo?.order,
      width: "10%",
      render: (topicName) => (
        <div style={{ color: "#1890ff" }}>{topicName}</div>
      ),
    },
    {
      title: "Phòng ban",
      dataIndex: "departmentName",
      key: "departmentName",
      sorter: (a, b) => sortStringFunc(a, b, "departmentName"),
      sortOrder:
        sortedInfo?.columnKey === "departmentName" && sortedInfo?.order,
      width: "10%",
      render: (departmentName) => (
        <div>{departmentName}</div>
      ),
    },
    {
      title: "Người hỏi",
      dataIndex: "fullName",
      key: "fullName",
      sorter: (a, b) => sortStringFunc(a, b, "fullName"),
      sortOrder: sortedInfo?.columnKey === "fullName" && sortedInfo?.order,
      width: "10%",
      render: (fullName) => (
        <div>{fullName}</div>
      ),
    },
    {
      title: "Người trả lời",
      dataIndex: "answerEmployee",
      key: "answerEmployee",
      sorter: (a, b) => sortStringFunc(a, b, "answerEmployee"),
      sortOrder: sortedInfo?.columnKey === "answerEmployee" && sortedInfo?.order,
      width: "10%",
      render: (answerEmployee) => (
        <div>{answerEmployee}</div>
      ),
    },
    {
      className: "remove-word-break",
      title: "Thời gian hỏi",
      dataIndex: "createDateResult",
      key: "createDateResult",
      sorter: (a, b) => sortDateFunc(a, b, "createDateResult"),
      sortOrder:
        sortedInfo?.columnKey === "createDateResult" && sortedInfo?.order,
      width: "11%",
      render: (createDateResult) => (
        <div>
            {createDateResult
              ? createDateResult.substr(0, createDateResult.lastIndexOf(":"))
              : ""}
        </div>
      ),
    },
    {
      className: "remove-word-break",
      title: "Thời gian trả lời",
      dataIndex: "answerDateResult",
      key: "answerDateResult",
      sorter: (a, b) => sortDateFunc(a, b, "answerDateResult"),
      sortOrder:
        sortedInfo?.columnKey === "answerDateResult" && sortedInfo?.order,
      width: "11%",
      render: (answerDateResult) => (
        <div>
            {answerDateResult
              ? answerDateResult.substr(0, answerDateResult.lastIndexOf(":"))
              : ""}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "10%",
      render: (status) => {
        if (status === 1) {
          return <div style={{ color: "#73777b" }}>• Chưa trả lời</div>;
        } else if (status === 2) {
          return <div style={{ color: "#1890ff" }}>• Đã trả lời</div>;
        } else if (status === 3) {
          return <div style={{ color: "#ff4d4f" }}>• Hết hạn trả lời</div>;
        } else if (status === 4) {
          return <div style={{ color: "#73777b" }}>• Đã đóng</div>;
        } else if (status === 5) {
          return <div style={{ color: "#73777b" }}>• Đã huỷ</div>;
        }
      },
    },
    {
      className: "remove-word-break",
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "8%",
      render: (faq) => (
        <div className="text-center">
          <a
            href=""
            style={{
              color: "rgb(24, 144, 255)",
            }}
            onClick={(e) => {
              e.preventDefault();
              history.push(`${location.pathname}/${faq.historyFaqId}`);
            }}
          >
            Xem
          </a>
        </div>
      ),
    },
  ];

  useEffect(() => {
    setLoading(false);
    setPagination({
      ...pagination,
      total: props.totalFaq,
    });
  }, [props.dataSource, props.totalFaq]);

  useEffect(() => {
    setLoading(props.loading);
  }, [props.loading]);

  useEffect(() => {
    if (props.isNewSearch) {
      setPagination({
        ...pagination,
        current: 1,
      });
      setSortedInfo({});
    }
  }, [props.isNewSearch]);

  const handleExport = () => {
    setShowConfirm(false);
    props.onExport();
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
    props.onPagination(
      null,
      params.pagination.current,
      params.pagination.pageSize,
      params.sortField,
      params.sortOrder
    );
    setPagination({
      ...pagination,
      current: params.pagination.current,
      pageSize: params.pagination.pageSize,
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
        onOk={handleExport}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn thực hiện hành động này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách lịch sử hỏi đáp</h5>
              </CCol>
              <CCol md="6">
                <Button
                  className="float-right m-3"
                  type="primary"
                  onClick={() => {
                    if (props.dataSource.length > 0) {
                      setShowConfirm(true);
                    } else {
                      openErrorNotification("Không có dữ liệu để export");
                    }
                  }}
                  danger
                >
                  Export
                </Button>
              </CCol>
            </CRow>
            <div className="col-12">
              <Table
                className="table-data"
                columns={columns}
                rowKey={(record) => record.historyFaqId}
                dataSource={props.dataSource}
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
