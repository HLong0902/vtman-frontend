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
  Row,
  Col,
  Spin,
} from "antd";
import "./style.less";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../axios";
import { components } from "../../../../reusable/constant";
import { useDispatch } from "react-redux";
import * as actions from "../../../../store/actions/index";
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
    description: "Cập nhật page thành công",
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
  pageId: null,
  pageCode: "",
  pageName: "",
  menuId: null,
  numberOrder: "",
  path: "",
  availableActionId: [""],
  status: 1,
  component: null,
};

const addComponent = [
  {
    value: "Menu",
    label: "Quản lý menu"
  },
  {
    value: "Page",
    label: "Quản lý page"
  },
  {
    value: "Permission",
    label: "Phân quyền"
  },
  {
    value: "UserAuthorization",
    label: "Cập nhật người dùng"
  },
  {
    value: "Role",
    label: "Nhóm quản trị"
  },
  {
    value: "Department",
    label: "Quản lý phòng ban"
  }
]

const EditMenu = (props) => {
  const elRef = useRef(undefined);
  const [newComponent, setNewComponent] = useState([]);
  const [isSystemPage, setIsSystemPage] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [menu, setMenu] = useState([]);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [spinning, setSpinning] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const url1 = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
  const url = url1.substr(0, url1.lastIndexOf("/"));

  const { id } = useParams();
  const [form] = Form.useForm();

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

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.pageCode === initialValues.pageCode;
    isEditting = isEditting && formValues.pageName === initialValues.pageName;
    isEditting =
      isEditting && formValues.numberOrder === initialValues.numberOrder;
    isEditting = isEditting && formValues.path === initialValues.path;
    isEditting = isEditting && formValues.component === initialValues.component;
    isEditting = isEditting && formValues.menuId === initialValues.menuId;
    isEditting =
      isEditting &&
      JSON.stringify(formValues.availableActionId) ===
        JSON.stringify(initialValues.availableActionId);
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
      .get(`/api/page/getById?pageId=${id}`)
      .then((response) => {
        if(response.data.data[0].isSystemPage === 1){
          setNewComponent([...components,...addComponent]);
        }
        else {
          setNewComponent(components);
        }
        setIsSystemPage(
          response.data.data[0].isSystemPage === 1 ? true : false
        );
        initialValues = {
          pageId: id,
          pageCode: response.data.data[0].pageCode,
          pageName: response.data.data[0].pageName,
          menuId: response.data.data[0].menuId,
          numberOrder: `${response.data.data[0].numberOrder ? response.data.data[0].numberOrder : ""}`,
          path: response.data.data[0].path,
          availableActionId: response.data.data[0].availableActionId.split(","),
          status: response.data.data[0].status.toString(),
          component:
            response.data.data[0].component === ""
              ? null
              : response.data.data[0].component,
        };

        form.setFieldsValue(initialValues);
        setSpinning(false);
      })
      .catch((error) => {});

    axiosInstance
      .get("/api/page/menu")
      .then((response) => {
        setMenu(response.data.data);
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

  const handleEditPage = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.pageCode = formData.pageCode?.trim();
    formData.pageName = formData.pageName?.trim();
    if (formData.path !== undefined) {
      formData.path = formData.path?.trim();
    }
    if (formData.numberOrder) {
      formData.numberOrder = Number(formData.numberOrder);
    }
    formData.availableActionId = formData.availableActionId.toString();
    formData.status = Number(formData.status);
    formData.pageId = Number(id);
    formData.updatedBy = user.employeeId;
    formData.component = formData.component === "" ? null : formData.component;

    axiosInstance
      .put(`/api/page/update?pageId=${formData.pageId}`, formData)
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
        let code = error.response?.data?.code;
        if (code === "406") {
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
        onOk={handleEditPage}
        onCancel={() => {
          setShowConfirm(false);
        }}
      >
        Bạn có chắc chắn muốn cập nhật page này không?
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
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn huỷ thao tác cập nhật page này không?
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
                      message: "Mã page không được phép để trống",
                    },
                    {
                      pattern: /^(( )*|( )*[a-zA-Z0-9_-]{1,10}( )*)$/,
                      message: `Mã page không được vượt quá 10 ký tự, chỉ được phép nhập chữ a-z, số và ký tự đặc biệt "_" và "-"`,
                    },
                  ]}
                >
                  <Input
                    disabled={true}
                    autoComplete="off"
                    placeholder="Nhập mã page"
                  />
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
                      message: "Tên page không được để trống",
                    },
                    {
                      pattern:
                        /^[0-9 aAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ]{1,30}$/,
                      message:
                        "Tên page không được vượt quá 30 ký tự, chỉ được phép nhập chữ cái và số",
                    },
                  ]}
                >
                  <Input
                    ref = {elRef}
                    autoComplete="off"
                    placeholder="Nhập tên page" />
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
              <Select disabled={isSystemPage} placeholder="--Chọn chức năng--">
                <Option value="">Chọn chức năng</Option>
                {newComponent.map((data, index) => (
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
              <Checkbox.Group disabled={isSystemPage}>
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
              rules={[
                {
                  required: true,
                  message: "Chọn trạng thái",
                },
              ]}
            >
              <Radio.Group disabled={isSystemPage}>
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

export default EditMenu;
