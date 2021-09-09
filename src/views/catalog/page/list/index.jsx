import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import {notification} from "antd";
import SearchResult from "../result";
import axiosInstance from "../../../../axios";
import SearchAutoContent from "../../page/search";

const openNotification = (description = "", placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: `${description}`,
    placement,
  });
};

const List = (props) => {
  const [pageCode, setPageCode] = useState("");
  const [pageName, setPageName] = useState("");
  const [menuId, setMenuId] = useState("");
  const [status, setStatus] = useState("");
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
        values.pageCode = values.pageCode?.trim();
        values.pageName = values.pageName?.trim();
        values.pageCode=encodeURIComponent(encodeURIComponent(values.pageCode));
        values.pageName=encodeURIComponent(encodeURIComponent(values.pageName));
        setIsNewSearch(true);
        setMenuId(values.menuId);
        setPageCode(values.pageCode);
        setPageName(values.pageName);
        setStatus(values.status);
        let url = `/api/page/search?pageCode=
        ${values.pageCode === undefined ? "" : values.pageCode}
        &pageName=${values.pageName === undefined ? "" : values.pageName}
        &menuId=${values.menuId === undefined ? "" : values.menuId}
        &status=${values.status === undefined ? "" : values.status}
        &page=${page}&pageSize=10`;

        axiosInstance.get(url).then((response) => {
          let data = response.data.data;
          if (data.length > 0) {
            setTotalRecord(response.data.data[0].totalRecord);
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
        pageCode={pageCode}
        pageName={pageName}
        menuId={menuId}
        status={status}
        onSearch={handleSearch}
      ></SearchAutoContent>

      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        pageCode={pageCode}
        pageName={pageName}
        menuId={menuId}
        status={status}
      ></SearchResult>
    </>
  );
};

export default List;
