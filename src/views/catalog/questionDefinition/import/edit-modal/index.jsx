import React, { useEffect, useState, useRef } from "react";
import { CModal, CModalBody, CModalHeader, CModalTitle } from "@coreui/react";
import { Form, Select, Radio, Button, Input, Modal } from "antd";
import "./style.less";
import axiosInstance from "../../../../../axios";
import { openErrorNotification } from "../../../../base/notification/notification";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { SUN_OPTIONS } from "../../../../../reusable/constant";
import { validateNumberOrder } from "../../../../../reusable/utils";

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
  questionDefinitionName: "",
  answerDefinition: "",
  numberOrder: null,
  status: "1",
  description: "",
  topicId: null,
};

const checkRequired = (name, isEditor) => (_, value) => {
  if(isEditor && value === "<p><br></p>"){
    return Promise.reject(new Error(name));
  }
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const EditQuestionDefinition = ({
  questionDefinition,
  editedQuestionDefinition,
}) => {
  const inputRef = useRef(undefined);
  const [show, setShow] = useState(false);
  const [listTopic, setListTopic] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});

  const [form] = Form.useForm();

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
        className =
          className &&
          activeElement.className !==
            "se-wrapper-inner se-wrapper-wysiwyg sun-editor-editable";
        className = className && activeElement.className !== "ant-select-selection-search-input"
        if (className) {
          form.submit();
        }
      }
    }
  };

  useEffect(() => {
    if (show) {
      if (inputRef) {
        setTimeout(() => {
          inputRef.current.focus();
        }, 200);
      }
    }
  }, [show]);

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting =
      questionDefinition.questionDefinitionName === undefined
        ? formValues.questionDefinitionName.trim() === ""
        : formValues.questionDefinitionName ===
          questionDefinition.questionDefinitionName;
    isEditting =
      isEditting &&
      formValues.answerDefinition === questionDefinition.answerDefinition;
    isEditting =
      isEditting &&
      formValues.topicId ===
        convertTopicCodeToTopicId(questionDefinition.topicCode);
    isEditting =
      isEditting && formValues.numberOrder === questionDefinition.numberOrder;
    if (
      Number(questionDefinition.status) !== 1 &&
      Number(questionDefinition.status) !== 0
    ) {
      isEditting = isEditting && formValues.status === "1";
    } else {
      isEditting =
        isEditting && formValues.status === questionDefinition.status;
    }
    isEditting =
      isEditting && formValues.description === questionDefinition.description;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      closeModal();
    }
  };

  const convertTopicCodeToTopicId = (topicCode) => {
    let topicId = null;
    if (topicCode === null) {
      return null;
    } else {
      for (let i = 0; i < listTopic.length; i++) {
        if (topicCode === listTopic[i].topicCode) {
          topicId = listTopic[i].topicId;
          break;
        }
      }
    }
    return topicId;
  };

  const findTopicByTopicId = (topicId) => {
    let topic = null;
    if (topicId === null) {
      return null;
    } else {
      for (let i = 0; i < listTopic.length; i++) {
        if (topicId === listTopic[i].topicId) {
          topic = listTopic[i];
          break;
        }
      }
    }
    return topic;
  };

  const setInitialValues = () => {
    initialValues = {
      questionDefinitionName: questionDefinition.questionDefinitionName,
      topicId: convertTopicCodeToTopicId(questionDefinition.topicCode),
      answerDefinition: questionDefinition.answerDefinition,
      numberOrder: questionDefinition.numberOrder,
      status:
        Number(questionDefinition.status) === 1 ||
        Number(questionDefinition.status) === 0
          ? `${questionDefinition.status}`
          : "1",
      description: questionDefinition.description,
    };
    form.setFieldsValue(initialValues);
  };

  useEffect(() => {
    setInitialValues();
  }, [listTopic]);

  useEffect(() => {
    axiosInstance
      .get("/api/question/topic")
      .then((response) => {
        setListTopic(response.data.data);
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

  const handleEditQuestionDefinition = () => {
    setShowConfirm(false);
    formData.status = Number(formData.status);
    if (formData.numberOrder) {
      formData.numberOrder = Number(formData.numberOrder);
    }
    formData.description = formData.description?.trim();
    let topic = findTopicByTopicId(formData.topicId);
    axiosInstance
      .post("/api/question/editRecordError", formData)
      .then((response) => {
        editedQuestionDefinition(questionDefinition.id, {
          ...formData,
          id: questionDefinition.id,
          topicCode: topic.topicCode,
          topicName: topic.topicName,
        });
        closeModal();
      })
      .catch((error) => {
        let code = error.response?.data?.code;
        if (code === "404") {
          openErrorNotification(
            "Câu hỏi tự định nghĩa đã tồn tại trên hệ thống"
          );
        } else {
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        }
      });
  };

  const closeModal = (e) => {
    if (e) {
      e.preventDefault();
    }
    setShow(!show);
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
        onOk={handleEditQuestionDefinition}
        onCancel={() => {
          setShowConfirm(false);
        }}
        zIndex={999999}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn cập nhật câu hỏi tự định nghĩa này không?
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
        onOk={() => {
          setShowConfirmBack(false);
          setInitialValues();
          closeModal();
        }}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        zIndex={999999}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác cập nhật câu hỏi tự định nghĩa này
        không?
      </Modal>

      <a
        href="a"
        onClick={closeModal}
        className="mr-1"
        style={{
          color: "#3399ff",
        }}
      >
        Sửa
      </a>
      <CModal show={show} onClose={closeModal} size="lg" centered>
        <CModalHeader closeButton>
          <CModalTitle
            style={{
              color: "black",
            }}
          >
            Sửa bản ghi lỗi
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {show && (
            <Form
              className="question-definition-form"
              name="validate_other"
              {...formItemLayout}
              onFinish={onFinish}
              initialValues={initialValues}
              form={form}
            >
              <Form.Item
                name="questionDefinitionName"
                label={
                  <p style={{ marginBottom: "0px" }}>
                    Câu hỏi{" "}
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
                      "Câu hỏi không được phép để trống"
                    ),
                  },
                  {
                    min: 3,
                    message: "Câu hỏi không được phép nhỏ hơn 3 ký tự"
                  },
                  {
                    max: 500,
                    message: "Câu hỏi không được vượt quá 500 ký tự",
                  },
                ]}
              >
                <Input
                  id="element-focus"
                  ref={inputRef}
                  placeholder="Nhập câu hỏi"
                  autoComplete="off"
                  onBlur={() => {
                    form.setFieldsValue({
                      questionDefinitionName:
                        form.getFieldValue("questionDefinitionName") !==
                        undefined
                          ? form.getFieldValue("questionDefinitionName")?.trim()
                          : "",
                    });
                  }}
                />
              </Form.Item>
              <Form.Item
                name="topicId"
                label={
                  <p style={{ marginBottom: "0px" }}>
                    Chủ đề{" "}
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
                    validator: checkRequired("Chủ đề không được phép để trống"),
                  },
                ]}
              >
                <Select
                  placeholder="Chọn chủ đề"
                  getPopupContainer={(trigger) => trigger.parentNode}
                >
                  {listTopic.map((topic, index) => (
                    <Option key={index} value={topic.topicId}>
                      {topic.topicName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <p style={{ marginBottom: "0px" }}>
                    Câu trả lời{" "}
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
                name="answerDefinition"
                rules={[
                  {
                    validator: checkRequired(
                      "Câu trả lời không được phép để trống",
                      true
                    ),
                  },
                ]}
              >
                <SunEditor
                  setContents={form.getFieldValue("answerDefinition")}
                  setOptions={SUN_OPTIONS}
                  placeholder="Nhập câu trả lời"
                  onChange={(content) => {
                    form.setFieldsValue({
                      answerDefinition: content,
                    });
                    setTimeout(() => {
                      form.validateFields(["answerDefinition"]);
                    }, 100);
                  }}
                />
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
                label="Ghi chú"
                rules={[
                  {
                    max: 500,
                    message: "Ghi chú không được vượt quá 500 ký tự",
                  },
                ]}
              >
                <Input.TextArea
                  className="skip-enter"
                  placeholder="Nhập ghi chú"
                  autoComplete="off"
                  onBlur={() => {
                    form.setFieldsValue({
                      description: form.getFieldValue("description")?.trim(),
                    });
                  }}
                />
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
            </Form>
          )}
        </CModalBody>
      </CModal>
    </>
  );
};

export default EditQuestionDefinition;
