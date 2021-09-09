/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";
import { Form, Row, Col, Input, Button, Select, DatePicker } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import "./style.less";
import axiosInstance from "../../../../axios";

const { Option } = Select;
const { RangePicker } = DatePicker;

const SearchForm = ({
  historyFaqName,
  employeeName,
  answer,
  topicId,
  status,
  startDate,
  endDate,
  departmentId,
  createdBy,
  onSearch,
  answerEmployee
}) => {
  const [listTopic, setListTopic] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);
  const [form] = Form.useForm();
  const [expand, setExpand] = useState(false);

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
    axiosInstance.get("/api/historyFaqs/topic").then((response) => {
      setListTopic(response.data.data);
    });
    axiosInstance.get("/api/historyFaqs/departmentStatus").then((response) => {
      setListDepartment(response.data.data);
    });

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
          <CCol xs="12"></CCol>
          <CCol>
            <Form
              form={form}
              name="advanced_search"
              initialValues={{
                historyFaqName: historyFaqName,
                employeeName: employeeName,
                answer: answer,
                topicId: topicId,
                departmentId: departmentId,
                status: status,
                startDate: startDate,
                endDate: endDate,
                createdBy: createdBy,
                answerEmployee: answerEmployee
              }}
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="historyFaqName"
                    label="Câu hỏi"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập câu hỏi"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          historyFaqName: form
                            .getFieldValue("historyFaqName")
                            ?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="answer"
                    label="Câu trả lời"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập câu trả lời"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          answer: form.getFieldValue("answer")?.trim(),
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
                      <Option value="null">--Tất cả--</Option>
                      {listTopic.map((topic, index) => (
                        <Option key={index} value={topic.topicId}>
                          {topic.topicName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="departmentId"
                    label="Phòng ban"
                    labelCol={{ span: 24 }}
                  >
                    <Select placeholder="Chọn phòng ban">
                      <Option value="null">--Tất cả--</Option>
                      {listDepartment.map((department, index) => (
                        <Option key={index} value={department.departmentId}>
                          {department.departmentName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    labelCol={{ span: 24 }}
                  >
                    <Select placeholder="Chọn trạng thái">
                      <Option value="null">--Tất cả--</Option>
                      <Option value="1">Chưa trả lời</Option>
                      <Option value="2">Đã trả lời</Option>
                      <Option value="3">Hết hạn trả lời</Option>
                      <Option value="4">Đã đóng</Option>
                      <Option value="5">Đã huỷ</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="employeeName"
                    label="Người hỏi"
                    labelCol={{ span: 24 }}
                  >
                    <Input
                      placeholder="Nhập người hỏi"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          employeeName: form
                            .getFieldValue("employeeName")
                            ?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {expand && (
                <Row gutter={24}>
                  <Col span={8}>
                    <Form.Item
                      name="answerEmployee"
                      label="Người trả lời"
                      labelCol={{ span: 24 }}
                    >
                      <Input
                        placeholder="Nhập người hỏi"
                        autoComplete="off"
                        onBlur={() => {
                          form.setFieldsValue({
                            answerEmployee: form
                              .getFieldValue("answerEmployee")
                              ?.trim(),
                          });
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="startDate"
                      label="Thời gian hỏi"
                      labelCol={{ span: 24 }}
                    >
                      <RangePicker
                        inputReadOnly
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        allowEmpty={[true, true]}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="endDate"
                      label="Thời gian trả lời"
                      labelCol={{ span: 24 }}
                    >
                      <RangePicker
                        inputReadOnly
                        style={{ width: "100%" }}
                        format="DD/MM/YYYY"
                        placeholder={["Từ ngày", "Đến ngày"]}
                        allowEmpty={[true, true]}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              )}
              <Row>
                <Col
                  span={24}
                  style={{
                    textAlign: "left",
                  }}
                >
                  <Button
                    type="danger"
                    htmlType="submit"
                    style={{ marginRight: "8px" }}
                  >
                    Tìm kiếm
                  </Button>
                  <Button
                    style={{ marginRight: "8px" }}
                    onClick={()=>{
                      setExpand(!expand);
                    }}
                  >
                    {expand ? (<><UpOutlined style={{verticalAlign: "middle"}} />{" "}Thu gọn</>) : (<><DownOutlined style={{verticalAlign: "middle"}} />{" "}Mở rộng</>)}
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

export default SearchForm;
