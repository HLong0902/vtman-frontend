import React, { createRef, useState, useEffect } from "react";
import "./style.less";
import { useDropzone } from "react-dropzone";
import styled from "styled-components";
import { Button, Modal } from "antd";
import XLSX from "xlsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { openErrorNotification } from "../../../../base/notification/notification";

const getColor = (props) => {
  if (props.isDragAccept) {
    return "#00e676";
  }
  if (props.isDragReject) {
    return "#ff1744";
  }
  if (props.isDragActive) {
    return "#2196f3";
  }
  return "#eeeeee";
};

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border-width: 2px;
  border-radius: 2px;
  border-color: ${(props) => getColor(props)};
  border-style: dashed;
  background-color: #fafafa;
  color: #bdbdbd;
  outline: none;
  transition: border 0.24s ease-in-out;
  width: 100% !important;
`;

const validateTemplate = (ws) => {
  const columnHeaders = [];
  for (let key in ws) {
    let regEx = new RegExp("^(\\w)(1){1}$");
    if (regEx.test(key) === true) {
      columnHeaders.push(ws[key].v);
    }
  }
  if (columnHeaders.length > 6) {
    return false;
  }
  let valid = true;
  valid = valid && columnHeaders[0] === "Câu hỏi";
  valid = valid && columnHeaders[1] === "Câu trả lời";
  valid = valid && columnHeaders[2] === "Mã chủ đề";
  valid = valid && columnHeaders[3] === "STT";
  valid = valid && columnHeaders[4] === "Ghi chú";
  valid = valid && columnHeaders[5] === "Trạng thái";
  return valid;
};

const Dropzone = ({ setFileData, onDownloadTemplate, removeFile }) => {
  const [myFiles, setMyFiles] = useState([]);
  const [myData, setMyData] = useState([]);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      openErrorNotification(
        "Hệ thống chỉ hỗ trợ upload 1 file, vui lòng kiểm tra lại"
      );
      return;
    }
    let error = 0;
    if (!/(\.xls|\.xlsx)$/.test(acceptedFiles[0].name)) {
      error++;
      openErrorNotification("Tệp không đúng định dạng xlsx, xls, XLS, XLSX");
    }
    if (acceptedFiles[0].size === 0) {
      error++;
      openErrorNotification(
        "Hệ thống chỉ hỗ trợ upload file có dung lượng lớn hơn 0 MB, vui lòng kiểm tra lại"
      );
    }
    if (acceptedFiles[0].size > 5000000) {
      error++;
      openErrorNotification(
        "Hệ thống chỉ hỗ trợ upload file có dung lượng nhỏ hơn 5MB, vui lòng kiểm tra lại"
      );
    }
    if (error === 0) {
      handleFile(acceptedFiles[0]);
    } else {
    }
  };

  const uploadFile = (acceptedFiles, data) => {
    setMyFiles([...acceptedFiles]);
    setFileData(data ? data : myData);
    setShowUploadConfirm(false);
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
    acceptedFiles,
  } = useDropzone({ onDrop });

  const handleFile = (file) => {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onabort = () => console.log("file reading was aborted");
    reader.onerror = () => console.log("file reading has failed");

    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? "binary" : "array",
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];

      if (validateTemplate(ws)) {
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_json(ws);
        if (data.length > 1000) {
          openErrorNotification(
            "Hệ thống chỉ hỗ trợ upload file nhỏ hơn hoặc bằng 1000 dòng, vui lòng kiểm tra lại"
          );
          // setMyFiles([]);
        } else if (data.length === 0) {
          openErrorNotification("File không có dữ liệu, vui lòng kiểm tra lại");
          // setMyFiles([]);
        } else {
          setMyData(data);
          if (myFiles.length > 0) {
            setShowUploadConfirm(true);
          } else {
            uploadFile([file], data);
          }
        }
      } else {
        openErrorNotification(
          "File không đúng template, vui lòng kiểm tra lại"
        );
      }
    };

    if (rABS) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const dropzoneRef = createRef();
  const openDialog = () => {
    if (dropzoneRef.current) {
      dropzoneRef.current.open();
    }
  };

  let files = myFiles.map((file) => (
    <ol key={file.path} style={{ color: "black", paddingLeft: "0px" }}>
      <FontAwesomeIcon
        icon={faFileExcel}
        className="mr-3"
        style={{
          color: "green",
        }}
      />
      {file.path} - {file.size} bytes
    </ol>
  ));

  const downloadTemplate = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDownloadTemplate();
  };

  useEffect(() => {
    if (removeFile) {
      setMyFiles([]);
    }
    return () => {};
  }, [removeFile]);

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
        visible={showUploadConfirm}
        onOk={() => uploadFile(acceptedFiles)}
        onCancel={() => {
          setShowUploadConfirm(false);
        }}
        zIndex={9999}
        okText="Tiếp tục"
        cancelText="Huỷ bỏ"
      >
        Tệp tin dữ liệu mới sẽ đè lên tệp tin dữ liệu cũ, bạn có muốn tiếp tục
        không?
      </Modal>
      <div className="container">
        <Container
          {...getRootProps({
            isDragActive,
            isDragAccept,
            isDragReject,
            className: "dropzone",
          })}
        >
          <input {...getInputProps()} />
          <div>
            Tải danh sách mẫu{" "}
            <a href="/" onClick={downloadTemplate}>
              tại đây
            </a>
          </div>
          <aside className="h5">
            <ul className="mt-3 mb-3 p-0">{files}</ul>
          </aside>
          {files.length > 0 ? (
            <div className="row">
              <Button
                className="float-right"
                type="primary"
                onClick={openDialog}
                danger
              >
                <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
                Tải lại tập tin
              </Button>
            </div>
          ) : (
            <div className="row">
              <div className="d-flex align-items-center mr-2">
                Kéo để thả lên hoặc
              </div>
              <Button
                className="float-right"
                type="primary"
                onClick={openDialog}
                danger
              >
                <FontAwesomeIcon icon={faFolderOpen} className="mr-2" />
                Chọn tập tin
              </Button>
            </div>
          )}
        </Container>
      </div>
    </>
  );
};

export default Dropzone;
