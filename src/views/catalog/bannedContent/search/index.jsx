import React, {useEffect} from "react";
import {CCard, CCardBody, CCardHeader, CCol} from "@coreui/react";
import {Button, Col, Form, Input, Row} from "antd";
import "./style.less";

const SearchBannedContent = ({bannedContentName, onSearch}) => {
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
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onFinish = (values) => {
    onSearch(values);
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
              onFinish={onFinish}
              initialValues={{
                bannedContentName: bannedContentName,
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="bannedContentName"
                    label="Từ khóa bị cấm"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập từ khóa bị cấm"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          bannedContentName: form.getFieldValue("bannedContentName")?.trim(),
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

export default SearchBannedContent;
