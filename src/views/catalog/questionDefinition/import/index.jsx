import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCardHeader, CRow } from "@coreui/react";
import "./style.less";
import { Modal, Button, Spin } from "antd";
import DropZone from "./dropzone";
import Result from "./result";
import { manipulateData } from "./utils";
import { useHistory, useLocation } from "react-router";
import axiosInstance, { BASE_URL } from "../../../../axios";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  openNotification,
  openErrorNotification,
} from "../../../base/notification/notification";

const ImportQuestionDefinition = (props) => {
  const [fileData, setFileData] = useState([]);
  const [noErrorData, setNoErrorData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const [spinning, setSpinning] = useState(false);
  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    history.push(url);
  };

  const handleBack = () => {
    if (fileData.length > 0) {
      setShowConfirmBack(true);
    } else {
      goBack();
    }
  };

  const checkData = async (data) => {
    const [noErrorData, errorData] = await manipulateData(data);
    setNoErrorData(noErrorData);
    setErrorData(errorData);
  };

  const getErrorData = (page, pageSize = 10) => {
    return errorData.slice(
      pageSize * (page - 1),
      pageSize * (page - 1) + pageSize
    );
  };

  const getNoErrorData = (page, pageSize = 10) => {
    return noErrorData.slice(
      pageSize * (page - 1),
      pageSize * (page - 1) + pageSize
    );
  };

  const handleSaveListQuestionDefinition = async () => {
    setShowConfirm(false);
    setSpinning(true);
    let temp = noErrorData.map((data) => ({
      ...data,
      numberOrder: Number(data.numberOrder),
      status: Number(data.status),
    }));
    axiosInstance
      .post("/api/question/importExcel", {
        data: temp,
        createdBy: user.employeeId,
      })
      .then((response) => {
        setSpinning(false);
        let code = response.data.code;
        if (code === "70") {
          let data = response.data.data;
          if (data.length > 0) {
            if (temp.length === data.length) {
              openErrorNotification(
                "Câu hỏi tự định nghĩa đã tồn tại trên hệ thống"
              );
            } else {
              openNotification("Import câu hỏi tự định nghĩa thành công");
            }

            data = data.map((item) => {
              return {
                ...item.listValid,
                status: `${item.listValid.status}`,
                errors: ["Câu hỏi tự định nghĩa đã tồn tại trên hệ thống"],
              };
            });
            setErrorData([...errorData, ...data]);
          } else {
            openNotification("Import câu hỏi tự định nghĩa thành công");
            if (errorData.length === 0) {
              goBack();
            }
          }
          setNoErrorData([]);
        }
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  const handleExportFile = async () => {
    let dataTemp = errorData.map((data) => {
      return {
        answerDefinition: data.answerDefinition,
        description: data.description,
        numberOrderStr: data.numberOrder,
        questionDefinitionName: data.questionDefinitionName,
        statusStr: data.status,
        topicCode: data.topicCode,
        messageError: data.errors.join(","),
      };
    });
    setShowExportConfirm(false);
    setSpinning(true);
    axiosInstance
      .post(
        "/api/question/export/Excel/failQuestionTemplate",
        JSON.stringify(dataTemp),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        setSpinning(false);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `Danh sách câu hỏi lỗi_${moment().format(
          "YYMMDD_HHmmss"
        )}.xlsx`;
        link.click();
        document.body.removeChild(link);
        openNotification("Export dữ liệu thành công");
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  useEffect(() => {
    checkData(fileData);
    return () => {};
  }, [fileData]);

  const editedQuestionDefinition = (id, questionDefinition) => {
    let d = errorData.filter((item) => item.id !== id);
    openNotification("Sửa bản ghi lỗi thành công");
    setErrorData(d);
    setNoErrorData([
      ...noErrorData,
      { ...questionDefinition, status: `${questionDefinition.status}` },
    ]);
  };

  const downloadTemplate = () => {
    window.open(
      `${BASE_URL}/api/question/import/download/failQuestionTemplate`,
      "_blank"
    );
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
        visible={showConfirmBack}
        onOk={() => {
          setShowConfirmBack(false);
          goBack();
        }}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        zIndex={9999}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác import này không?
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
        onOk={handleSaveListQuestionDefinition}
        onCancel={() => {
          setShowConfirm(false);
        }}
        zIndex={9999}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc muốn lưu các câu hỏi không lỗi này không?
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
        visible={showExportConfirm}
        onOk={handleExportFile}
        onCancel={() => {
          setShowExportConfirm(false);
        }}
        zIndex={9999}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc muốn tải xuống các bản ghi lỗi này không?
      </Modal>
      <Spin spinning={spinning}>
        <CCard>
          <CCardHeader>
            <h5 className="header">Tải lên tập tin</h5>
          </CCardHeader>
          <CCardBody>
            <DropZone
              setFileData={setFileData}
              onDownloadTemplate={downloadTemplate}
            />
          </CCardBody>
          <CCardBody>
            <Result
              noErrorData={getNoErrorData(1)}
              errorData={getErrorData(1)}
              getNoErrorData={getNoErrorData}
              getErrorData={getErrorData}
              totalErrorData={errorData.length}
              totalNoErrorData={noErrorData.length}
              editedQuestionDefinition={editedQuestionDefinition}
            />
            <div>
              <CRow
                style={{
                  marginRight: "0px",
                  float: "right",
                }}
              >
                <Button className="mt-2 mb-2 mr-2" onClick={handleBack}>
                  Huỷ
                </Button>
                <Button
                  className="mt-2 mb-2 mr-2"
                  danger
                  disabled={errorData.length === 0}
                  onClick={() => setShowExportConfirm(true)}
                >
                  Tải xuống bản ghi lỗi
                </Button>
                <Button
                  type="primary"
                  danger
                  className="mt-2 mb-2"
                  disabled={noErrorData.length === 0}
                  onClick={() => setShowConfirm(true)}
                >
                  Lưu bản ghi không lỗi
                </Button>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      </Spin>
    </>
  );
};

export default ImportQuestionDefinition;
