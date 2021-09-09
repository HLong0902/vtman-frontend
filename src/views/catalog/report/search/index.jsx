import React, {useEffect, useState} from "react";
import {CCard, CCardBody, CCardHeader, CCol} from "@coreui/react";
import {Button, Col, DatePicker, Form, Row, Select,} from "antd";
import axiosInstance, {BASE_URL} from "../../../../axios";
import "./style.less";
const { RangePicker } = DatePicker;
const {Option} = Select

const Search = ({reportType, departmentId, topicId, date, onSearch, user, listDepartment}) => {
  const [form] = Form.useForm();
  const [listTopic, setListTopic] = useState([])


  const handleKeyUp = (event) => {
    if (event.keyCode === 13) {
      let activeElement = document.activeElement;
      if (['button'].indexOf(activeElement.tagName.toLowerCase()) !== -1) {
        activeElement.click();
      } else {
        form.submit();
      }
    }
  };

  useEffect(() => {
    axiosInstance.get("/api/report/getTopic").then((response) => {
      setListTopic(response.data);
    });

    setTimeout(() => {
      window.addEventListener("keyup", handleKeyUp);
    }, 100);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const onFinish = (values) => {
    switch (values.reportType){
      case "1":{
        values.url=`${BASE_URL}/api/report/answerPercent`;
        break;
      }
      case "2":{
        values.url=`${BASE_URL}/api/report/rating`;
        break;
      }
      case "3":{
        values.url=`${BASE_URL}/api/report/topic`;
        break;
      }
      case "4":{
        values.url=`${BASE_URL}/api/report/question`;
        break;
      }
    }
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
                reportType: reportType,
                departmentId: departmentId,
                topicId: topicId,
                date: date
              }}
            >
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    name="reportType"
                    label="Loại báo cáo"
                    labelCol={{span: 24}}
                    required={false}
                    rules={[
                      {
                        required: true,
                        message: "Chọn loại báo cáo",
                      },
                    ]}
                  >
                    <Select placeholder="Chọn loại báo cáo" >
                      <Option value="1">Tỷ lệ trả lời của các phòng ban</Option>
                      <Option value="2">Chất lượng trả lời của các phòng ban</Option>
                      <Option value="3">Câu hỏi đã nhận từ phòng ban theo chủ đề</Option>
                      <Option value="4">Câu hỏi tự đặt theo phòng ban</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="date"
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
                <Col span={6}>
                  <Form.Item
                    name="departmentId"
                    label="Phòng ban"
                    labelCol={{span: 24}}
                  >
                      <Select placeholder="Chọn phòng ban">
                     <Option value={""}>--Tất cả--</Option>
                        {listDepartment.map((department, index) => (
                          <Option key={index} value={department.departmentId}>
                            {department.departmentName}
                          </Option>
                        ))}
                      </Select>
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="topicId"
                    label="Chủ đề"
                    labelCol={{span: 24}}
                  >
                    <Select placeholder="Chọn chủ đề">
                      <Option value={""}>--Tất cả--</Option>
                      {listTopic.map((data, index) => (
                        <Option key={index} value={data.id}>
                          {data.topic}
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

export default Search;
