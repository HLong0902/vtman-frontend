import React, { useEffect, useState } from "react";
import { Form, Select, Button, Input, Modal, Spin } from "antd";
import "./style.less";
import axiosInstance from "../../../axios";
import {
  openErrorNotification,
  openNotification,
} from "../../base/notification/notification";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { removeVietnameseTones, generateEmployeeLabel } from "../../../reusable/utils";

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
  departmentId: "",
  employeeId: [],
  maximumResponseTime: "",
  responseRemindingTime: "",
  maximumWaitingTime: "",
  remindingWaitingTime: "",
  maximumQaSession: "",
};

const FunctionConfig = () => {
  const permissions = useSelector((state) => state.user.permissions);
  const [listDepartment, setListDepartment] = useState([]);
  const [listEmployee, setListEmployee] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [disabledEmployee, setDisabledEmployee] = useState(false);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();
  const location = useLocation();
  const [spinning, setSpinning] = useState(true);

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1
        || activeElement.className === "ant-select-selection-search-input") {
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
    let apiCount = 2;
    axiosInstance
      .get("/api/functionConfig/department")
      .then((response) => {
        setListDepartment(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});
    axiosInstance
      .get(`/api/functionConfig/display`)
      .then((response) => {
        let functionConfig = response.data.data[0];
        if (!functionConfig) {
          setDisabledEmployee(true);
          form.setFieldsValue({
            departmentId: undefined,
          });
          apiCount = apiCount - 1;
          checkApiCount(apiCount);
        } else {
          if (functionConfig.departmentId) {
            axiosInstance
              .get(
                "/api/functionConfig/employee?departmentId=" +
                  functionConfig.departmentId
              )
              .then((response) => {
                setListEmployee(response.data.data);
                setDisabledEmployee(false);
                apiCount = apiCount - 1;
                checkApiCount(apiCount);
              })
              .catch((error) => {});
          } else {
            setDisabledEmployee(true);
          }
          initialValues = {
            departmentId: functionConfig.departmentId,
            employeeId: functionConfig.employeeId
              .split(",")
              .map((employee) => Number(employee)),
            maximumResponseTime: `${functionConfig.maximumResponseTime}`,
            responseRemindingTime: `${functionConfig.responseRemindingTime}`,
            maximumWaitingTime: `${functionConfig.maximumWaitingTime}`,
            remindingWaitingTime: `${functionConfig.remindingWaitingTime}`,
            maximumQASession: `${functionConfig.maximumQASession}`,
            answerKPIPercent: `${functionConfig.answerKPIPercent}`,
          };
          form.setFieldsValue(initialValues);
        }
      })
      .catch((error) => {});

    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);

    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleSave = () => {
    setSpinning(true);
    setShowConfirm(false);
    formData.maximumResponseTime = Number(formData.maximumResponseTime);
    formData.responseRemindingTime = Number(formData.responseRemindingTime);
    formData.maximumWaitingTime = Number(formData.maximumWaitingTime);
    formData.remindingWaitingTime = Number(formData.remindingWaitingTime);
    formData.maximumQASession = Number(formData.maximumQASession);
    formData.answerKPIPercent = Number(formData.answerKPIPercent);
    axiosInstance
      .put(`/api/functionConfig/update?functionConfigId=1`, {
        ...formData,
        employeeId: formData.employeeId.join(","),
        functionConfigId: 1,
      })
      .then((response) => {
        setSpinning(false);
        if (response.data.code === "200") {
          openNotification("C???p nh???t c???u h??nh h???i ????p th??nh c??ng");
        } else {
          openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
        }
      })
      .catch((error) => {
        setSpinning(false);
        openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
      });
  };

  const onFinish = (values) => {
    setFormData({ ...values });
    setTimeout(() => {
      setShowConfirm(true);
    }, 200);
  };

  const checkRequired = (name) => (_, value) => {
    if (!value) {
      return Promise.reject(new Error(name));
    } else {
      return Promise.resolve();
    }
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
            Th??ng b??o
          </div>
        }
        visible={showConfirm}
        onOk={handleSave}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="?????ng ??"
        cancelText="Hu???"
      >
        B???n c?? ch???c ch???n mu???n c???p nh???t c???u h??nh h???i ????p n??y kh??ng?
      </Modal>

      <Spin spinning={spinning}>
        <Form
          form={form}
          name="function_config_form"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <div className="ant-advanced-search-form">
            <Form.Item
              name="departmentId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Ph??ng ban m???c ?????nh{" "}
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
                    "Ph??ng ban kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Select
                onChange={(value) => {
                  axiosInstance
                    .get("/api/functionConfig/employee?departmentId=" + value)
                    .then((response) => {
                      setDisabledEmployee(false);
                      setListEmployee(response.data.data);
                      form.setFieldsValue({
                        employeeId: [],
                      });
                    })
                    .catch((error) => {});
                }}
                placeholder="Ch???n ph??ng ban"
              >
                {listDepartment.map((department, index) => (
                  <Option key={index} value={department.departmentId}>
                    {department.departmentName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="employeeId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  ?????u m???i ph??ng ban{" "}
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
                  validator: (_, value) => {
                    if (!value || value.length === 0) {
                      return Promise.reject(
                        new Error("?????u m???i ph??ng ban kh??ng ???????c ph??p ????? tr???ng")
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  max: 5,
                  message: "S??? l?????ng ?????u m???i ph??ng ban kh??ng ???????c v?????t qu?? 5",
                  type: "array",
                },
              ]}
            >
              <Select
                showArrow
                mode="multiple"
                placeholder="Ch???n ?????u m???i ph??ng ban"
                filterOption={(input, option) => {
                  return (
                    removeVietnameseTones(option.children.toLowerCase())
                      .indexOf(removeVietnameseTones(input.toLowerCase())) >= 0
                  );
                }}
                disabled={disabledEmployee}
              >
                {listEmployee.map((employee, index) => {
                  return (
                    <Option key={index} value={employee.employeeId}>
                      {generateEmployeeLabel(employee)}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>

            <Form.Item
              name="maximumResponseTime"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Th???i gian ph???n h???i t???i ??a (ph??t){" "}
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
                  validator: (_, value) => {
                    if (value) {
                      let num = Number(value);
                      if (
                        `${num}` === "NaN" ||
                        num < 0 ||
                        !Number.isInteger(num)
                      ) {
                        return Promise.reject(
                          new Error(
                            "Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? nguy??n d????ng"
                          )
                        );
                      } else if (num < 60 || num > 480) {
                        return Promise.reject(
                          new Error(
                            "Th???i gian ph???n h???i t???i ??a h???p l??? t??? 60-480 ph??t"
                          )
                        );
                      } else {
                        return Promise.resolve();
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "Th???i gian ph???n h???i t???i ??a kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p th???i gian ph???n h???i t???i ??a"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("maximumResponseTime");
                  if (
                    value &&
                    `${Number(value)}` !== "NaN" &&
                    Number.isInteger(Number(value))
                  ) {
                    form.setFieldsValue({
                      maximumResponseTime: Number(value).toString(),
                    });
                    form.validateFields(["maximumResponseTime"]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="responseRemindingTime"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Th???i gian nh???c nh??? ph???n h???i (ph??t){" "}
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
                  validator: (_, value) => {
                    if (value) {
                      let num = Number(value);
                      if (
                        `${num}` === "NaN" ||
                        num <= 0 ||
                        !Number.isInteger(num)
                      ) {
                        return Promise.reject(
                          new Error(
                            "Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? nguy??n d????ng"
                          )
                        );
                      } else {
                        if (
                          form.getFieldValue("maximumResponseTime") &&
                          num >= form.getFieldValue("maximumResponseTime")
                        ) {
                          return Promise.reject(
                            new Error(
                              "Th???i gian nh???c nh??? ph???n h???i ph???i nh??? h??n th???i gian ph???n h???i t???i ??a"
                            )
                          );
                        } else {
                          return Promise.resolve();
                        }
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "Th???i gian nh???c nh??? ph???n h???i kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p th???i gian nh???c nh??? ph???n h???i"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("responseRemindingTime");
                  if (
                    value &&
                    `${Number(value)}` !== "NaN" &&
                    Number.isInteger(Number(value))
                  ) {
                    form.setFieldsValue({
                      responseRemindingTime: Number(value).toString(),
                    });
                    form.validateFields(["responseRemindingTime"]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="maximumWaitingTime"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Th???i gian ch??? t???i ??a (ph??t){" "}
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
                  validator: (_, value) => {
                    if (value) {
                      value = `${value}`.replaceAll(",", ".");
                      let num = Number(value);
                      if (`${num}` === "NaN" || num < 0) {
                        return Promise.reject(
                          new Error("Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? d????ng")
                        );
                      } else {
                        let tmp = value?.split(".");
                        if (tmp.length === 2 && tmp[1].length > 2 && Number(tmp[1]) !== 0) {
                          if(Number(tmp[1].substr(2,)) !== 0){
                            return Promise.reject(
                              new Error(
                                "Ph???n th???p ph??n cho ph??p nh???p t???i ??a 2 ch??? s???"
                              )
                            );
                          }
                        } else if (num < 2 || num > 5) {
                          return Promise.reject(
                            new Error("Th???i gian ch??? t???i ??a h???p l??? t??? 2-5 ph??t")
                          );
                        }
                        return Promise.resolve();
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "Th???i gian ch??? t???i ??a kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p th???i gian ch??? t???i ??a"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("maximumWaitingTime");
                  value = value?.replaceAll(",", ".")?.trim();
                  let num = Number(value);
                  if (value && `${num}` !== "NaN") {
                    let tmp = value?.split(".");
                    let bool = tmp.length === 1;
                    if(tmp.length === 2){
                      bool = tmp.length === 2 && (tmp[1].length <= 2 || Number(tmp[1]) === 0 || (tmp[1].length > 2 && Number(tmp[1].substr(2,))) === 0);
                    }
                    if (bool) {
                      form.setFieldsValue({
                        maximumWaitingTime: Number(value).toString(),
                      });
                      form.validateFields(["maximumWaitingTime"]);
                    }
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="remindingWaitingTime"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Th???i gian nh???c nh??? ch??? (ph??t){" "}
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
                  validator: (_, value) => {
                    if (value) {
                      value = `${value}`.replaceAll(",", ".");
                      let num = Number(value);
                      if (`${num}` === "NaN" || num <= 0) {
                        return Promise.reject(
                          new Error("Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? d????ng")
                        );
                      } else {
                        let tmp = `${value}`.split(".");
                        if (tmp.length === 2 && tmp[1].length > 2 && Number(tmp[1]) !== 0) {
                          if(Number(tmp[1].substr(2,)) !== 0){
                            return Promise.reject(
                              new Error(
                                "Ph???n th???p ph??n cho ph??p nh???p t???i ??a 2 ch??? s???"
                              )
                            );
                          }
                        } else {
                          if (
                            form.getFieldValue("maximumWaitingTime") &&
                            num >= form.getFieldValue("maximumWaitingTime")
                          ) {
                            return Promise.reject(
                              new Error(
                                "Th???i gian nh???c nh??? ch??? ph???i nh??? h??n th???i gian ch??? t???i ??a"
                              )
                            );
                          }
                        }
                        return Promise.resolve();
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "Th???i gian nh???c nh??? ch??? kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p th???i gian nh???c nh??? ch???"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("remindingWaitingTime");
                  value = value?.replaceAll(",", ".")?.trim();
                  let num = Number(value);
                  if (value && `${num}` !== "NaN") {
                    let tmp = value?.split(".");
                    let bool = tmp.length === 1;
                    if(tmp.length === 2){
                      bool = tmp.length === 2 && (tmp[1].length <= 2 || Number(tmp[1]) === 0 || (tmp[1].length > 2 && Number(tmp[1].substr(2,))) === 0);
                    }
                    if (bool) {
                      form.setFieldsValue({
                        remindingWaitingTime: Number(value).toString(),
                      });
                      form.validateFields(["remindingWaitingTime"]);
                    }
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="maximumQASession"
              label={
                <p style={{ marginBottom: "0px" }}>
                  S??? phi??n h???i ????p t???i ??a{" "}
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
                  validator: (_, value) => {
                    if (value) {
                      let num = Number(value);
                      if (
                        `${num}` === "NaN" ||
                        num < 0 ||
                        !Number.isInteger(num)
                      ) {
                        return Promise.reject(
                          new Error(
                            "Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? nguy??n d????ng"
                          )
                        );
                      } else if (num < 1 || num > 10) {
                        return Promise.reject(
                          new Error(
                            "S??? phi??n h???i ????p t???i ??a h???p l??? t??? 1-10 c??u"
                          )
                        );
                      } else {
                        return Promise.resolve();
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "S??? phi??n h???i ????p t???i ??a kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p s??? phi??n h???i ????p t???i ??a"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("maximumQASession");
                  if (
                    value &&
                    `${Number(value)}` !== "NaN" &&
                    Number.isInteger(Number(value))
                  ) {
                    form.setFieldsValue({
                      maximumQASession: Number(value).toString(),
                    });
                    form.validateFields(["maximumQASession"]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="answerKPIPercent"
              label={
                <p style={{ marginBottom: "0px" }}>
                  KPI tr??? l???i c???a ph??ng ban (%){" "}
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
                  validator: (_, value) => {
                    if (value) {
                      let num = Number(value);
                      if (
                        `${num}` === "NaN" ||
                        num < 0 ||
                        !Number.isInteger(num)
                      ) {
                        return Promise.reject(
                          new Error(
                            "Gi?? tr??? nh???p h???p l??? l?? c??c ch??? s??? nguy??n d????ng"
                          )
                        );
                      } else if (num < 0 || num > 100) {
                        return Promise.reject(
                          new Error("KPI h???p l??? t??? 0%-100%")
                        );
                      } else {
                        return Promise.resolve();
                      }
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  validator: checkRequired(
                    "KPI tr??? l???i c???a ph??ng ban kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Input
                placeholder="Nh???p KPI ph??ng ban"
                autoComplete="off"
                onBlur={() => {
                  let value = form.getFieldValue("answerKPIPercent");
                  if (
                    value &&
                    `${Number(value)}` !== "NaN" &&
                    Number.isInteger(Number(value))
                  ) {
                    form.setFieldsValue({
                      answerKPIPercent: Number(value).toString(),
                    });
                    form.validateFields(["answerKPIPercent"]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                span: 12,
                offset: 6,
              }}
            >
              <Button
                type="danger"
                htmlType="submit"
                disabled={permissions[location.pathname].indexOf(3) === -1}
              >
                C???p nh???t
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default FunctionConfig;
