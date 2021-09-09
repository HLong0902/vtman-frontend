import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";
import { Form, Row, Col, Input, Button, Select } from "antd";
import "./style.less";
import axiosInstance from "../../../../axios";

const { Option } = Select;

const SearchTopic = ({
  questionDefinitionName,
  answerDefinition,
  topicId,
  onSearch,
}) => {
  const [listTopic, setListTopic] = useState([]);
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onSearch(values, 1);
  };

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
    axiosInstance.get("/api/question/topic").then((response) => {
      setListTopic(response.data.data);
    });

    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

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
                questionDefinitionName: questionDefinitionName,
                answerDefinition: answerDefinition,
                topicId: topicId,
              }}
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="questionDefinitionName"
                    label="Câu hỏi"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập câu hỏi"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          questionDefinitionName: form
                            .getFieldValue("questionDefinitionName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="answerDefinition"
                    label="Câu trả lời"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập câu trả lời"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          answerDefinition: form
                            .getFieldValue("answerDefinition")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="topicId"
                    label="Chủ đề"
                    labelCol={{ span: 24 }}
                  >
                    <Select placeholder="Chọn chủ đề">
                      <Option value="undefined">--Tất cả--</Option>
                      {listTopic.map((topic, index) => (
                        <Option key={index} value={topic.topicId}>
                          {topic.topicName.length > 50
                            ? topic.topicName.substr(0, 50) + "..."
                            : topic.topicName}
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
