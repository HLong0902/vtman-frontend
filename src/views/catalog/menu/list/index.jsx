import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import { notification } from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import SearchAutoContent from "../../menu/search";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const List = (props) => {
  const [menuName, setMenuName] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
    }
    return () => {};
  }, []);

  const handleSearch = (values, page = 1) => {
    if (values) {
      values.menuName = values.menuName?.trim();
      values.menuName = encodeURIComponent(values.menuName);
      setIsNewSearch(true);
      setMenuName(values.menuName);
      let url = `/api/menu?keyword=${
        values.menuName === undefined ? "" : values.menuName
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
      <SearchAutoContent
        menuName={menuName}
        onSearch={handleSearch}
      ></SearchAutoContent>

      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        menuName={menuName}
      ></SearchResult>
    </>
  );
};

export default List;
