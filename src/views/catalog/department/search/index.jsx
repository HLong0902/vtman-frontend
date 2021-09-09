import React, {useEffect} from "react";
import {CCard, CCardBody, CCardHeader, CCol} from "@coreui/react";
import {Button, Col, Form, Input, Row, Select} from "antd";
import "./style.less";

const Search = ({departmentCode, departmentName, status, onSearch}) => {
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
                departmentCode: departmentCode,
                departmentName: departmentName,
                status: status
              }}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="departmentCode"
                    label="Mã phòng ban"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập mã phòng ban"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          departmentCode: form.getFieldValue("departmentCode")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="departmentName"
                    label="Tên phòng ban"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập tên phòng ban"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          departmentName: form.getFieldValue("departmentName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                < Col span={8}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    labelCol={{span: 24}}
                  >
                    <Select>
                      <option value="">--Tất cả--</option>
                      <option value="1">Hoạt động</option>
                      <option value="0">Không hoạt động</option>
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
