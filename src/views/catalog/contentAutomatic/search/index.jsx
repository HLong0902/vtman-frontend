import React, {useEffect, useState} from "react";
import {CCard, CCardBody, CCardHeader, CCol} from "@coreui/react";
import {Button, Col, Form, Input, Row, Select} from "antd";
import axiosInstance from "../../../../axios";
import "./style.less";

const { Option } = Select;

const SearchAutoContent = ({automaticContentType, automaticContentName, onSearch}) => {
  const [autoContentType, setAutoContentType] = useState([]);
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

  useEffect(() => {
    axiosInstance
      .get("/api/autoContent/type")
      .then((response) => {
        setAutoContentType(response.data);
      })
      .catch((error) => {
      });
    return () => {
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
                automaticContentName: automaticContentName,
                automaticContentType: automaticContentType,
              }}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="automaticContentName"
                    label="Nội dung tin nhắn"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập nội dung tin nhắn"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          automaticContentName: form.getFieldValue("automaticContentName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="automaticContentType"
                    label="Loại tin nhắn tự động"
                    labelCol={{span: 24}}
                  >
                    <Select placeholder="Chọn loại tin nhắn tự động">
                      <Option value="">--Tất cả--</Option>
                      {autoContentType.map((data, index) => (
                        <Option title={data.name} key={index} value={data.automaticContentType}>
                          {data.name}
                        </Option>
                      ))}
                    </Select>
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

export default SearchAutoContent;
