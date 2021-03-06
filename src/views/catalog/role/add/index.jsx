import React, { useEffect, useState, useRef } from "react";
import { Form, Button, Modal, Input, Spin, Select } from "antd";
import "./style.less";
import { useHistory, useLocation } from "react-router";
import axiosInstance from "../../../../axios";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import { openErrorNotification } from "../../../base/notification/notification";

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

const AddRole = (props) => {
  const inputRef = useRef(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [form] = Form.useForm();
  const initialValues = {
    roleName: "",
    roleGroup: null
  };
  const [spinning, setSpinning] = useState(true);
  const [listRoleGroup, setListRoleGroup] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleCancel = () => {
    checkEditting();
  };

  const goBack = () => {
    let url = location.pathname.substr(0, location.pathname.lastIndexOf("/"));
    history.push(url);
  };

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1) {
        activeElement.click();
      } else {
        let className = activeElement.className !== "ant-input skip-enter";
        if (className) {
          form.submit();
        }
      }
    }
  };

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.roleName === initialValues.roleName;
    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      goBack();
    }
  };

  const handleCreateRole = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.createdBy = user.employeeId;
    axiosInstance
      .post("/api/role/create", formData)
      .then((response) => {
        props.onSpinning(false);
        let status = response.status;
        if (status === 200) {
          dispatch(
            actions.setRoleNotification({
              content: "Th??m m???i nh??m qu???n tr??? th??nh c??ng",
              show: true,
              status: "success",
            })
          );
          goBack();
        }
      })
      .catch((error) => {
        props.onSpinning(false);
        let code = error.response?.data?.code;
        if(code === "400"){
          openErrorNotification("Nh??m qu???n tr??? ???? t???n t???i tr??n h??? th???ng");
          return;
        }
        openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
      });
  };

  useEffect(() => {
    axiosInstance.get("/api/role/listRoleGroup").then(response => {
      setListRoleGroup(response.data.data);
      setSpinning(false);
    }).catch(error => {
      openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
    });

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
        onOk={handleCreateRole}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="?????ng ??"
        cancelText="Hu???"
      >
        B???n c?? ch???c ch???n mu???n th??m m???i nh??m qu???n tr??? n??y kh??ng?
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
        B???n c?? ch???c ch???n mu???n hu??? thao t??c th??m m???i nh??m qu???n tr??? n??y kh??ng?
      </Modal>

      <Spin spinning={spinning}>
        <Form
          form={form}
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
        >
          <div className="ant-advanced-search-form mt-2">
            <Form.Item
              name="roleName"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Nh??m qu???n tr???{" "}
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
                    "T??n nh??m qu???n tr??? kh??ng ???????c ph??p ????? tr???ng"
                  ),
                },
                {
                  pattern: /^[0-9 aA????????????????????????????????????????????????????????????????????????????????????????????bBcCdD????eE????????????????????????????????????????????????????????????fFgGhHiI????????????????????????jJkKlLmMnNoO????????????????????????????????????????????????????????????????????????????????????????????pPqQrRsStTuU??????????????????????????????????????????????????????????vVwWxXyY????????????????????????????zZ]{1,50}$/,
                  message: `T??n nh??m qu???n tr??? kh??ng ???????c v?????t qu?? 50 k?? t???, ch??? g???m s??? v?? ch??? c??i, kh??ng nh???p k?? t??? ?????c bi???t`,
                },
              ]}
            >
              <Input
                ref={inputRef}
                placeholder="Nh???p t??n nh??m qu???n tr???"
                autoComplete="off"
                onBlur={() => {
                  form.setFieldsValue({
                    roleName: form.getFieldValue("roleName")?.trim(),
                  });
                }}
              />
            </Form.Item>

            <Form.Item
              name="roleGroup"
              label={
                <p style={{ marginBottom: "0px" }}>
                  Quy???n
                </p>
              }
            >
              <Select
                placeholder="Ch???n quy???n"
              >
                {listRoleGroup.map((roleGroup, index) => (
                  <Option key={index} value={roleGroup.value}>
                    {roleGroup.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="description"
              label={<p style={{ marginBottom: "0px" }}>M?? t??? </p>}
              rules={[
                {
                  max: 200,
                  message: "M?? t??? kh??ng ???????c v?????t qu?? 200 k?? t???",
                },
              ]}
            >
              <Input.TextArea
                className="skip-enter"
                placeholder="Nh???p m?? t???"
                autoComplete="off"
                onBlur={() => {
                  form.setFieldsValue({
                    description: form.getFieldValue("description")?.trim(),
                  });
                }}
              />
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

export default AddRole;
