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

const ListRole = (props) => {
  const [roleName, setRoleName] = useState("");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const notification = useSelector(
    (state) => state.notification.roleNotification
  );
  const dispatch = useDispatch();

  const [data, setData] = useState(null);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
      dispatch(
        actions.setRoleNotification({
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
      setRoleName(values.roleName);
      axiosInstance
        .get("/api/role", {
          params: {
            keyword: encodeURIComponent(values.roleName),
            page: page,
            pageSize: 10,
          },
        })

        .then((response) => {
          setIsLoading(false);
          let data = response.data;
          if (data.length > 0) {
            setTotalRecord(Number(response.headers.count));
            setData(data);
          } else {
            setTotalRecord(0);
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
        .get("/api/role", {
          params: {
            keyword: encodeURIComponent(roleName),
            page: page,
            pageSize: 10,
          },
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data;
          if (data.length > 0) {
            setTotalRecord(Number(response.headers.count));
            setData(data);
          } else {
            setTotalRecord(0);
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
      <SearchTopic roleName={roleName} onSearch={handleSearch}></SearchTopic>
      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        roleName={roleName}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        loading={isLoading}
      ></SearchResult>
    </>
  );
};

export default ListRole;
