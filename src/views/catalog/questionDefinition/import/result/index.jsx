import { CCard } from "@coreui/react";
import React, { useEffect, useState } from "react";
import EditModal from "../edit-modal";
import { Table, Tabs, Empty } from "antd";
import "./style.less";

const { TabPane } = Tabs;
const PAGE_SIZE = 10;

const Result = ({
  noErrorData,
  errorData,
  totalErrorData,
  totalNoErrorData,
  getErrorData,
  getNoErrorData,
  editedQuestionDefinition,
}) => {
  const [noErrorPagination, setNoErrorPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: totalNoErrorData,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
    showSizeChanger: true,
    pageSizeOptions: ["10", "15", "20"],
  });
  const [errorPagination, setErrorPagination] = useState({
    current: 1,
    pageSize: PAGE_SIZE,
    total: totalErrorData,
    showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bản ghi`,
    showSizeChanger: true,
    pageSizeOptions: ["10", "15", "20"],
  });
  const [loading, setLoading] = useState(false);
  const [noErrorTableData, setNoErrorTableData] = useState([]);
  const [errorTableData, setErrorTableData] = useState([]);

  useEffect(() => {
    setNoErrorTableData(noErrorData);
    setErrorTableData(errorData);
  }, [noErrorData, errorData]);

  useEffect(() => {
    setErrorPagination({
      ...errorPagination,
      total: totalErrorData,
    });
  }, [totalErrorData]);

  useEffect(() => {
    setNoErrorPagination({
      ...errorPagination,
      total: totalNoErrorData,
    });
  }, [totalNoErrorData]);

  const handleNoErrorTableChange = (pagination, filters, sorter) => {
    setNoErrorTableData(
      getNoErrorData(pagination.current, pagination.pageSize)
    );
    setNoErrorPagination({
      ...noErrorPagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const handleErrorTableChange = (pagination, filters, sorter) => {
    setErrorTableData(getErrorData(pagination.current, pagination.pageSize));
    setErrorPagination({
      ...errorPagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const getColumns = (isErrorTable) => {
    let columns = [
      {
        title: "Câu hỏi",
        dataIndex: "questionDefinitionName",
        width: !isErrorTable ? "26%" : "15.25%",
        render: (questionDefinitionName) => {
          let result = (
            <div>
              {questionDefinitionName}
            </div>
          );
          if (isErrorTable) {
            result = (
              <div>
                {questionDefinitionName}
              </div>
            );
          }
          return result;
        },
      },
      {
        title: "Câu trả lời",
        dataIndex: "answerDefinition",
        width: !isErrorTable ? "26%" : "15.25%",
        render: (answerDefinition) => (
          <div
            style={{ wordWrap: "break-word" }}
            dangerouslySetInnerHTML={{
              __html: answerDefinition,
            }}
          ></div>
        ),
      },
      {
        title: "Chủ đề",
        dataIndex: "",
        width: "15%",
        render: (questionDefinition) => (
          <div>
            {questionDefinition.topicName}
          </div>
        ),
      },
      {
        title: "Thứ tự",
        align: "center",
        dataIndex: "numberOrder",
        width: "6%",
        render: (numberOrder) => (
          <div className="text-center">{numberOrder}</div>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "description",
        width: !isErrorTable ? "17%" : "15.25%",
        render: (description) => {
          let result = (
            <div>
              {description}
            </div>
          );
          if (isErrorTable) {
            result = (
              <div>
                {description}
              </div>
            );
          }
          return result;
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: "10%",
        render: (status) =>
          status === "1" ? (
            <div style={{ color: "#1890ff" }}>• Hoạt động</div>
          ) : status === "0" ? (
            <div style={{ color: "#73777b" }}>• Không hoạt động</div>
          ) : (
            ""
          ),
      },
    ];
    if (isErrorTable) {
      columns = [
        ...columns,
        {
          title: "Chi tiết lỗi",
          dataIndex: "",
          width: "15.25%",
          render: (questionDefinition) => {
            let text = "";
            if (questionDefinition.errors) {
              text = questionDefinition.errors.join(" , ");
            }
            return (
              <div className="text-danger">
                {text}
              </div>
            );
          },
        },
        {
          className: "remove-word-break",
          title: "Hành động",
          dataIndex: "",
          width: "8%",
          render: (questionDefinition) => (
            <EditModal
              questionDefinition={questionDefinition}
              editedQuestionDefinition={editedQuestionDefinition}
            ></EditModal>
          ),
        },
      ];
    }
    return columns;
  };

  return (
    <>
      <CCard>
        <h5 className="m-3 header">
          Danh sách câu hỏi tự định nghĩa ({totalErrorData + totalNoErrorData})
        </h5>
        <div className="col-12">
          <Tabs defaultActiveKey="1">
            <TabPane tab={`Bản ghi không lỗi (${totalNoErrorData})`} key="1">
              <Table
                className="question-table table-data"
                columns={getColumns(false)}
                rowKey={(record) => record.id}
                dataSource={noErrorTableData}
                pagination={noErrorPagination}
                loading={loading}
                onChange={handleNoErrorTableChange}
                locale={{
                  emptyText: (
                    <Empty description={<span>Không có dữ liệu</span>} />
                  ),
                }}
              />
            </TabPane>
            <TabPane tab={`Bản ghi lỗi (${totalErrorData})`} key="2">
              <Table
                className="question-table"
                columns={getColumns(true)}
                rowKey={(record) => record.id}
                dataSource={errorTableData}
                pagination={errorPagination}
                loading={loading}
                onChange={handleErrorTableChange}
                locale={{
                  emptyText: (
                    <Empty description={<span>Không có dữ liệu</span>} />
                  ),
                }}
              />
            </TabPane>
          </Tabs>
        </div>
      </CCard>
    </>
  );
};

export default Result;
