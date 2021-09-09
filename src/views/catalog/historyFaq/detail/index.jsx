import React, { useEffect, useState } from "react";
import "./style.less";
import { CCard, CCol, CRow } from "@coreui/react";
import { Button, Row, Col, Avatar, Pagination, Empty, Modal, Spin } from "antd";
import { useParams } from "react-router";
import axiosInstance from "../../../../axios";
import { openErrorNotification } from "../../../base/notification/notification";
import moment from "moment";
import { useHistory, useLocation } from "react-router";
import Image1 from "../../../../assets/imgs/img-1.png";
import Image2 from "../../../../assets/imgs/img-2.png";

const Detail = (props) => {
  const [listResponse, setListResponse] = useState([]);
  const [fQA, setFQA] = useState({});
  const [pagination, setPagination] = useState({
    current: 1,
    total: 0,
    pageSize: 10,
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [spinning, setSpinning] = useState(true);
  const [exportSpinning, setExportSpinning] = useState(false);
  const { id } = useParams();
  const history = useHistory();
  const location = useLocation();

  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    history.push(url);
  };

  const handleResponse = (item, index) => {
    let qa = [];
    let question = item.listEmployeeQuestion;
    let answer = item.listEmployeeAnswer;
    if (question.hisFaqDetailName) {
      qa.push(
        <Row
          key={2 * index + 1}
          gutter={24}
          style={{
            alignItems: "center",
            marginLeft: 19,
            marginBottom: 10,
            marginRight: 19,
            paddingBottom: 10,
            borderBottom: "1px solid lightgray",
          }}
        >
          <Col style={{ paddingRight: "0px" }}>
            <Avatar src={Image1} />
          </Col>
          <Col sm={12}>
            <div>
              <b>
                {!question.employeePostOfficeCode ? (question.employeeCodeQuestion +' - '+ question.employeeNameQuestion) : (question.employeePostOfficeCode +' - '+question.employeeCodeQuestion +' - '+ question.employeeNameQuestion)}
              </b>
            </div>
            <div style={{ color: "gray" }}>{question.hisFaqDetailName}</div>
          </Col>
          <Col sm={3}></Col>
          <Col sm={3}></Col>
          <Col sm={4}>
            <div>Thời gian</div>
            <div style={{ color: "gray" }}>
              {question.createdDateResult
                ? question.createdDateResult.substr(
                    0,
                    question.createdDateResult.lastIndexOf(":")
                  )
                : ""}
            </div>
          </Col>
        </Row>
      );
    }
    if (answer.answer) {
      qa.push(
        <Row
          key={2 * index + 2}
          gutter={24}
          style={{
            alignItems: "center",
            marginLeft: 19,
            marginBottom: 10,
            marginRight: 19,
            paddingBottom: 10,
            borderBottom: "1px solid lightgray",
          }}
        >
          <Col style={{ paddingRight: "0px" }}>
            <Avatar src={Image2} />
          </Col>
          <Col sm={12}>
            <div>
              <b className="text-danger">
                {answer.departmentName} ( {!answer.employeePostOfficeCodeAnswer  ? (answer.employeeCodeAnswer +' - '+ answer.employeeNameAnswer) : (answer.employeePostOfficeCodeAnswer +' - '+answer.employeeCodeAnswer +' - '+ answer.employeeNameAnswer)})
              </b>
            </div>
            <div style={{ color: "gray" }}>{answer.answer}</div>
          </Col>
          <Col sm={3}></Col>
          <Col sm={3}></Col>
          <Col sm={4}>
            <div>Thời gian</div>
            <div style={{ color: "gray" }}>
              {answer.answerDateResult
                ? answer.answerDateResult.substr(
                    0,
                    answer.answerDateResult.lastIndexOf(":")
                  )
                : ""}
            </div>
          </Col>
        </Row>
      );
    }
    return qa;
  };

  const fetchAnswer = (page, pageSize) => {
    setSpinning(true);
    axiosInstance
      .post("/api/historyFaqs/searchHisFaqId", {
        historyFaqId: id,
        page: page,
        pageSize: pageSize ? pageSize : pagination.pageSize,
      })
      .then((response) => {
        let data = response.data.data;
        if (data.length > 0) {
          setPagination({
            ...pagination,
            total: data[0].totalRecord,
          });
          let arr = [];
          for (let i = 0; i < data.length; i++) {
            arr = arr.concat(handleResponse(data[i], i));
          }
          setListResponse(arr);
        } else {
          setPagination({
            ...pagination,
            total: 0,
          });
          setListResponse([]);
        }
        setSpinning(false);
      });
  };

  useEffect(() => {
    axiosInstance
      .get("/api/historyFaqs/detailByHisFaq?historyFaqId=" + id)
      .then((response) => {
        let data = response.data.data;
        setFQA({
          historyFaqName: data.historyFaqName,
          topicName: data.topicName,
          createDateResult: data.createDateResult,
          employeeCode: data.employeeCode,
          employeeName: data.employeeName,
          fullName: data.fullName,
          status: data.status,
        });
      });

    fetchAnswer(1);
    props.onDispatch();
  }, [id]);

  const handleExport = () => {
    setShowConfirm(false);
    setExportSpinning(true);
    axiosInstance
      .post("/api/historyFaqs/exportHistoryDetail", {
        historyFaqId: Number(id),
      })
      .then((response) => {
        setExportSpinning(false);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `Chi tiết lịch sử hỏi đáp_${moment().format(
          "YYMMDD_HHmmss"
        )}.xlsx`;
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  const handleChange = (current, pageSize) => {
    fetchAnswer(current, pageSize);
  };

  const handleShowSizeChange = (current, pageSize) => {
    setPagination({
      ...pagination,
      pageSize: pageSize,
    });
    fetchAnswer(current, pageSize);
  };

  let responses = <Empty description="Không có phản hồi"></Empty>;
  if (listResponse.length > 0) {
    responses = listResponse;
  } else {
  }

  let statusEl = <>&nbsp;</>;
  if (fQA.status === 1) {
    statusEl = (
      <div style={{ color: "rgb(115, 119, 123)" }}> Chưa trả lời </div>
    );
  } else if (fQA.status === 2) {
    statusEl = <div style={{ color: "#1890ff" }}> Đã trả lời </div>;
  } else if (fQA.status === 3) {
    statusEl = <div style={{ color: "#ff4d4f" }}> Hết hạn trả lời </div>;
  } else if (fQA.status === 4) {
    statusEl = <div style={{ color: "#73777b" }}> Đã đóng </div>;
  } else if (fQA.status === 5) {
    statusEl = <div style={{ color: "#73777b" }}> Đã huỷ </div>;
  }

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
      <Spin spinning={spinning}>
        <Spin tip="Đang export..." spinning={exportSpinning}>
          <CRow>
            <CCol>
              <CCard id="question-box">
                <CRow className="top-box">
                  <CCol md="6">
                    <p
                      className="m-3"
                      style={{
                        fontSize: "1.5rem",
                        color: "black",
                      }}
                    >
                      Câu hỏi
                    </p>
                  </CCol>
                  <CCol md="6" className="d-flex justify-content-end">
                    <Button
                      className="mt-3"
                      type="danger"
                      onClick={() => {
                        setShowConfirm(true);
                      }}
                    >
                      Export
                    </Button>
                    <Button
                      className="m-3"
                      onClick={() => {
                        goBack();
                      }}
                    >
                        Quay lại
                    </Button>
                  </CCol>
                </CRow>
                <Row
                  className="top-box"
                  gutter={24}
                  style={{
                    alignItems: "center",
                    marginLeft: 19,
                    marginBottom: 10,
                    marginRight: 19,
                    paddingBottom: 10,
                  }}
                >
                  <Col style={{ paddingRight: "0px" }}>
                    <Avatar src={Image1} />
                  </Col>
                  <Col sm={12}>
                    <div>
                      <b>{fQA.fullName}</b>
                    </div>
                    <div>{fQA.historyFaqName}</div>
                  </Col>
                  <Col sm={3}>
                    <div>Trạng thái</div>
                    {statusEl}
                  </Col>
                  <Col sm={3}>
                    <div>Chủ đề</div>
                    <div
                      style={{
                        color: "#1890ff",
                      }}
                    >
                      {fQA.topicName ? fQA.topicName : <>&nbsp;</>}
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div>Thời gian hỏi</div>
                    <div>
                      {fQA.createDateResult ? (
                        fQA.createDateResult.substr(
                          0,
                          fQA.createDateResult.lastIndexOf(":")
                        )
                      ) : (
                        <>&nbsp;</>
                      )}
                    </div>
                  </Col>
                </Row>
              </CCard>
              <CCard>
                <CRow>
                  <CCol md="6">
                    <p
                      className="m-3"
                      style={{
                        fontSize: "1.5rem",
                        color: "black",
                      }}
                    >
                      Phản hồi
                    </p>
                  </CCol>
                </CRow>
                {responses}
                {listResponse.length > 0 ? (
                  <Row
                    style={{ marginBottom: "10px" }}
                    className="ant-row-end mr-3"
                  >
                    <Pagination
                      defaultCurrent={pagination.current}
                      total={pagination.total}
                      onChange={handleChange}
                      onShowSizeChange={handleShowSizeChange}
                      showTotal={(total, range) =>
                        `${range[0]}-${range[1]} / ${total} bản ghi`
                      }
                      showSizeChanger
                      pageSizeOptions={["10", "15", "20"]}
                    />
                  </Row>
                ) : null}
              </CCard>
            </CCol>
          </CRow>
        </Spin>
      </Spin>
    </>
  );
};

export default Detail;
