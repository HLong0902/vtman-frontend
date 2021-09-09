/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { Table, Tag, DatePicker, Modal } from "antd";
import { CCard, CCol, CRow } from "@coreui/react";
import { changeDayName } from "./utils";
import EditModal from "./modal";
import "./style.less";
import {
  openErrorNotification,
  openNotification,
} from "../../base/notification/notification";
import axiosInstance from "../../../axios";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import moment from 'moment';

const getDay = () => {
  let today = new Date();
  let dd = today.getDate() > 10 ? today.getDate() : `0${today.getDate()}`;
  let mm =
    today.getMonth() + 1 > 10 ? today.getMonth() : `0${today.getMonth() + 1}`;
  var yyyy = today.getFullYear();
  return { dd, mm, yyyy };
};

const disabledDate = (current) => {
  return (current &&current <moment().endOf('day').subtract(1, 'days'));
}

const WorkTime = (props) => {
  const [loading, setLoading] = useState(false);
  const [dayOff, setDayOff] = useState(null);
  const [selectedDayOff, setSelectedDayOff] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [days, setDays] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const permissions = useSelector((state) => state.user.permissions);
  const location = useLocation();

  const updateCalendar = () => {
    setLoading(true);
    axiosInstance
      .get("/api/workCalendar/getCalendar")
      .then((response) => {
        setCalendar(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        setLoading(false);
      });
  };

  const columns = [
    {
      title: "Thứ",
      dataIndex: "days",
      render: (days) => changeDayName(days),
      sorter: true,
      width: "15%",
    },
    {
      title: "Trạng thái",
      dataIndex: "",
      width: "20%",
      render: (item) => {
        let status = item.status;
        if (status === 1) {
          return <p style={{ color: "#1890ff" }}>• Làm việc</p>;
        } else if (status === 2) {
          return <p style={{ color: "rgb(255 118 0)" }}>• Làm buổi sáng</p>;
        } else if (status === 3) {
          return <p style={{ color: "#73777b" }}>• Nghỉ</p>;
        } else {
          return null;
        }
      },
      sorter: true,
    },
    {
      title: "Giờ làm việc buổi sáng",
      dataIndex: "",
      render: (item) => (
        <p>
          {item.status === 1 || item.status === 2
            ? item.beginWorkTimeAM && item.endWorkTimeAM
              ? `${item.beginWorkTimeAM} - ${item.endWorkTimeAM}`
              : ""
            : ""}
        </p>
      ),
      width: "25%",
      sorter: true,
    },
    {
      title: "Giờ làm việc buổi chiều",
      dataIndex: "",
      render: (item) => (
        <p>
          {item.status === 1
            ? item.beginWorkTimePM && item.endWorkTimePM
              ? `${item.beginWorkTimePM} - ${item.endWorkTimePM}`
              : ""
            : ""}
        </p>
      ),
      width: "25%",
      sorter: true,
    },
    {
      title: "Hành động",
      align: "center",
      dataIndex: "",
      width: "20%",
      render: (day) => {
        if (permissions[location.pathname].indexOf(3) !== -1) {
          return (
            <EditModal
              day={{ ...day, dayName: changeDayName(day.days) }}
              isSaturday={day.days === "SAT"}
              updateCalendar={updateCalendar}
            ></EditModal>
          );
        } else {
          return (
            <div className="text-center">
              <a
                href=""
                onClick={(e) => {
                  e.preventDefault();
                }}
                style={{
                  color: "rgb(115, 119, 123)",
                  pointerEvents: "none",
                }}
                className="mr-2"
              >
                Sửa
              </a>
            </div>
          );
        }
      },
    },
  ];

  const removeDayOff = () => {
    props.onSpinning(true);
    axiosInstance
      .get("/api/workCalendar/deleteDayOff?dateStr=" + selectedDayOff)
      .then((response) => {
        props.onSpinning(false);
        setDays(days.filter((day) => day !== selectedDayOff));
        openNotification("Xoá ngày nghỉ thành công");
        updateCalendar();
      })
      .catch((error) => {
        props.onSpinning(false);
        let code = error.response?.data?.code;
        if (code === "70") {
          openErrorNotification("Ngày nghỉ không tồn tại");
          axiosInstance
            .get("/api/workCalendar/getDayOff")
            .then((response) => {
              setDays(response.data.data.map((day) => day.dateTime));
            })
            .catch((error) => {
              openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
            });
        } else {
          openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        }
      });
  };

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get("/api/workCalendar/getCalendar")
      .then((response) => {
        setLoading(false);
        setCalendar(response.data.data);
      })
      .catch((error) => {
        setLoading(false);
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
    axiosInstance
      .get("/api/workCalendar/getDayOff")
      .then((response) => {
        setDays(response.data.data.map((day) => day.dateTime));
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
    return () => {};
  }, []);

  return (
    <>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Thông báo
          </div>
        }
        visible={showConfirm}
        onOk={() => {
          setShowConfirm(false);
          removeDayOff();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="Đồng ý"
        cancelText="Huỷ"
      >
        Bạn có chắc chắn muốn xoá ngày nghỉ này không?
      </Modal>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">Lịch làm việc</h5>
              </CCol>
              <CCol md="6"></CCol>
            </CRow>
            <div className="col-12">
              <Table
                columns={columns}
                rowKey={(record) => record.workCalendarId}
                dataSource={calendar}
                loading={loading}
                locale={{ emptyText: "Không có bản ghi nào" }}
                pagination={false}
              />
            </div>
          </CCard>
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <CCard>
            <CRow>
              <CCol md="6">
                <h5 className="m-3 header">
                  Ngày nghỉ lễ tết đặc biệt trong năm
                </h5>
              </CCol>
              <CCol md="6"></CCol>
            </CRow>
            <hr className="mt-0" />
            <div className="col-12 mb-4">
              {days.map((day, index) => (
                <Tag
                  className="mb-2"
                  style={{ padding: "5px" }}
                  closable={permissions[location.pathname].indexOf(4) !== -1}
                  onClose={(e) => {
                    e.preventDefault();
                    let removeDay = day.split("/");
                    removeDay = `${removeDay[2]}/${removeDay[1]}/${removeDay[0]}`;
                    const { dd, mm, yyyy } = getDay();
                    if (removeDay >= `${yyyy}/${mm}/${dd}`) {
                      setSelectedDayOff(day);
                      setTimeout(() => {
                        setShowConfirm(true);
                      }, 100);
                    } else {
                      openErrorNotification(
                        "Không được phép xóa ngày nghỉ nhỏ hơn ngày hiện tại"
                      );
                    }
                  }}
                  key={index}
                >
                  {day}
                </Tag>
              ))}
              <DatePicker
                inputReadOnly
                open={openDatePicker}
                value={dayOff}
                className="mr-2 day-off"
                placeholder="Thêm ngày nghỉ"
                format="DD/MM/YYYY"
                style={{
                  border: "1px solid #ff4d4f",
                  backgroundColor: "#ff4d4f",
                  color: "white",
                }}
                disabled={permissions[location.pathname].indexOf(2) === -1}
                disabledDate={disabledDate}
                onClick={() => {
                  if (!openDatePicker) {
                    setOpenDatePicker(true);
                  }
                }}
                onBlur={() => {
                  setOpenDatePicker(false);
                  setDayOff(null);
                }}
                onSelect={(value) => {
                  setDayOff(value);
                  if (value) {
                    if (days.indexOf(value.format("DD/MM/YYYY")) > -1) {
                      openErrorNotification("Ngày nghỉ đã tồn tại trên hệ thống");
                    } else {
                      let temp = [...days, value.format("DD/MM/YYYY")];
                      temp = temp.sort((a, b) => {
                        a = a.split("/").reverse().join("");
                        b = b.split("/").reverse().join("");
                        return a > b ? 1 : a < b ? -1 : 0;
                      });
                      props.onSpinning(true);
                      axiosInstance
                        .post("/api/workCalendar/create", {
                          dateStr: value.format("DD/MM/YYYY"),
                        })
                        .then((response) => {
                          props.onSpinning(false);
                          setOpenDatePicker(false);
                          setDays(temp);
                          setDayOff(null);
                          openNotification("Cập nhật lịch làm việc thành công");
                          updateCalendar();
                        })
                        .catch((error) => {});
                    }
                  }
                }}
              />
            </div>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default WorkTime;
