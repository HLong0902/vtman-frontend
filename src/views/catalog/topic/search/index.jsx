import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";
import { Form, Row, Col, Input, Button, Select } from "antd";
import "./style.less";
import axiosInstance from "../../../../axios";

const { Option } = Select;

const SearchTopic = ({ topicName, departmentId, onSearch }) => {
  const [listDepartment, setListDepartment] = useState([]);
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
    axiosInstance.get("/api/topic/department").then((response) => {
      setListDepartment(response.data.data);
    });

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
                topicName: topicName,
                departmentId: departmentId,
              }}
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="topicName"
                    label="Tên chủ đề"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập tên chủ đề"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          topicName: form.getFieldValue("topicName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="departmentId"
                    label="Phòng ban"
                    labelCol={{ span: 24 }}
                  >
                    <Select placeholder="Chọn phòng ban">
                      <Option value="undefined">--Tất cả--</Option>
                      {listDepartment.map((department, index) => (
                        <Option key={index} value={department.departmentId}>
                          {department.departmentName}
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

export default SearchTopic;
