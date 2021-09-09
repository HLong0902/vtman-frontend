import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import {notification} from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import Search from "../../department/search";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const List = (props) => {
  const [departmentCode, setDepartmentCode] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [status, setStatus] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [data, setData] = useState(null);
  const initValue = {
    pageIndex: 1,
    pageSize: 10,
    departmentName: "",
    departmentCode: "",
    status:null
  }
  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
    }
    return () => {
    };
  }, []);

  const handleSearch = (values, page = 1) => {
    if (values) {
      if (values.departmentCode) {
        values.departmentCode = values.departmentCode?.trim();
      }
      if (values.departmentName) {
        values.departmentName = values.departmentName?.trim();
        // values.departmentName = encodeURIComponent(encodeURIComponent(values.departmentName));
      }

      initValue.departmentCode = values.departmentCode;
      initValue.departmentName = values.departmentName;
      initValue.status=(values.status!==""?Number(values.status):"");
      setIsNewSearch(true);
      setDepartmentCode(values.departmentCode);
      setDepartmentName(values.departmentName);
      setStatus(values.status);
      let url = `/api/department/search`;
      axiosInstance.post(url, initValue).then((response) => {
        let data = response.data.data.list;
        let headers = response.data.data.count;
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
      <Search
        departmentCode={departmentCode}
        departmentName={departmentName}
        status={status}
        onSearch={handleSearch}
      ></Search>

      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        departmentCode={departmentCode}
        departmentName={departmentName}
        status={status}
      ></SearchResult>
    </>
  );
};

export default List;
