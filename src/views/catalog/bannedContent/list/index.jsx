import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import {notification} from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import SearchAutoContent from "../../bannedContent/search";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const ListBannedContent = (props) => {
  const [bannedContentName, setBannedContentName] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [data, setData] = useState(null);

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
        values.bannedContentName=values.bannedContentName?.trim();
        values.bannedContentName=encodeURIComponent(values.bannedContentName);
        setIsNewSearch(true);
        setBannedContentName(values.bannedContentName);
        let url = `/api/bannedContent?name=${
          values.bannedContentName === undefined ? "" : values.bannedContentName
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
        bannedContentName={bannedContentName}
        onSearch={handleSearch}
      ></SearchAutoContent>

      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        bannedContentName={bannedContentName}
      ></SearchResult>
    </>
  );
};

export default ListBannedContent;
