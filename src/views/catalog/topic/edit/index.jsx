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
import { useHistory, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import axiosInstance from "../../../../axios";
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

let initialValues = {
  topicCode: "",
  topicName: "",
  numberOrder: "",
  status: "1",
  description: "",
  departmentId: null,
  answerEmployeeId: [],
};

const checkRequired = (name) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const EditTopic = (props) => {
  const elRef = useRef(undefined);
  const [listDepartment, setListDepartment] = useState([]);
  const [listEmployee, setListEmployee] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
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

  const checkApiCount = (apiCount) => {
    if (apiCount === 0) {
      setSpinning(false);
    }
  };

  useEffect(() => {
    let apiCount = 3;
    axiosInstance
      .get("/api/topic/department")
      .then((response) => {
        setListDepartment(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    axiosInstance
      .get(`/api/topic/edit?topicId=${id}`)
      .then((response) => {
        let topic = response.data.data;
        axiosInstance
          .get("/api/topic/employee?departmentId=" + topic.departmentId)
          .then((response) => {
            setListEmployee(response.data.data);
            apiCount = apiCount - 1;
            checkApiCount(apiCount);
          })
          .catch((error) => {});
        let answerEmployeeId = topic.answerEmployeeId?.trim();
        initialValues = {
          topicCode: topic.topicCode,
          topicName: topic.topicName,
          departmentId: topic.departmentId,
          answerEmployeeId:
            answerEmployeeId === ""
              ? []
              : answerEmployeeId.split(",").map((employee) => Number(employee)),
          status: `${topic.status}`,
          numberOrder: `${topic.numberOrder ? topic.numberOrder : ""}`,
          description: topic.description,
        };
        form.setFieldsValue(initialValues);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    elRef.current.focus();

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

  const handleEditTopic = () => {
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
    formData.updatedBy = user.employeeId;
    axiosInstance
      .post(`/api/topic/edit?topicId=${id}`, formData)
      .then((response) => {
        props.onSpinning(false);
        let code = response.data.code;
        if (code === "70") {
          openErrorNotification(
            "Tên chủ đề đã tồn tại trên hệ thống"
          );
        } else {
          dispatch(
            actions.setTopicNotification({
              content: "Cập nhật chủ đề thành công",
              show: true,
              status: "success",
            })
          );
          goBack();
        }
      })
      .catch((error) => {
        props.onSpinning(false);
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
        onOk={handleEditTopic}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn cập nhật chủ đề này không?
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
        Bạn có chắc chắn muốn huỷ thao tác cập nhật chủ đề này không?
      </Modal>
      <Spin spinning={spinning}>
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
          form={form}
        >
          <div className="ant-advanced-search-form pb-0">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item
                  name="topicCode"
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      Mã chủ đề{" "}
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
                        "Mã chủ đề không được phép để trống"
                      ),
                    },
                    {
                      pattern: /^(( )*|( )*[a-zA-Z0-9_-]{1,50}( )*)$/,
                      message: `Mã chủ đề không được vượt quá 50 ký tự, chỉ được phép nhập chữ a-z, số và ký tự đặc biệt "_" và "-"`,
                    },
                  ]}
                >
                  <Input
                    disabled
                    placeholder="Nhập mã chủ đề"
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
                      Tên chủ đề{" "}
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
                        "Tên chủ đề không được phép để trống"
                      ),
                    },
                    {
                      max: 200,
                      message: "Tên chủ đề không được vượt quá 200 ký tự",
                    },
                  ]}
                >
                  <Input
                    ref={elRef}
                    placeholder="Nhập tên chủ đề"
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
              <Select
                placeholder="Chọn phòng ban"
                onChange={(value) => {
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
                  Đầu mối trả lời{" "}
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
                        new Error("Đầu mối trả lời không được phép để trống")
                      );
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                {
                  max: 5,
                  message: "Số lượng đầu mối trả lời không được vượt quá 5",
                  type: "array",
                },
              ]}
            >
              <Select
                showArrow
                mode="multiple"
                placeholder="Chọn đầu mối trả lời"
                filterOption={(input, option) => {
                  return (
                    removeVietnameseTones(option.children.toLowerCase())
                      .indexOf(removeVietnameseTones(input.toLowerCase())) >= 0
                  );
                }}
              >
                {listEmployee.map((employee, index) => (
                  <Option key={index} value={employee.employeeId}>
                    {generateEmployeeLabel(employee)}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="numberOrder"
              label="Thứ tự"
              rules={[
                {
                  validator: validateNumberOrder
                },
              ]}
            >
              <Input
                autoComplete="off"
                placeholder="Nhập số thứ tự hiển thị"
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
              label="Mô tả"
              rules={[
                {
                  max: 500,
                  message: "Mô tả không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea className="skip-enter" placeholder="Nhập mô trả" autoComplete="off" onBlur={() => handleBlur(form, "description")} />
            </Form.Item>

            <Form.Item
              name="status"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Trạng thái
                </p>
              }
              rules={[
                {
                  validator: checkRequired(
                    "Trạng thái không được phép để trống"
                  ),
                },
              ]}
            >
              <Radio.Group>
                <Radio value="1">Hoạt động</Radio>
                <Radio value="0">Không hoạt động</Radio>
              </Radio.Group>
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

export default EditTopic;
