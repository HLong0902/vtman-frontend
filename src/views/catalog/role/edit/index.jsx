import React, { useEffect, useState, useRef } from "react";
import { Form, Button, Modal, Input, Spin, Select } from "antd";
import "./style.less";
import { useHistory, useParams, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../../../../store/actions/index";
import axiosInstance from "../../../../axios";
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

let initialValues = {
  roleName: "",
  description: "",
};

const checkRequired = (name) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const EditTopic = (props) => {
  const inputRef = useRef(undefined);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);
  const [formData, setFormData] = useState({});
  const [spinning, setSpinning] = useState(true);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [listRoleGroup, setListRoleGroup] = useState([]);

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
    let isEditting = formValues.roleName === initialValues.roleName;
    isEditting =
      isEditting && formValues.description === initialValues.description;
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
    let apiCount = 2;
    axiosInstance.get("/api/role/listRoleGroup").then(response => {
      setListRoleGroup(response.data.data);
      apiCount = apiCount - 1;
      checkApiCount(apiCount);
    }).catch(error => {
      openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
    });

    axiosInstance
      .get(`/api/role/detail?roleId=${id}`)
      .then((response) => {
        let role = response.data[0];

        initialValues = {
          roleId: role.roleId,
          roleName: role.roleName,
          roleGroup: role.roleGroup,
          description: role.description,
          status: role.status,
          createdBy: role.createdBy,
          createdDate: role.createdDate,
          updatedBy: role.updatedBy,
          updatedDate: role.updatedDate,
        };
        form.setFieldsValue(initialValues);
        apiCount = apiCount - 1;
        checkApiCount(apiCount);
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

  const handleEditRole = () => {
    setShowConfirm(false);
    props.onSpinning(true);
    formData.roleId = initialValues.roleId;
    formData.status = initialValues.status;
    formData.createdBy = initialValues.createdBy;
    formData.createdDate = initialValues.createdDate;
    formData.updatedDate = initialValues.updatedDate;
    formData.updatedBy = user.employeeId;
    axiosInstance
      .post(`/api/role/update`, formData)
      .then((response) => {
        props.onSpinning(false);
        let status = response.status;
        if (status === 200) {
          dispatch(
            actions.setRoleNotification({
              content: "C???p nh???t nh??m qu???n tr??? th??nh c??ng",
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
        onOk={handleEditRole}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="?????ng ??"
        cancelText="Hu???"
      >
        B???n c?? ch???c ch???n mu???n c???p nh???t nh??m qu???n tr??? n??y kh??ng?
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
        B???n c?? ch???c ch???n mu???n hu??? thao t??c c???p nh???t nh??m qu???n tr??? n??y kh??ng?
      </Modal>
      <Spin spinning={spinning}>
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          initialValues={initialValues}
          form={form}
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
              <Select placeholder="Ch???n quy???n">
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
                C???p nh???t
              </Button>{" "}
              <Button onClick={handleCancel}>Hu???</Button>
            </Form.Item>
          </div>
        </Form>
      </Spin>
    </>
  );
};

export default EditTopic;
