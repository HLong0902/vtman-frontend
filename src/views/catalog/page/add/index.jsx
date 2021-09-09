import React, {useEffect, useRef, useState} from "react";
import "antd/dist/antd.css";
import {
  Form,
  Select,
  Radio,
  Button,
  Input,
  Modal,
  notification,
  Checkbox,
  Spin,
} from "antd";
import "./style.less";
import { useHistory } from "react-router";
import axiosInstance from "../../../../axios";
import { useSelector } from "react-redux";
import { components } from "../../../../reusable/constant";
import { useDispatch } from "react-redux";
import * as actions from "../../../../store/actions/index";

import { Col, Row } from "antd";
import { useLocation } from "react-router-dom";
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

const openNotification = (placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: "Thêm mới page thành công",
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

const AddPage = (props) => {
  const elRef = useRef(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [menu, setMenu] = useState([]);
  const user = useSelector((state) => state.user);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const initialValues = {
    status: "1",
    availableActionId: ["1"],
    pageCode: "",
    pageName: "",
    path: "",
    menuId: null,
    numberOrder: "",
    component: null,
  };
  const [spinning, setSpinning] = useState(true);
  const history = useHistory();
  const location = useLocation();

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

  useEffect(() => {
    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);
    elRef.current.focus();
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    axiosInstance
      .get("/api/page/menu")
      .then((response) => {
        setMenu(response.data.data);
        setSpinning(false);
      })
      .catch((error) => {});
    return () => {};
  }, []);

  const checkEditting = () => {
    let formValues = form.getFieldsValue();

    let isEditting = formValues.pageCode === initialValues.pageCode;
    isEditting = isEditting && formValues.pageName === initialValues.pageName;
    isEditting =
      isEditting && formValues.numberOrder === initialValues.numberOrder;
    isEditting = isEditting && formValues.path === initialValues.path;
    isEditting = isEditting && formValues.menuId === initialValues.menuId;
    isEditting =
      isEditting &&
      JSON.stringify(formValues.availableActionId) ===
        JSON.stringify(initialValues.availableActionId);
    isEditting = isEditting && formValues.status === initialValues.status;
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

  const handleCreatePage = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.pageCode = formData.pageCode?.trim();
    formData.pageName = formData.pageName?.trim();
    formData.path = formData.path?.trim();

    if (formData.numberOrder) {
      formData.numberOrder = Number(formData.numberOrder);
    }
    formData.createdBy = user.employeeId;

    formData.availableActionId = formData.availableActionId.toString();
    formData.status = Number(formData.status);
    formData.component = formData.component === "" ? null : formData.component;

    axiosInstance
      .post("/api/page/create", formData)
      .then((response) => {
        props.onSpinning(false);
        dispatch(actions.getNav());
        dispatch(actions.getUser());
        dispatch(actions.changedRoute(true));
        openNotification();
        history.push(
          location.pathname.substr(0, location.pathname.lastIndexOf("/"))
        );
      })
      .catch((error) => {
        props.onSpinning(false);
        let code = error.response?.data?.code;
        if(code==="405"){
          openErrorNotification("Mã page đã tồn tại trên hệ thống");
        }
        else if(code==="406"){
          openErrorNotification("Tên page đã tồn tại trên hệ thống");
        }
        else if(code==="424"){
          openErrorNotification("Đường dẫn đã tồn tại trên hệ thống");
        }
        else {
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        }
      });
  };

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
        onOk={handleCreatePage}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Hủy"
      >
        Bạn có chắc chắn muốn thêm mới page này không?
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
        Bạn có chắc chắn muốn huỷ thao tác thêm mới page này không?
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
            <Row gutter={24}>
              <Col span={12} className="justify-content-center">
                <Form.Item
                  name="pageCode"
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      Mã page{" "}
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
                      whitespace: true,
                      message: "Mã page không được phép để trống",
                    },
                    {
                      pattern: /^(( )*|( )*[a-zA-Z0-9_-]{1,10}( )*)$/,
                      message: `Mã page không được vượt quá 10 ký tự, chỉ được phép nhập chữ a-z, số và ký tự đặc biệt "_" và "-"`,
                    },
                  ]}
                >
                  <Input
                    ref = {elRef}
                    autoComplete="off"
                    placeholder="Nhập mã page" />
                </Form.Item>
              </Col>

              <Col span={12} className="justify-content-center">
                <Form.Item
                  name="pageName"
                  label={
                    <p style={{ marginBottom: "0px" }}>
                      Tên page{" "}
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
                      whitespace: true,
                      message: "Tên page không được phép để trống",
                    },
                    {
                      pattern:
                        /^[0-9 aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ]{1,30}$/,
                      message:
                        "Tên page không được vượt quá 30 ký tự, chỉ được phép nhập chữ cái và số",
                    },
                  ]}
                >
                  <Input autoComplete="off" placeholder="Nhập tên page" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <div className="ant-advanced-search-form mt-2">
            <Form.Item
              name="menuId"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Menu{" "}
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
                  message: "Menu không được phép để trống",
                },
              ]}
            >
              <Select placeholder="Chọn menu">
                {menu.map((data, index) => (
                  <Option title={data.name} key={index} value={data.menuId}>
                    {data.menuName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="numberOrder"
              label="Thứ tự"
              required={false}
              rules={[
                {
                  validator: validateNumberOrder
                },
              ]}
            >
              <Input
                autoComplete="off"
                placeholder="Nhập thứ tự hiển thị"
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
              name="path"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Đường dẫn{" "}
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
                  max: 500,
                  message: "Đường dẫn không được vượt quá 500 ký tự",
                },
                {
                  required: true,
                  whitespace:true,
                  message: "Đường dẫn không được phép để trống"
                },
                {
                  pattern: /^(( )*|(( )*\/[A-Za-z0-9]+( )*))$/,
                  message: "Đường dẫn không đúng định dạng",
                },
              ]}
            >
              <Input autoComplete="off" placeholder="Nhập đường dẫn" />
            </Form.Item>
            <Form.Item
              name="component"
              label={<p style={{ marginBottom: "0px" }}>Chức năng</p>}
            >
              <Select placeholder="--Chọn chức năng--">
                <Option value="">Chọn chức năng</Option>
                {components.map((data, index) => (
                  <Option title={data.label} key={index} value={data.value}>
                    {data.label}
                  </Option>
                ))}

              </Select>
            </Form.Item>
            <Form.Item
              name="availableActionId"
              label="Quyền khả dụng"
              required={false}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn quyền thực thi cho page",
                },
              ]}
            >
              <Checkbox.Group>
                <Row gutter={24}>
                  <Col span={6}>
                    <Checkbox value="1" style={{ lineHeight: "32px" }}>
                      Read
                    </Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="2" style={{ lineHeight: "32px" }}>
                      Write
                    </Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="3" style={{ lineHeight: "32px" }}>
                      Update
                    </Checkbox>
                  </Col>
                  <Col span={6}>
                    <Checkbox value="4" style={{ lineHeight: "32px" }}>
                      Delete
                    </Checkbox>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              required={false}
              style={{ marginBottom: "2rem" }}
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
                Lưu
              </Button>{" "}
              <Button onClick={handleCancel}>Huỷ</Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default AddPage;
