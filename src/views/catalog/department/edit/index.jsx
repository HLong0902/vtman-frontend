import React, {useEffect, useRef, useState} from "react";
import "antd/dist/antd.css";
import { Form, Button, Input, Modal, notification, Radio, Spin } from "antd";
import "./style.less";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../../axios";
import { useSelector } from "react-redux";
import { handleBlur } from "../../../../reusable/utils";

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
    description: "Cập nhật phòng ban thành công",
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
  departmentId: null,
  departmentName: "",
  departmentCode: "",
  description: "",
  status: "1",
};

const Edit = (props) => {
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
    let isEditting = formValues.departmentName === initialValues.departmentName;
    isEditting =
      isEditting && formValues.departmentCode === initialValues.departmentCode;
    isEditting =
      isEditting && formValues.description === initialValues.description;
    isEditting = isEditting && formValues.status === initialValues.status;
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
      .get(`/api/department/view?departmentId=${id}`)
      .then((response) => {
        setData(response.data);
        initialValues = {
          departmentId: id,
          departmentCode: response.data.data.departmentCode,
          departmentName: response.data.data.departmentName,
          description: response.data.data.description,
          status: response.data.data.status.toString(),
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
    formData.departmentId = Number(id);
    if (formData.description) {
      formData.description = formData.description?.trim();
    }
    formData.departmentCode = formData.departmentCode?.trim();
    formData.departmentCode = formData.departmentCode.toUpperCase();
    formData.departmentName = formData.departmentName?.trim();

    axiosInstance
      .post(`/api/department/update`, formData)
      .then((response) => {
        props.onSpinning(false);
        if (response.data.code === "200") {
          openNotification();
          history.push(url);
        }
      })
      .catch((error) => {
        props.onSpinning(false);
        let code = error.response?.data?.code;
        if(code === "425"){
          openErrorNotification("Phòng ban không tồn tại trên hệ thống");
        }
        else if(code === "426"){
          openErrorNotification("Không thể dừng hoạt động Phòng ban đã có chủ đề");
        }
        else if(code === "427"){
          openErrorNotification("Mã phòng ban đã tồn tại trên hệ thống");
        }
        else if(code === "428"){
          openErrorNotification("Tên phòng ban đã tồn tại trên hệ thống");
        }
        else if(code === "429"){
          openErrorNotification("Không thể dừng hoạt động Phòng ban đã được cấu hình mặc định");
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
        Bạn có chắc chắn muốn cập nhật phòng ban này không?
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
        Bạn có chắc chắn muốn huỷ thao tác cập nhật phòng ban này không?
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
              name="departmentCode"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Mã phòng ban{" "}
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
                  message: "Mã phòng ban không được phép để trống",
                },
                {
                  pattern: /^(( )*|( )*[a-zA-Z0-9_-]{1,50}( )*)$/,
                  message: `Mã phòng ban không được vượt quá 50 ký tự, chỉ được phép nhập chữ a-z, số và ký tự đặc biệt "_" và "-"`
                }
              ]}
            >
              <Input autoComplete="off" disabled={true} placeholder="Nhập mã phòng ban" onBlur={()=>handleBlur(form, "departmentCode")} />
            </Form.Item>
            <Form.Item
              name="departmentName"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Tên phòng ban{" "}
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
                  message: "Tên phòng ban không được phép để trống",
                },
                {
                  pattern: /^[0-9 aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ]{1,100}$/,
                  message: "Tên phòng ban không được vượt quá 100 ký tự, chỉ gồm số và chữ cái, không nhập ký tự đặc biệt",
                },
              ]}
            >
              <Input
                ref = {elRef}
                autoComplete="off"
                placeholder="Nhập tên phòng ban"
                onBlur={()=>handleBlur(form, "departmentName")} />
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
              <Input.TextArea autoComplete="off" placeholder="Nhập ghi chú" onBlur={()=>handleBlur(form, "description")}  />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
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

export default Edit;
