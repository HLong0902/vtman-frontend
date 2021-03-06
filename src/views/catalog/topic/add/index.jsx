import React, { useEffect, useState, useRef } from "react";
import {
  Form,
  Select,
  Radio,
  Button,
  Row,
  Col,
  Input,
  Modal,
  Spin,
} from "antd";
import "./style.less";
import { useHistory, useLocation } from "react-router";
import axiosInstance from "../../../../axios";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import { openErrorNotification } from "../../../base/notification/notification";
import { handleBlur, removeVietnameseTones, validateNumberOrder, generateEmployeeLabel } from "../../../../reusable/utils";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const checkRequired = (name) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const AddTopic = (props) => {
  const elRef = useRef(undefined);
  const [listDepartment, setListDepartment] = useState([]);
  const [listEmployee, setListEmployee] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [disabledAnswerEmployee, setDisabledAnswerEmployee] = useState(true);
  const [form] = Form.useForm();
  const initialValues = {
    topicCode: "",
    topicName: "",
    numberOrder: "",
    status: "1",
    description: "",
    departmentId: null,
    answerEmployeeId: [],
  };
  const [spinning, setSpinning] = useState(true);

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleCancel = () => {
    checkEditting();
  };

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1) {
        activeElement.click();
      } else {
        let className = activeElement.className !== "ant-input skip-enter";
        className = className && activeElement.className !== "ant-select-selection-search-input"
        if (className) {
          form.submit();
        }
      }
    }
  };

  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    history.push(url);
  };

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.topicCode === initialValues.topicCode;
    isEditting = isEditting && formValues.topicName === initialValues.topicName;
    isEditting =
      isEditting && formValues.numberOrder === initialValues.numberOrder;
    isEditting = isEditting && formValues.status === initialValues.status;
    isEditting =
      isEditting && formValues.description === initialValues.description;
    isEditting =
      isEditting && formValues.departmentId === initialValues.departmentId;
    isEditting = isEditting && formValues.status === initialValues.status;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      goBack();
    }
  };

  const handleCreateTopic = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.answerEmployeeId = formData.answerEmployeeId.join(",");
    formData.status = Number(formData.status);
    if (formData.numberOrder) {
      formData.numberOrder = Number(formData.numberOrder);
    }else{
      formData.numberOrder = null;
    }
    formData.description = formData.description?.trim();
    formData.createdBy = user.employeeId;

    axiosInstance
      .post("/api/topic/create", formData)
      .then((response) => {
        props.onSpinning(false);
        let code = response.data.code;
        if (code === "70") {
          openErrorNotification(
            "M?? ch??? ????? ???? t???n t???i tr??n h??? th???ng"
          );
        } else if (code === "71") {
          openErrorNotification(
            "T??n ch??? ????? ???? t???n t???i tr??n h??? th???ng"
          );
        } else {
          dispatch(
            actions.setTopicNotification({
              content: "Th??m m???i ch??? ????? th??nh c??ng",
              show: true,
              status: "success",
            })
          );
          goBack();
        }
      })
      .catch((error) => {
        props.onSpinning(false);
        openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
      });
  };

  useEffect(() => {
    axiosInstance
      .get("/api/topic/department")
      .then((response) => {
        setListDepartment(response.data.data);
        setSpinning(false);
      })
      .catch((error) => {});

    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);

    elRef.current.focus();

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
        onOk={handleCreateTopic}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="?????ng ??"
        cancelText="Hu???"
      >
        B???n c?? ch???c ch???n mu???n th??m m???i ch??? ????? n??y kh??ng?
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
            Th??ng b??o
          </div>
        }
        visible={showConfirmBack}
        onOk={() => goBack()}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="C??"
        cancelText="Kh??ng"
      >
        B???n c?? ch???c ch???n mu???n hu??? thao t??c th??m m???i ch??? ????? n??y kh??ng?
      </Modal>

      <Spin spinning={spinning}>
        <Form
          form={form}
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <div className="ant-advanced-search-form pb-0">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="topicCode"
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      M?? ch??? ?????{" "}
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
                        "M?? ch??? ????? kh??ng ???????c ph??p ????? tr???ng"
                      ),
                    },
                    {
                      pattern: /^(( )*|( )*[a-zA-Z0-9_-]{1,50}( )*)$/,
                      message: `M?? ch??? ????? kh??ng ???????c v?????t qu?? 50 k?? t???, ch??? ???????c ph??p nh???p ch??? a-z, s??? v?? k?? t??? ?????c bi???t "_" v?? "-"`,
                    },
                  ]}
                >
                  <Input
                    ref={elRef}
                    placeholder="Nh???p m?? ch??? ?????"
                    autoComplete="off"
                    onBlur={() => handleBlur(form, "topicCode")}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="topicName"
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      T??n ch??? ?????{" "}
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
                        "T??n ch??? ????? kh??ng ???????c ph??p ????? tr???ng"
                      ),
                    },
                    {
                      max: 200,
                      message: "T??n ch??? ????? kh??ng ???????c v?????t qu?? 200 k?? t???",
                    },
                  ]}
                >
                  <Input
                    placeholder="Nh???p t??n ch??? ?????"
                    autoComplete="off"
                    onBlur={() => handleBlur(form, "topicName")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <div className="ant-advanced-search-form mt-2">
            <Form.Item
              name="departmentId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Ph??ng ban{" "}
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
                  setDisabledAnswerEmployee(false);
                  axiosInstance
                    .get("/api/topic/employee?departmentId=" + value)
                    .then((response) => {
                      setListEmployee(response.data.data);
                      form.setFieldsValue({
                        answerEmployeeId: [],
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
              name="answerEmployeeId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  ?????u m???i tr??? l???i{" "}
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
                        new Error("?????u m???i tr??? l???i kh??ng ???????c ph??p ????? tr???ng")
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  max: 5,
                  message: "S??? l?????ng ?????u m???i tr??? l???i kh??ng ???????c v?????t qu?? 5",
                  type: "array",
                },
              ]}
            >
              <Select
                showArrow
                mode="multiple"
                placeholder="Ch???n ?????u m???i tr??? l???i"
                disabled={disabledAnswerEmployee}
                filterOption={(input, option) => {
                  return (
                    removeVietnameseTones(option.children.toLowerCase())
                      .indexOf(removeVietnameseTones(input.toLowerCase())) >= 0
                  );
                }}
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
              name="numberOrder"
              label="Th??? t???"
              rules={[
                {
                  validator: validateNumberOrder
                }
              ]}
            >
              <Input
                autoComplete="off"
                placeholder="Nh???p s??? th??? t??? hi???n th???"
                onBlur={() => {
                  let value = form.getFieldValue("numberOrder")?.trim();
                  if (Number(value)) {
                    form.setFieldsValue({
                      numberOrder: Number(value) + "",
                    });
                  }else{
                    form.setFieldsValue({ numberOrder: value });
                  }
                  if(value !== ""){
                    form.validateFields(["numberOrder"]);
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="description"
              label="M?? t???"
              rules={[
                {
                  max: 500,
                  message: "M?? t??? kh??ng ???????c v?????t qu?? 500 k?? t???",
                },
              ]}
            >
              <Input.TextArea className="skip-enter" placeholder="Nh???p m?? t???" autoComplete="off" onBlur={()=>handleBlur(form, "description")} />
            </Form.Item>

            <Form.Item
              name="status"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Tr???ng th??i
                </p>
              }
              rules={[
                {
                  validator: checkRequired(
                    "Tr???ng th??i kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
              ]}
            >
              <Radio.Group>
                <Radio value="1">Ho???t ?????ng</Radio>
                <Radio value="0">Kh??ng ho???t ?????ng</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              wrapperCol={{
                span: 12,
                offset: 6,
              }}
            >
              <Button type="danger" htmlType="submit">
                L??u
              </Button>{" "}
              <Button onClick={handleCancel}>Hu???</Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default AddTopic;
