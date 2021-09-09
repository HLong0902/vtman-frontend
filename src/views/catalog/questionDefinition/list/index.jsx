import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import "./style.less";
import SearchTopic from "../search";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../../store/actions/index";
import {
  openNotification,
  openErrorNotification,
} from "../../../base/notification/notification";
import moment from "moment";

const ListTopic = (props) => {
  const [questionDefinitionName, setQuestionDefinitionName] = useState("");
  const [answerDefinition, setAnswerDefinition] = useState("");
  const [topicId, setTopicId] = useState("undefined");
  const [totalQuestionDefinition, setTotalQuestionDefinition] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const notification = useSelector(
    (state) => state.notification.questionDefinitionNotification
  );
  const dispatch = useDispatch();

  const [data, setData] = useState(null);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
      dispatch(
        actions.setQuestionDenifitionNotification({
          content: "",
          show: false,
          status: "success",
        })
      );
    }
    return () => {};
  }, []);

  const handleSearch = (values, page = 1) => {
    setIsLoading(true);
    if (values) {
      setIsNewSearch(true);
      setQuestionDefinitionName(values.questionDefinitionName);
      setTopicId(values.topicId);
      setAnswerDefinition(values.answerDefinition);
      axiosInstance
        .get("/api/question/search", {
          params: {
            questionDefinitionName: encodeURIComponent(
              values.questionDefinitionName
            ),
            topicId: values.topicId === "undefined" ? "" : values.topicId,
            answerDefinition: encodeURIComponent(values.answerDefinition),
            page: page,
            pageSize: 10,
          },
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalQuestionDefinition(data[0].totalRecord);
            setData(data);
          } else {
            setTotalQuestionDefinition(0);
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
        .get("/api/question/search", {
          params: {
            questionDefinitionName: encodeURIComponent(questionDefinitionName),
            topicId: topicId === "undefined" ? "" : topicId,
            answerDefinition: encodeURIComponent(answerDefinition),
            page: page,
            pageSize: 10,
          },
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalQuestionDefinition(data[0].totalRecord);
            setData(data);
          } else {
            setTotalQuestionDefinition(0);
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
      .get("/api/question/exportQuestion", {
        params: {
          questionDefinitionName: encodeURIComponent(questionDefinitionName),
          answerDefinition: encodeURIComponent(answerDefinition),
          topicId: topicId === "undefined" ? "" : topicId,
        },
      })
      .then((response) => {
        setSpinning(false);
        var link = document.createElement("a");
        document.body.appendChild(link);
        link.setAttribute("type", "hidden");
        link.href = "data:text/plain;base64," + response.data.data;
        link.download = `Danh sách câu hỏi_${moment().format(
          "YYMMDD_HHmmss"
        )}.xlsx`;
        link.click();
        document.body.removeChild(link);
      });
  };

  return (
    <>
      <Spin tip="Đang export..." spinning={spinning}>
        <SearchTopic
          questionDefinitionName={questionDefinitionName}
          answerDefinition={answerDefinition}
          topicId={topicId}
          onSearch={handleSearch}
        ></SearchTopic>
        <SearchResult
          onExportFile={handleExportFile}
          onPagination={handleSearch}
          dataSource={data}
          questionDefinitionName={questionDefinitionName}
          answerDefinition={answerDefinition}
          topicId={topicId}
          totalQuestionDefinition={totalQuestionDefinition}
          isNewSearch={isNewSearch}
          loading={isLoading}
        ></SearchResult>
      </Spin>
    </>
  );
};

export default ListTopic;
