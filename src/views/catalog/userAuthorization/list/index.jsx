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
  const [employee, setEmployee] = useState("");
  const [roleId, setRoleId] = useState("undefined");
  const [departmentId, setDepartmentId] = useState("undefined");
  const [totalRecord, setTotalRecord] = useState(0);
  const [isNewSearch, setIsNewSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const notification = useSelector(
    (state) => state.notification.userAuthorizationNotification
  );
  const dispatch = useDispatch();

  const [data, setData] = useState(null);

  useEffect(() => {
    handleSearch(null, 1);
    if (notification.show) {
      openNotification(notification.content);
      dispatch(
        actions.setUserAuthorizationNotification({
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
      setEmployee(values.employee);
      setRoleId(values.roleId);
      setDepartmentId(values.departmentId);
      axiosInstance
        .get("/api/userAuthorization/get", {
          params: {
            page: page,
            pageSize: 10,
            employee: values.employee,
            roleId: values.roleId === "undefined" ? "" : values.roleId,
            departmentId: values.departmentId === "undefined" ? "" : values.departmentId,
          },
        })

        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalRecord(data[0].totalRecord);
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
        .get("/api/userAuthorization/get", {
          params: {
            page: page,
            pageSize: 10,
            employee: employee,
            roleId: roleId === "undefined" ? "" : roleId,
            departmentId: departmentId === "undefined" ? "" : departmentId,
          },
        })
        .then((response) => {
          setIsLoading(false);
          let data = response.data.data;
          if (data.length > 0) {
            setTotalRecord(data[0].totalRecord);
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
      <SearchTopic
        employee={employee}
        roleId={roleId}
        departmentId={departmentId}
        onSearch={handleSearch}
      ></SearchTopic>
      <SearchResult
        onPagination={handleSearch}
        dataSource={data}
        employee={employee}
        roleId={roleId}
        departmentId={departmentId}
        totalRecord={totalRecord}
        isNewSearch={isNewSearch}
        loading={isLoading}
      ></SearchResult>
    </>
  );
};

export default ListTopic;
