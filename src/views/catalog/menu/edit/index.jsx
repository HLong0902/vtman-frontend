import React, {useEffect, useRef, useState} from "react";
import "antd/dist/antd.css";
import { Form, Select, Button, Input, Modal, notification, Spin } from "antd";
import "./style.less";
import { useHistory, useLocation, useParams } from "react-router-dom";
import axiosInstance from "../../../../axios";
import listIcon from "../listIcon";
import CIcon from "@coreui/icons-react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import * as actions from "../../../../store/actions/index";
import { validateNumberOrder } from "../../../../reusable/utils";

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
    description: "Cập nhật menu thành công",
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
  menuName: "",
  icon: null,
  numberOrder: "",
  menuPath: "",
  description: "",
};

const EditMenu = (props) => {
  const elRef = useRef(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [menuData, setMenuData] = useState({});
  const user = useSelector((state) => state.user);
  const history = useHistory();
  const location = useLocation();
  const url1 = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
  const url = url1.substr(0, url1.lastIndexOf("/"));
  const { id } = useParams();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [spinning, setSpinning] = useState(true);

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1
        || activeElement.localName === "textarea"
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

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.menuName === initialValues.menuName;
    isEditting =
      isEditting && formValues.numberOrder === initialValues.numberOrder;
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
      .get(`/api/menu/detail?menuId=${id}`)
      .then((response) => {
        setMenuData(response.data);
        initialValues = {
          menuName: response.data.menuName,
          menuId: id,
          numberOrder: `${response.data.numberOrder ? response.data.numberOrder : ""}`,
          menuPath: response.data.menuPath,
          description: response.data.description,
          icon: response.data.icon === "" ? null : response.data.icon,
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

  const handleEditMenu = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.updatedBy = user.employeeId;
    formData.menuId = Number(id);
    formData.createdBy = menuData.createdBy;
    if(formData.description !== null) {
      formData.description = formData.description?.trim();
    }
    formData.menuName = formData.menuName?.trim();
    formData.menuPath = formData.menuPath?.trim();

    axiosInstance
      .post(`/api/menu/update`, formData)
      .then((response) => {
          props.onSpinning(false);
          dispatch(actions.getNav());
          dispatch(actions.getUser());
          dispatch(actions.changedRoute(true));
          openNotification();
          history.push(url);
      })
      .catch((error) => {
        props.onSpinning(false);
        let code=error.response?.data?.code;
        if (code==="407"){
          openErrorNotification("Tên menu đã tồn tại trên hệ thống");
        }
        else if(code === "423"){
          openErrorNotification("Đường dẫn đã tồn tại trên hệ thống");
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
        onOk={handleEditMenu}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn cập nhật menu này không?
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
        Bạn có chắc chắn muốn huỷ thao tác cập nhật menu này không?

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
              name="menuName"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Tên menu{" "}
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
                  message: "Tên menu không được phép để trống",
                },
                {
                  pattern:
                    /^[0-9 aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ]{1,30}$/,
                  message:
                    "Tên menu không được vượt quá 30 ký tự, chỉ được phép nhập chữ cái và số",
                },
              ]}
            >
              <Input
                ref = {elRef}
                autoComplete="off"
                placeholder="Nhập tên menu" />
            </Form.Item>
          </div>
          <div className="ant-advanced-search-form mt-2">
            <Form.Item name="icon" label="Biểu tượng" required={false}>
              <Select
                placeholder="--Chọn icon--"
                style={{ width: "30%", textAlign: "center" }}
              >
                <option style={{ textAlign: "center" }} value="">
                  --Chọn--
                </option>
                {listIcon.map((data, index) => (
                  <option
                    style={{ textAlign: "center" }}
                    title={data}
                    key={index}
                    value={data}
                  >
                    <CIcon name={data} />
                  </option>
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
              name="menuPath"
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
              name="description"
              label="Mô tả"
              required={false}
              rules={[
                {
                  max: 250,
                  message: "Mô tả không được vượt quá 250 ký tự",
                },
              ]}
            >
              <Input.TextArea autoComplete="off" placeholder="Nhập mô tả" />
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

export default EditMenu;
