import React, {useEffect, useState} from "react";
import {CCard, CCardBody, CCardHeader, CCol} from "@coreui/react";
import {Button, Col, Form, Input, Row, Select} from "antd";
import axiosInstance from "../../../../axios";
import "./style.less";

const { Option } = Select;
const Search = ({pageCode, pageName, menuId, status, onSearch}) => {
  const [form] = Form.useForm();
  const [menu, setMenu] = useState([])

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
      .get("/api/page/menu")
      .then((response) => {
        setMenu(response.data.data);
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
                pageName: pageName,
                pageCode: pageCode,
                menuId: menuId,
                status: status,
              }}
            >
              <Row gutter={24}>
                <Col span={6}>
                  <Form.Item
                    name="pageCode"
                    label="Mã page"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập mã page"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          pageCode: form.getFieldValue("pageCode")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="pageName"
                    label="Tên page"
                    labelCol={{span: 24}}
                  >
                    <Input
                      placeholder="Nhập tên page"
                      autoComplete="off"
                      onBlur={() => {
                        form.setFieldsValue({
                          pageName: form.getFieldValue("pageName")?.trim(),
                        });
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="menuId"
                    label="Menu"
                    labelCol={{span: 24}}
                  >
                    <Select placeholder="Chọn menu">
                      <Option value="">--Tất cả--</Option>
                      {menu.map((data, index) => (
                        <Option title={data.name} key={index} value={data.menuId}>
                          {data.menuName}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                < Col span={6}>
                  <Form.Item
                    name="status"
                    label="Trạng thái"
                    labelCol={{span: 24}}
                  >
                    <Select>
                      <Option value="">--Tất cả--</Option>
                      <Option value="1">Hoạt động</Option>
                      <Option value="0">Không hoạt động</Option>
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
