import React, { useEffect, useState, useRef } from "react";
import { Form, Select, Radio, Button, Input, Modal, Spin } from "antd";
import "./style.less";
import { useHistory, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import axiosInstance from "../../../../axios";
import { openErrorNotification } from "../../../base/notification/notification";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import { SUN_OPTIONS } from "../../../../reusable/constant";
import { validateNumberOrder } from "../../../../reusable/utils";

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
  topicName: "",
  numberOrder: "",
  status: "0",
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

const EditQuestionDefinition = (props) => {
  const elRef = useRef(undefined);
  const [listTopic, setListTopic] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [editorData, setEditorData] = useState("");
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

  const checkApiCount = (apiCount) => {
    if (apiCount === 0) {
      setSpinning(false);
    }
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
        className = className && activeElement.className !== "ant-select-selection-search-input";
        if (className) {
          form.submit();
        }
      }
    }
  };

  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    url = url.substr(0, url.lastIndexOf("/"));
    history.push(url);
  };

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting =
      formValues.questionDefinitionName ===
      initialValues.questionDefinitionName;
    isEditting =
      isEditting &&
      formValues.answerDefinition === initialValues.answerDefinition;
    isEditting = isEditting && formValues.topicId === initialValues.topicId;
    isEditting =
      isEditting && formValues.numberOrder === initialValues.numberOrder;
    isEditting = isEditting && formValues.status === initialValues.status;
    isEditting =
      isEditting && formValues.description === initialValues.description;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      goBack();
    }
  };

  useEffect(() => {
    let apiCount = 2;
    axiosInstance
      .get("/api/question/topic")
      .then((response) => {
        setListTopic(response.data.data);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
      })
      .catch((error) => {});

    axiosInstance
      .get(`/api/question/edit?questionDefinitionId=${id}`)
      .then((response) => {
        let questionDefinition = response.data.data;
        initialValues = {
          questionDefinitionName: questionDefinition.questionDefinitionName,
          topicId: questionDefinition.topicId,
          answerDefinition: `${questionDefinition.answerDefinition}`,
          numberOrder: `${questionDefinition.numberOrder ? questionDefinition.numberOrder : ""}`,
          status: `${questionDefinition.status}`,
          description: questionDefinition.description,
        };
        setEditorData(initialValues.answerDefinition);
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

  const handleEditQuestionDefinition = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.status = Number(formData.status);
    if (formData.numberOrder) {
      formData.numberOrder = Number(formData.numberOrder);
    }
    formData.description = formData.description?.trim();
    formData.updatedBy = user.employeeId;
    axiosInstance
      .post(`/api/question/edit?questionDefinitionId=${id}`, formData)
      .then((response) => {
        props.onSpinning(false);
        dispatch(
          actions.setQuestionDenifitionNotification({
            content: "Cập nhật câu hỏi tự định nghĩa thành công",
            show: true,
            status: "success",
          })
        );
        let url = location.pathname.substr(
          0,
          location.pathname.lastIndexOf("/")
        );
        url = url.substr(0, url.lastIndexOf("/"));
        history.push(url);
      })
      .catch((error) => {
        props.onSpinning(false);
        let code = error.response?.data?.code;
        if (code === "60") {
          openErrorNotification("Câu hỏi tự định nghĩa đã tồn tại trên hệ thống");
        } else {
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        }
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
        onOk={handleEditQuestionDefinition}
        onCancel={() => {
          setShowConfirm(false);
        }}
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
        onOk={() => goBack()}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác cập nhật câu hỏi tự định nghĩa này
        không?
      </Modal>
      <Spin spinning={spinning}>
        <Form
          className="question-definition-form"
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
          form={form}
        >
          <div className="ant-advanced-search-form pb-0">
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
                  validator: checkRequired("Câu hỏi không được phép để trống"),
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
                ref={elRef}
                placeholder="Nhập câu hỏi"
                autoComplete="off"
                onBlur={() => {
                  form.setFieldsValue({
                    questionDefinitionName: form
                      .getFieldValue("questionDefinitionName")?.trim(),
                  });
                }}
              />
            </Form.Item>
          </div>
          <div className="ant-advanced-search-form mt-2">
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
              <Select placeholder="Chọn chủ đề">
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
                setContents={editorData}
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
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default EditQuestionDefinition;
