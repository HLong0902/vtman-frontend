import React, {useEffect, useRef, useState} from "react";
import "antd/dist/antd.css";
import { Form, Button, Input, Modal, notification, Spin } from "antd";
import "./style.less";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../../axios";
import { useSelector } from "react-redux";

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
    description: "Cập nhật từ khóa bị cấm thành công",
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

let initialValues = {
  bannedContentName: "",
  description: "",
  bannedContentId: null,
};

const EditBannedContent = (props) => {
  const elRef = useRef(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [Data, setData] = useState({});
  const history = useHistory();
  const location = useLocation();
  const url1 = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
  const url = url1.substr(0, url1.lastIndexOf("/"));
  const { id } = useParams();
  const [form] = Form.useForm();
  const user = useSelector((state) => state.user);
  const [spinning, setSpinning] = useState(true);
  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1 || activeElement.localName==="textarea") {
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
    elRef.current.focus();
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting =
      formValues.bannedContentName === initialValues.bannedContentName;
    isEditting =
      isEditting && formValues.description === initialValues.description;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      history.push(url);
    }
  };

  const handleCancel = () => {
    checkEditting();
  };

  useEffect(() => {
    axiosInstance
      .get(`/api/bannedContent/detail?id=${id}`)
      .then((response) => {
        setData(response.data);
        initialValues = {
          bannedContentName: response.data.bannedContentName,
          bannedContentId: id,
          description: response.data.description,
        };
        form.setFieldsValue(initialValues);
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

  const handleEdit = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.updatedBy = user.employeeId;
    formData.bannedContentId = Number(id);
    formData.createdBy = Data.createdBy;
    if (formData.description) {
      formData.description = formData.description?.trim();
    }
    formData.bannedContentName = formData.bannedContentName?.trim();
    axiosInstance
      .post(`/api/bannedContent/update`, formData)
      .then((response) => {
          props.onSpinning(false);
          openNotification();
          history.push(url);
      })
      .catch((error) => {
        props.onSpinning(false);
        let code=error.response?.data?.code;
        if(code==="433"){
          openErrorNotification("Từ khóa bị cấm đã tồn tại trên hệ thống");
        }
        else {
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
        onOk={handleEdit}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn cập nhật từ khóa bị cấm này không?
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
        onOk={() => history.push(url)}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="Có"
        cancelText="Không"
      >
        Bạn có chắc chắn muốn huỷ thao tác cập nhật từ khóa bị cấm này không?

      </Modal>
      <Spin spinning={spinning}>
        <Form
          name="dynamic_form_item"
          {...formItemLayout}
          form={form}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <div className="ant-advanced-search-form mt-2">
            <Form.Item
              name="bannedContentName"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Từ khóa bị cấm{" "}
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
                  max: 200,
                  message: "Từ khóa bị cấm không được vượt quá 200 ký tự",
                },
                {
                  required: true,
                  whitespace: true,
                  message: "Từ khóa bị cấm không được phép để trống",
                },
              ]}
            >
              <Input
                ref = {elRef}
                autoComplete="off"
                placeholder="Nhập từ khóa bị cấm" />
            </Form.Item>
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
              wrapperCol={{
                span: 12,
                offset: 6,
              }}
            >
              <Button type="primary" htmlType="submit">
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

export default EditBannedContent;
