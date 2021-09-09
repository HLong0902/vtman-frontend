import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import "./style.less";
import SearchForm from "../search";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import { openErrorNotification } from "../../../base/notification/notification";
import moment from "moment";

const ListHistoryFaq = (props) => {
  const [historyFaqName, setHistoryFaqName] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [answerEmployee, setAnswerEmployee] = useState("");
  const [answer, setAnswer] = useState("");
  const [departmentId, setDepartmentId] = useState("null");
  const [topicId, setTopicId] = useState("null");
  const [status, setStatus] = useState("null");
  const [createdBy, setCreatedBy] = useState("");
  const [startDate, setStartDate] = useState([]);
  const [endDate, setEndDate] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [totalFaq, setTotalFaq] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState([]);

  useEffect(() => {
    handleSearch(null, 1);
    return () => {};
  }, []);

  const handleSearch = (
    values,
    page = 1,
    pageSize = 10,
    sortField,
    sortOrder
  ) => {
    setIsLoading(true);
    if (values) {
      setIsNewSearch(true);
      setHistoryFaqName(values.historyFaqName);
      setAnswer(values.answer);
      setTopicId(values.topicId);
      setDepartmentId(values.departmentId);
      setCreatedBy(values.createdBy);
      setStatus(values.status);

      values.startDate = values.startDate ?? [];
      values.endDate = values.endDate ?? [];

      setStartDate(values.startDate);
      setEndDate(values.endDate);
      setEmployeeName(values.employeeName);
      setAnswerEmployee(values.answerEmployee ?? "");

      values.startDate = values.startDate.map((date) =>
        date ? date.format("yyyy-MM-DD") : ""
      );
      values.endDate = values.endDate.map((date) =>
        date ? date.format("yyyy-MM-DD") : ""
      );
      axiosInstance
        .post("/api/historyFaqs/search", {
          ...values,
          historyFaqName: encodeURIComponent(values.historyFaqName),
          answer: encodeURIComponent(values.answer),
          employeeName: encodeURIComponent(values.employeeName),
          answerEmployee: encodeURIComponent(values.answerEmployee ?? ""),
          status: values.status === "null" ? "" : Number(values.status),
          departmentId:
            values.departmentId === "null" ? "" : values.departmentId,
          topicId: values.topicId === "null" ? "" : values.topicId,
          page: 1,
          pageSize: pageSize,
          sortField: sortField,
          sortOrder: sortOrder,
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalFaq(data[0].totalRecord);
            setData(data);
          } else {
            setTotalFaq(0);
            setData([]);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        });
    } else {
      setIsNewSearch(false);
      axiosInstance
        .post("/api/historyFaqs/search", {
          historyFaqName: encodeURIComponent(historyFaqName),
          answer: encodeURIComponent(answer),
          employeeName: encodeURIComponent(employeeName),
          answerEmployee: encodeURIComponent(answerEmployee),
          startDate: startDate?.map((date) => date ? date.format("yyyy-MM-DD") : ""),
          endDate: endDate?.map((date) => date ? date.format("yyyy-MM-DD") : ""),
          status: status === "null" ? "" : Number(status),
          departmentId: departmentId === "null" ? "" : departmentId,
          topicId: topicId === "null" ? "" : topicId,
          page,
          pageSize: pageSize,
          sortField: sortField,
          sortOrder: sortOrder,
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalFaq(data[0].totalRecord);
            setData(data);
          } else {
            setTotalFaq(0);
            setData([]);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        });
    }
  };
  const handleExportFile = () => {
    setSpinning(true);
    axiosInstance
      .post("/api/historyFaqs/exportHistory", {
        historyFaqName: encodeURIComponent(historyFaqName),
        answer: encodeURIComponent(answer),
        employeeName: encodeURIComponent(employeeName),
        answerEmployee: encodeURIComponent(answerEmployee),
        startDate: startDate?.map((date) => date ? date.format("yyyy-MM-DD") : ""),
        endDate: endDate?.map((date) => date ? date.format("yyyy-MM-DD") : ""),
        status: status === "null" ? "" : Number(status),
        departmentId: departmentId === "null" ? "" : departmentId,
        topicId: topicId === "null" ? "" : topicId,
      })
      .then((response) => {
        setSpinning(false);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `Danh sách lịch sử hỏi đáp_${moment().format(
          "YYMMDD_HHmmss"
        )}.xlsx`;
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  return (
    <>
      <Spin tip="Đang export..." spinning={spinning}>
        <SearchForm
          historyFaqName={historyFaqName}
          employeeName={employeeName}
          answerEmployee={answerEmployee}
          answer={answer}
          topicId={topicId}
          status={status}
          createdBy={createdBy}
          startDate={startDate}
          endDate={endDate}
          departmentId={departmentId}
          onSearch={handleSearch}
        ></SearchForm>
        <SearchResult
          onPagination={handleSearch}
          dataSource={data}
          totalFaq={totalFaq}
          isNewSearch={isNewSearch}
          onExport={handleExportFile}
          loading={isLoading}
        ></SearchResult>
      </Spin>
    </>
  );
};

export default ListHistoryFaq;
