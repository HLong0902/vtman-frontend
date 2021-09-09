import React, {useEffect, useState} from "react";
import "antd/dist/antd.css";
import {
  Form,
  Select,
  Radio,
  Button,
  Input,
  Modal,
  notification,
  Spin,
} from "antd";
import "./style.less";
import { useHistory } from "react-router";
import axiosInstance from "../../../../axios";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const { Option } = Select;
const formItemLayout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 14,
  },
};

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Thêm mới tin nhắn tự động thành công",
    placement,
  });
};

const openErrorNotification = (errorName) => {
  notification.error({
    message: `Thông báo`,
    description: errorName,
    placement: "bottomRight",
  });
};

const AddAutoContent = (props) => {
  const [autoContentType, setAutoContentType] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [isContinue, setIsContinue] = useState(false);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();
  const initialValues = {
    autoContentList: [""],
    autoContentType: null,
    isActive: "1",
    description: "",
    automaticContentId: null,
  };
  const [spinning, setSpinning] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const user = useSelector((state) => state.user);

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1
        || activeElement.localName ==="textarea"
        || activeElement.className === "ant-select-selection-search-input" )
       {
        activeElement.click();
      } else {
        form.submit();
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting =
      formValues.autoContentType === initialValues.autoContentType;
    isEditting =
      isEditting &&
      JSON.stringify(formValues.autoContentList) ===
        JSON.stringify(initialValues.autoContentList);
    isEditting = isEditting && formValues.isActive === initialValues.isActive;
    isEditting =
      isEditting && formValues.description === initialValues.description;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      history.push(
        location.pathname.substr(0, location.pathname.lastIndexOf("/"))
      );
    }
  };

  const handleCancel = () => {
    checkEditting();
  };

  const handleCreateAutoContent = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.createdBy = user.employeeId;

    if (formData.description !== undefined) {
      formData.description = formData.description?.trim();
    }
    if (formData.autoContentList !== undefined) {
      for (let i = 0; i < formData.autoContentList.length; i++) {
        formData.autoContentList[i] = formData.autoContentList[i]?.trim();
      }
    }

    axiosInstance
      .post("/api/autoContent/create", formData)
      .then((response) => {
        props.onSpinning(false);
        if (isContinue) {
          openNotification();
          form.resetFields();
        } else {
          openNotification();
          history.push(
            location.pathname.substr(0, location.pathname.lastIndexOf("/"))
          );
        }
      })
      .catch((error) => {
        props.onSpinning(false);
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  useEffect(() => {
    axiosInstance
      .get("/api/autoContent/type")
      .then((response) => {
        setAutoContentType(response.data);
        setSpinning(false);
      })
      .catch((error) => {});
    return () => {};
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
            Thông báo
          </div>
        }
        visible={showConfirm}
        onOk={handleCreateAutoContent}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn thêm mới tin nhắn tự động này không?
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
        onOk={() =>
          history.push(
            location.pathname.substr(0, location.pathname.lastIndexOf("/"))
          )
        }
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác thêm mới tin nhắn tự động này không?
      </Modal>

      <Spin spinning={spinning}>
        <Form
          name="dynamic_form_item"
          {...formItemLayout}
          form={form}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <div className="ant-advanced-search-form pb-0">
            <Form.Item
              name="autoContentType"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Loại tin nhắn tự động{" "}
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
              required={false}
              rules={[
                {
                  required: true,
                  message: "Loại tin nhắn tự động không được phép để trống",
                },
              ]}
            >
              <Select placeholder="Chọn loại tin nhắn tự động">
                {autoContentType.map((autoContentType, index) => (
                  <Option
                    key={index}
                    value={autoContentType.automaticContentType}
                  >
                    {autoContentType.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="ant-advanced-search-form mt-2">
            <Form.List name="autoContentList">
              {(fields, { add, remove }) => {
                return (
                  <div>
                    {fields.map((field, index) => (
                      <Form.Item
                        {...formItemLayout}
                        label={
                          <p style={{ marginBottom: "0px" }}>
                            Tin nhắn tự động {index + 1}{" "}
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
                        required={false}
                        key={field.key}
                        rules={[
                          {
                            required: true,
                            message:
                              "Tin nhắn tự động không được phép để trống",
                          },
                        ]}
                      >
                        <Form.Item
                          {...field}
                          validateTrigger={["onChange", "onBlur"]}
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message:
                                "Tin nhắn tự động không được phép để trống",
                            },
                            {
                              max: 200,
                              message: "Tin nhắn tự động không được vượt quá 200 ký tự"
                            }
                          ]}
                          noStyle
                        >
                          <Input.TextArea
                            autoComplete="off"
                            placeholder="Nhập tin nhắn tự động"
                          />
                        </Form.Item>
                        {fields.length > 1 && index !== 0 ? (
                          <button
                            className="dynamic-delete-button"
                            style={{
                              margin: "0 8px",
                              border: "none",
                              background: "none",
                              position: "absolute",
                              color: "red",
                              outline: "none",
                            }}
                            onClick={() => {
                              remove(field.name);
                            }}
                          >
                            Xóa
                          </button>
                        ) : null}
                      </Form.Item>
                    ))}
                    <Form.Item
                      wrapperCol={{
                        span: 12,
                        offset: 6,
                      }}
                    >
                      {fields.length < 5 ? (
                        <Button
                          style={{
                            marginBottom: "15px",
                            width: "35%",
                            background: "none",
                            color: "#1890ff",
                            borderColor: "#1890ff",
                          }}
                          type="primary"
                          onClick={() => {
                            add();
                          }}
                        >
                          Thêm tin nhắn tự động
                        </Button>
                      ) : (
                        <div style={{ color: "red", marginTop: "-1rem" }}>
                          Bạn chỉ được thêm tối đa 5 tin nhắn tự động
                        </div>
                      )}
                    </Form.Item>
                  </div>
                );
              }}
            </Form.List>

            <Form.Item
              name="description"
              label="Ghi chú"
              required={false}
              rules={[
                {
                  max: 500,
                  message: "Ghi chú không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea autoComplete="off" placeholder="Nhập ghi chú" />
            </Form.Item>

            <Form.Item
              name="isActive"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Trạng thái
                </p>
              }
              required={false}
              rules={[
                {
                  required: true,
                  message: "Chọn trạng thái",
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
              <Button
                type="primary"
                onClick={() => setIsContinue(false)}
                htmlType="submit"
              >
                Lưu
              </Button>{" "}
              <Button
                danger
                onClick={() => setIsContinue(true)}
                htmlType="submit"
              >
                Lưu và tiếp tục
              </Button>{" "}
              <Button onClick={handleCancel}>Huỷ</Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default AddAutoContent;
