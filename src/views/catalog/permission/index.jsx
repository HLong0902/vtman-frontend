import React, { useEffect, useState } from "react";
import { List, Checkbox, Select, Form, Empty, Spin } from "antd";
import { CCard, CCardBody, CCardHeader } from "@coreui/react";
import "./style.less";
import axiosInstance from "../../../axios";
import {
  openErrorNotification,
  openNotification,
} from "../../base/notification/notification";
import { useDispatch } from "react-redux";
import * as actions from "../../../store/actions/index";

const { Option } = Select;

const options = [
  { label: "Read", value: "1" },
  { label: "Write", value: "2" },
  { label: "Update", value: "3" },
  { label: "Delete", value: "4" },
];

const PermissionAction = ({ dataSource, onChange }) => {
  const [checkeds, setCheckeds] = useState({});
  useEffect(() => {
    let cks = {};
    if (dataSource) {
      for (let item of dataSource.permission) {
        cks[item.pageId] = item.actions ? item.actions.split(",") : undefined;
      }
      setCheckeds(cks);
    }
  }, [dataSource]);
  return (
    <>
      <List
        className="permission"
        header={
          <div style={{ fontSize: "16px", color: "#ff4d4f" }}>
            {dataSource.menuName}
          </div>
        }
        footer={<div></div>}
        dataSource={dataSource.permission}
        renderItem={(item) => {
          return (
            <List.Item>
              <List.Item.Meta
                description={
                  <p
                    style={{
                      color: "rgba(0, 0, 0, 0.85)",
                      marginBottom: "0px",
                      marginLeft: "30px",
                    }}
                  >
                    {item.pageName}
                  </p>
                }
              />
              <div style={{ marginRight: "15px" }}>
                <Checkbox.Group
                  style={{ float: "right" }}
                  value={checkeds[item.pageId]}
                  onChange={(values) => {
                    let cks = { ...checkeds };
                    cks[item.pageId] = values;
                    setCheckeds(cks);
                    onChange(dataSource.menuId, item.pageId, values);
                  }}
                >
                  {options.map((option, index) => {
                    return (
                      <Checkbox
                        key={index}
                        value={option.value}
                        disabled={
                          item.availableActionId
                            ? item.availableActionId
                                .split(",")
                                .indexOf(option.value) === -1
                            : true
                        }
                      >
                        {option.label}
                      </Checkbox>
                    );
                  })}
                </Checkbox.Group>
              </div>
            </List.Item>
          );
        }}
      />
    </>
  );
};

const Permission = (props) => {
  const [form] = Form.useForm();
  const [listRole, setListRole] = useState([]);
  const [listPermission, setListPermission] = useState([]);
  const dispatch = useDispatch();
  const [spinning, setSpinning] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/api/role/listAll")
      .then((response) => {
        let roles = response.data.data;
        if (roles.length > 0) {
          setListRole(response.data.data);
          form.setFieldsValue({
            role: roles[0].roleId,
          });
          axiosInstance
            .get(`/api/permissionAction/byRoleId?roleId=${roles[0].roleId}`)
            .then((response) => {
              let data = response.data.data;
              if (data) {
                setListPermission([...data]);
              }
              setTimeout(() => {
                setSpinning(false);
              }, 200);
            })
            .catch((error) => {
              openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
            });
        }
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
    return () => {};
  }, []);
  return (
    <>
      <Spin spinning={spinning}>
        <CCard>
          <CCardBody style={{ paddingBottom: "0px" }}>
            <div className="d-flex justify-content-center">
              <Form form={form}>
                <Form.Item
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      Nhóm quản trị{" "}
                      <span
                        style={{
                          color: "#ff4d4f",
                          fontSize: "14px",
                          fontFamily: "SimSun, sans-serif",
                          lineHeight: "1",
                        }}
                      >
                        *
                      </span>
                    </p>
                  }
                  name="role"
                >
                  <Select
                    style={{ width: 300 }}
                    placeholder="Chọn nhóm quản trị"
                    onChange={(value) => {
                      setSpinning(true);
                      axiosInstance
                        .get(`/api/permissionAction/byRoleId?roleId=${value}`)
                        .then((response) => {
                          let data = response.data.data;
                          setListPermission([...data]);
                          setSpinning(false);
                        })
                        .catch((error) => {
                          openErrorNotification(
                            "Hệ thống đang bận. Xin thử lại sau"
                          );
                        });
                    }}
                  >
                    {listRole.map((role) => (
                      <Option key={role.roleId} value={role.roleId}>
                        {role.roleName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </CCardBody>
        </CCard>
        <CCard>
          <CCardHeader style={{ borderBottom: "0px", paddingBottom: "0px" }}>
            <h6
              style={{ fontSize: "17px", color: "black", marginBottom: "0px" }}
            >
              Danh sách quyền truy cập hệ thống
            </h6>
          </CCardHeader>
          <CCardBody style={{ paddingTop: "0px" }}>
            {listPermission.length > 0 ? (
              listPermission.map((permission, index) => (
                <PermissionAction
                  key={index}
                  menuName={permission.menuName}
                  dataSource={permission}
                  onChange={(menuId, pageId, values) => {
                    setSpinning(true);
                    let roleId = form.getFieldValue("role");
                    axiosInstance
                      .post("/api/permissionAction/update", {
                        menuId,
                        pageId,
                        actionId: values.join(","),
                        roleId,
                      })
                      .then((response) => {
                        setSpinning(false);
                        dispatch(actions.getNav());
                        dispatch(actions.getUser());
                        dispatch(actions.changedRoute(true));
                        openNotification("Cập nhật quyền truy cập thành công");
                      })
                      .catch((error) => {
                        openErrorNotification(
                          "Hệ thống đang bận. Xin thử lại sau"
                        );
                      });
                  }}
                ></PermissionAction>
              ))
            ) : (
              <Empty description={<span>Không có dữ liệu</span>} />
            )}
          </CCardBody>
        </CCard>
      </Spin>
    </>
  );
};

export default Permission;
