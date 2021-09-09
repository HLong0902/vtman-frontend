import React, { useEffect, useState } from "react";
import "./style.less";
import SearchTopic from "../search";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../../../../store/actions/index";
import {
  openErrorNotification,
  openNotification,
} from "../../../base/notification/notification";

const ListTopic = (props) => {
  const [topicName, setTopicName] = useState("");
  const [departmentId, setDepartmentId] = useState("undefined");
  const [totalTopic, setTotalTopic] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const notification = useSelector(
    (state) => state.notification.topicNotification
  );
  const dispatch = useDispatch();

  const [data, setData] = useState(null);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
      dispatch(
        actions.setTopicNotification({
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
      setTopicName(values.topicName);
      setDepartmentId(values.departmentId);
      axiosInstance
        .get("/api/topic/search", {
          params: {
            topicName: encodeURIComponent(values.topicName),
            page: page,
            pageSize: 10,
            departmentId:
              values.departmentId === "undefined" ? "" : values.departmentId,
          },
        })

        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalTopic(data[0].totalRecord);
            setData(data);
          } else {
            setTotalTopic(0);
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
        .get("/api/topic/search", {
          params: {
            topicName: encodeURIComponent(topicName),
            page: page,
            pageSize: 10,
            departmentId: departmentId === "undefined" ? "" : departmentId,
          },
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalTopic(data[0].totalRecord);
            setData(data);
          } else {
            setTotalTopic(0);
            setData([]);
          }
        })
        .catch((error) => {
          setIsLoading(false);
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        });
    }
  };

  return (
    <>
      <SearchTopic
        topicName={topicName}
        departmentId={departmentId}
        onSearch={handleSearch}
      ></SearchTopic>
      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        topicName={topicName}
        departmentId={departmentId}
        totalTopic={totalTopic}
        isNewSearch={isNewSearch}
        loading={isLoading}
      ></SearchResult>
    </>
  );
};

export default ListTopic;
