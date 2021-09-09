import React, { useEffect } from "react";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";
import { Form, Row, Col, Button, Input } from "antd";
import "./style.less";

const Search = ({ roleName, onSearch }) => {
  const [form] = Form.useForm();

  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (["button"].indexOf(activeElement.tagName.toLowerCase()) !== -1) {
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
      window.removeEventListener("keyup", handleKeyUp, false);
    };
  }, []);

  const onFinish = (values) => {
    onSearch(values, 1);
  };

  return (
    <>
      <CCard>
        <CCardHeader>
          <h5 className="header">Thông tin tìm kiếm</h5>
        </CCardHeader>
        <CCardBody>
          <CCol xs="12">
            <Form
              form={form}
              name="advanced_search"
              initialValues={{
                roleName: roleName,
              }}
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="roleName"
                    label="Nhóm quản trị"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập thông tin nhóm quản trị"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          roleName: form.getFieldValue("roleName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Row>
                <Col
                  span={24}
                  style={{
                    textAlign: "left",
                  }}
                >
                  <Button type="danger" htmlType="submit">
                    Tìm kiếm
                  </Button>
                </Col>
              </Row>
            </Form>
          </CCol>
        </CCardBody>
      </CCard>
    </>
  );
};

export default Search;
