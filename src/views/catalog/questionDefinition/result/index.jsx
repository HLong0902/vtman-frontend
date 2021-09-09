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
  const [selectedQuestionDefinitionId, setSelectedQuestionDefinitionId] =
    useState(undefined);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [sortedInfo, setSortedInfo] = useState({});

  const history = useHistory();
  const location = useLocation();

  const columns = [
    {
      title: "Câu hỏi",
      dataIndex: "questionDefinitionName",
      key: "questionDefinitionName",
      sorter: (a, b) => sortStringFunc(a, b, "questionDefinitionName"),
      sortOrder:
        sortedInfo?.columnKey === "questionDefinitionName" && sortedInfo?.order,
      width: "22%",
      render: (questionDefinitionName) => (
        <div>
          {questionDefinitionName}
        </div>
      ),
    },
    {
      title: "Câu trả lời",
      dataIndex: "",
      key: "answerDefinition",
      sorter: (a, b) => sortStringFunc(a, b, "answerDefinition"),
      sortOrder:
        sortedInfo?.columnKey === "answerDefinition" && sortedInfo?.order,
      width: "22%",
      render: (questionDefinition) => (
        <div
          dangerouslySetInnerHTML={{
            __html: questionDefinition.answerDefinition,
          }}
        ></div>
      ),
    },
    {
      title: "Chủ đề",
      dataIndex: "topicName",
      key: "topicName",
      sorter: (a, b) => sortStringFunc(a, b, "topicName"),
      sortOrder: sortedInfo?.columnKey === "topicName" && sortedInfo?.order,
      width: "15%",
      render: (topicName) => (
        <div>
          {topicName}
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
      title: "Ghi chú",
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
      render: (questionDefinition) => (
        <div className="text-center">
          {permissions[location.pathname].indexOf(3) !== -1 ? (
            <a
              href=""
              style={{
                color: "rgb(24, 144, 255)",
              }}
              className="mr-2"
              onClick={(e) => {
                e.preventDefault();
                handleEditQuestionDefinition(
                  questionDefinition.questionDefinitionId
                );
              }}
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
                setSelectedQuestionDefinitionId(
                  questionDefinition.questionDefinitionId
                );
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

  const handleDeleteQuestionDefinition = () => {
    axiosInstance
      .get("/api/question/delete", {
        params: {
          questionDefinitionId: selectedQuestionDefinitionId,
        },
      })
      .then((data) => {
        openNotification("Xoá câu hỏi tự định nghĩa thành công");
        fetch({
          pagination,
          sortField: sortedInfo.columnKey,
          sortOrder: sortedInfo.order,
        });
      })
      .catch((error) => {
        let code = error.response?.data?.code;
        if (code === "402") {
          openErrorNotification("Bản ghi không tồn tại trên hệ thống");
          fetch({ pagination });
        }
      });
  };

  useEffect(() => {
    setData(props.dataSource);
    setPagination({
      ...pagination,
      total: props.totalQuestionDefinition,
      current: 1,
    });
    setSortedInfo({});
  }, [props.dataSource, props.totalQuestionDefinition]);

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

  const handleAddQuestionDefinition = () => {
    history.push(location.pathname + "/add");
  };

  const handleEditQuestionDefinition = (selectedQuestionDefinitionId) => {
    history.push(location.pathname + `/edit/${selectedQuestionDefinitionId}`);
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
      .get("/api/question/search", {
        params: {
          pageSize: params.pagination.pageSize,
          page: params.pagination.current,
          questionDefinitionName: encodeURIComponent(
            props.questionDefinitionName
          ),
          answerDefinition: encodeURIComponent(props.answerDefinition),
          topicId: props.topicId === "undefined" ? "" : props.topicId,
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

  const handleImportQuestionDefinition = () => {
    history.push(location.pathname + "/import");
  };

  const handleExportFile = async () => {
    setShowExportConfirm(false);
    props.onExportFile();
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
        onOk={handleExportFile}
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
          handleDeleteQuestionDefinition();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá câu hỏi tự định nghĩa này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Danh sách câu hỏi tự định nghĩa</h5>
              </CCol>
              <CCol md="6" className="d-flex justify-content-end">
                <Button
                  className="mt-3 mr-3"
                  type="primary"
                  onClick={handleImportQuestionDefinition}
                  danger
                  disabled={permissions[location.pathname].indexOf(2) === -1}
                >
                  Import
                </Button>
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
                  className="m-3"
                  type="primary"
                  onClick={handleAddQuestionDefinition}
                  danger
                  disabled={permissions[location.pathname].indexOf(2) === -1}
                >
                  Thêm mới
                </Button>
              </CCol>
            </CRow>
            <div className="col-12">
              <Table
                className="question-table table-data"
                columns={columns}
                rowKey={(record) => record.questionDefinitionId}
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
