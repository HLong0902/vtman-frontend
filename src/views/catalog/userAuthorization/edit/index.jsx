import React, { useEffect, useState } from "react";
import { Form, Select, Button, Modal, Spin, List } from "antd";
import "./style.less";
import { useHistory, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import axiosInstance from "../../../../axios";
import { openErrorNotification } from "../../../base/notification/notification";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

let initialValues = {
  employeeId: undefined,
  roleId: undefined,
  departmentId: undefined,
};

const checkRequired = (name) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const EditUserAuthorization = () => {
  const [listEmployee, setListEmployee] = useState([]);
  const [listDepartment, setListDeparment] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [listError, setListError] = useState([]);
  const [errorTitle, setErrorTitle] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({});
  const [spinning, setSpinning] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const { id } = useParams();
  const [form] = Form.useForm();

  const handleCancel = () => {
    checkEditting();
  };

  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    url = url.substr(0, url.lastIndexOf("/"));
    history.push(url);
  };

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.employeeId === initialValues.employeeId;
    isEditting = isEditting && formValues.roleId === initialValues.roleId;
    isEditting =
      isEditting && formValues.departmentId === initialValues.departmentId;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      goBack();
    }
  };

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1) {
        activeElement.click();
      } else {
        form.submit();
      }
    }
  };

  const checkApiCount = (apiCount) => {
    if (apiCount === 0) {
      setSpinning(false);
    }
  };

  useEffect(() => {
    let apiCount = 4;
    axiosInstance
      .get("/api/userAuthorization/employee")
      .then((response) => {
        setListEmployee(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    axiosInstance
      .get("/api/userAuthorization/role")
      .then((response) => {
        setListRole(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    axiosInstance
      .get("/api/userAuthorization/department")
      .then((response) => {
        setListDeparment(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    axiosInstance
      .get(`/api/userAuthorization/employeeId?employeeId=${id}`)
      .then((response) => {
        let employee = response.data.data[0];

        initialValues = {
          employeeId: employee.employeeId,
          roleId: employee.roleId,
          departmentId: employee.departmentId !== undefined && employee.departmentId !== null ? employee.departmentId : null,
        };
        form.setFieldsValue(initialValues);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onFinish = (values) => {
    setFormData({ ...values });
    setTimeout(() => {
      setShowConfirm(true);
    }, 200);
  };

  const handleEditUserAuthorization = () => {
    setSpinning(true);
    setShowConfirm(false);
    formData.updatedBy = user.employeeId;
    axiosInstance
      .put(`/api/userAuthorization/update?employeeId=${id}`, formData)
      .then((response) => {
        setSpinning(false);
        let code = response.data.code;
        if (code === "70") {
        } else {
          dispatch(
            actions.setUserAuthorizationNotification({
              content: "Cập nhật người dùng thành công",
              show: true,
              status: "success",
            })
          );
          goBack();
        }
      })
      .catch((error) => {
        setSpinning(false);
        let code = error.response?.data?.code;
        if (code === "400") {
          setErrorTitle(error.response.data.description);
          setListError(error.response.data.data);
          setShowError(true);
          return;
        }
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  return (
    <>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Thông báo
          </div>
        }
        visible={showConfirm}
        onOk={handleEditUserAuthorization}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn cập nhật người dùng này không?
      </Modal>
      <Modal
        className="remove-padding-top"
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            {errorTitle}
          </div>
        }
        visible={showError}
        onOk={() => {}}
        onCancel={() => {
          setShowError(false);
        }}
        footer={null}
      >
        <List
          dataSource={listError}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
        <div className="text-right mt-3" onClick={()=>setShowError(false)}><Button>Đóng</Button></div>
      </Modal>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Thông báo
          </div>
        }
        visible={showConfirmBack}
        onOk={() => goBack()}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác cập nhật người dùng này không?
      </Modal>
      <Spin spinning={spinning}>
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
          form={form}
        >
          <div className="ant-advanced-search-form mt-2">
            <Form.Item
              name="employeeId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Nhân viên{" "}
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
              rules={[
                {
                  validator: checkRequired(
                    "Nhân viên không được phép để trống"
                  ),
                },
              ]}
            >
              <Select placeholder="Chọn nhân viên" disabled>
                {listEmployee.map((employee, index) => {
                  return (
                    <Option key={index} value={employee.employeeId}>
                      {employee.employeeName}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="roleId"
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
              rules={[
                {
                  validator: checkRequired(
                    "Nhóm quản trị không được phép để trống"
                  ),
                },
              ]}
            >
              <Select placeholder="Chọn nhóm quản trị">
                {listRole.map((role, index) => (
                  <Option key={index} value={role.roleId}>
                    {role.roleName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="departmentId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Phòng ban{" "}
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
              rules={[
                {
                  validator: checkRequired(
                    "Phòng ban không được phép để trống"
                  ),
                },
              ]}
            >
              <Select placeholder="Chọn phòng ban">
                {listDepartment.map((department, index) => (
                  <Option key={index} value={department.departmentId}>
                    {department.departmentName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                span: 12,
                offset: 6,
              }}
            >
              <Button type="danger" htmlType="submit">
                Cập nhật
              </Button>{" "}
              <Button onClick={handleCancel}>Huỷ</Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default EditUserAuthorization;
