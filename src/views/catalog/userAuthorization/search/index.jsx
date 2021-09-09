import React, { useEffect, useState, useRef } from "react";
import { CCard, CCardBody, CCardHeader, CCol } from "@coreui/react";
import { Form, Row, Col, Button, Select, AutoComplete } from "antd";
import "./style.less";
import axiosInstance from "../../../../axios";
import { removeVietnameseTones } from "../../../../reusable/utils";

const { Option } = Select;

const SearchUser = ({ employee, roleId, departmentId, onSearch }) => {
  const [listEmployee, setListEmployee] = useState([]);
  const [listDepartment, setListDepartment] = useState([]);
  const [listRole, setListRole] = useState([]);
  const [form] = Form.useForm();
  const [options, setOptions] = useState([]);
  const searchTimeoutRef = useRef(null);

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
    axiosInstance.get("/api/userAuthorization/employee").then((response) => {
      let data = response.data.data.map((employee) => ({
        key: employee.employeeId,
        value: employee.employeeName,
      }));
      setOptions(data);
      setListEmployee(data);
    });

    axiosInstance.get("/api/userAuthorization/role").then((response) => {
      setListRole(response.data.data);
    });

    axiosInstance.get("/api/userAuthorization/department").then((response) => {
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

  const handleSearchOption = (val) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    };

    searchTimeoutRef.current = setTimeout(() => {
      val = removeVietnameseTones(val.trim());
      let filtered = listEmployee.filter(
        (obj) => removeVietnameseTones(obj.value.toString().toLowerCase()).includes(val.toLowerCase())
      );
      setOptions(filtered);
    }, 400);
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
                employee: employee,
                roleId: roleId,
                departmentId: departmentId
              }}
              onFinish={onFinish}
            >
              <Row gutter={24}>
                <Col span={8}>
                  <Form.Item
                    name="employee"
                    label="Nhân viên"
                    labelCol={{ span: 24 }}
                  >
                    <AutoComplete
                      options={options}
                      placeholder="Nhập nhân viên"
                      onSearch={handleSearchOption}
                      onSelect={(val, option) => {
                        form.setFieldsValue({
                          employee: option.value.trim()
                        })
                      }}
                      onBlur={()=>{
                        let value = form.getFieldValue("employee");
                        form.setFieldsValue({
                          employee: value.trim()
                        })
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col span={8}>
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
                <Col span={8}>
                  <Form.Item
                    name="roleId"
                    label="Nhóm quản trị"
                    labelCol={{ span: 24 }}
                  >
                    <Select placeholder="Chọn nhóm quản trị">
                      <Option value="undefined">--Tất cả--</Option>
                      {listRole.map((role, index) => (
                        <Option key={index} value={role.roleId}>
                          {role.roleName}
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

export default SearchUser;
