import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { notification, Spin } from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import { useDispatch } from "react-redux";
import SearchAutoContent from "../../contentAutomatic/search";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const ListContents = (props) => {
  const [autoContentType, setAutoContentType] = useState([]);
  const [automaticContentName, setAutomaticContentName] = useState("");
  const [automaticContentType, setAutomaticContentType] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [data, setData] = useState(null);
  const dispatch = useDispatch();
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    axiosInstance
      .get("/api/autoContent/type")
      .then((response) => {
        setAutoContentType(response.data);
      })
      .catch((error) => {});
    return () => {};
  }, []);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
      dispatch({
        type: "SET_AUTOMATIC_CONTENT_NOTIFICATION",
        content: "",
        show: false,
        status: "success",
      });
    }
    return () => {};
  }, []);

  const handleSearch = (values, page = 1) => {
    if (values) {
      values.automaticContentName = values.automaticContentName?.trim();
      values.automaticContentName = encodeURIComponent(
        values.automaticContentName
      );
      setIsNewSearch(true);
      setAutomaticContentName(values.automaticContentName);
      setAutomaticContentType(values.automaticContentType);
      let url = `/api/autoContent/find?name=${
        values.automaticContentName === undefined
          ? ""
          : values.automaticContentName
      }&autoContentType=${
        values.automaticContentType === "undefined"
          ? ""
          : values.automaticContentType
      }&page=${page}&pageSize=10`;

      axiosInstance.get(url).then((response) => {
        let data = response.data;
        let headers = response.headers.count;
        if (data.length > 0) {
          setTotalRecord(headers);
          setData(data);
        } else {
          setTotalRecord(0);
          setData([]);
        }
      });
    } else {
      setIsNewSearch(false);
    }
  };

  return (
    <>
      <Spin tip="Đang export..." spinning={spinning}>
        <SearchAutoContent
          automaticContentName={automaticContentName}
          automaticContentType={automaticContentType}
          onSearch={handleSearch}
        ></SearchAutoContent>

        <SearchResult
          onPagination={handleSearch}
          dataSource={data}
          totalRecord={totalRecord}
          isNewSearch={isNewSearch}
          automaticContentName={automaticContentName}
          automaticContentType={automaticContentType}
          setSpinning={setSpinning}
        ></SearchResult>
      </Spin>
    </>
  );
};

export default ListContents;
