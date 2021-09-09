import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import "antd/dist/antd.css";
import { notification } from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import Search from "../../report/search";
import { useSelector } from "react-redux";
import moment from "moment";
import { dateFormat } from "../../../../reusable/constant";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const getDay = () => {
  let today = new Date();
  let dd = today.getDate() > 10 ? today.getDate() : `0${today.getDate()}`;
  let mm =
    today.getMonth() + 1 > 10 ? today.getMonth() : `0${today.getMonth() + 1}`;
  var yyyy = today.getFullYear();
  return { dd, mm, yyyy };
};

const initDate = () => {
  const { dd, mm, yyyy } = getDay();
  return [moment(`01/01/${yyyy}`, dateFormat), moment(`${dd}/${mm}/${yyyy}`, dateFormat)]
}

const List = (props) => {
  const user = useSelector((state) => state.user);
  const [reportType, setReportType] = useState(null);
  const [departmentId, setDepartmentId] = useState("");
  const [listDepartment, setListDepartment] = useState([]);
  const [topicId, setTopicId] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(initDate());
  const [url, setUrl] = useState("");
  const [data, setData] = useState([]);
  const initialValues = {
    page: 1,
    pageSize: 10,
    departmentId: "",
    topicId: "",
    fromDate: null,
    toDate: null,
  };
  const [spinning, setSpinning] = useState(false);
  useEffect(() => {
    axiosInstance.get("/api/historyFaqs/departmentStatus").then((response) => {
      setListDepartment(response.data.data);
    });

    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
    }
    return () => {};
  }, []);

  const handleSearch = (values, page = 1) => {
    if (values) {
      setLoading(true);
      initialValues.departmentId =
        values.departmentId === "" ? null : Number(values.departmentId);
      initialValues.topicId =
        values.topicId === "" ? null : Number(values.topicId);
      const { dd, mm, yyyy } = getDay();
      if (values.date !== null) {
        values.date = values.date.map((date) =>
          date ? date.format("yyyy-MM-DD") : ""
        );
        initialValues.fromDate =
          values.date[0] === undefined || values.date[0] === "" ? `${yyyy}-01-01` : values.date[0];
        initialValues.toDate =
          values.date[1] === undefined || values.date[1] === "" ? `${yyyy}-${mm}-${dd}` : values.date[1];
      } else {
        initialValues.fromDate = `${yyyy}-01-01`;
        initialValues.toDate = `${yyyy}-${mm}-${dd}`;
      }
      setUrl(values.url);
      setReportType(values.reportType);
      setDepartmentId(initialValues.departmentId);
      setTopicId(initialValues.topicId);
      setFromDate(initialValues.fromDate);
      setToDate(initialValues.toDate);
      setIsNewSearch(true);

      axiosInstance
        .post(values.url, initialValues)
        .then((response) => {
          let data = response.data;
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              data[i].stt = i + 1;
            }
            setTotalRecord(Number(response.headers.count));
            setData(response.data);
            setLoading(false);
          } else {
            setTotalRecord(0);
            setData([]);
            setLoading(false);
          }
        })
        .catch((error) => {});
    } else {
      setIsNewSearch(false);
    }
  };

  return (
    <>
      <Spin tip="Đang export..." spinning={spinning}>
        <Search
          reportType={reportType}
          departmentId={departmentId}
          topicId={topicId}
          onSearch={handleSearch}
          date={date}
          user={user}
          listDepartment={listDepartment}
        ></Search>

        {reportType === null ? null : (
          <SearchResult
            onPagination={handleSearch}
            dataSource={data}
            reportType={reportType}
            departmentId={departmentId}
            topicId={topicId}
            fromDate={fromDate}
            toDate={toDate}
            totalRecord={totalRecord}
            isNewSearch={isNewSearch}
            url={url}
            loading={loading}
            setSpinning={setSpinning}
          ></SearchResult>
        )}
      </Spin>
    </>
  );
};

export default List;
