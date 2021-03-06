/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Form, Radio, Button, Modal } from "antd";
import "./style.less";
import CustomSelect from "../customSelect";
import axiosInstance from "../../../../axios";
import {
  openErrorNotification,
  openNotification,
} from "../../../base/notification/notification";

const useTimeOption = (time) => {
  if (time === "am") {
    let workTimeAMOptions = [];
    for (let i = 7; i < 13; i++) {
      if (i < 10) {
        workTimeAMOptions = [...workTimeAMOptions, `0${i}:00`, `0${i}:30`];
      } else {
        workTimeAMOptions = [...workTimeAMOptions, `${i}:00`, `${i}:30`];
      }
    }
    return workTimeAMOptions;
  } else {
    let workTimePMOptions = [];
    for (let i = 13; i < 19; i++) {
      workTimePMOptions = [...workTimePMOptions, `${i}:00`, `${i}:30`];
    }
    return workTimePMOptions;
  }
};

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 8,
    span: 16,
  },
};

const toSeconds = (time_str) => {
  // Extract hours, minutes and seconds
  var parts = time_str.split(":");
  // compute  and return total seconds
  return (
    parts[0] * 3600 + // an hour has 3600 seconds
    parts[1] * 60
  ); // a minute has 60 seconds
};

const checkRequired = (name) => (_, value) => {
  if (!value) {
    return Promise.reject(new Error(name));
  } else {
    return Promise.resolve();
  }
};

const EditModal = ({ day, isSaturday = false, updateCalendar }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [disabledSelectAM, setDisabledSelectAM] = useState(false);
  const [disabledSelectPM, setDisabledSelectPM] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfirmBack, setShowConfirmBack] = useState(false);

  const [form] = Form.useForm();

  const onFinish = (values) => {
    setShowConfirm(true);
  };

  const onUpdate = () => {
    let values = form.getFieldsValue();
    axiosInstance
      .post("/api/workCalendar/edit?workCalendarId=" + day.workCalendarId, {
        status: values.status,
        beginWorkTimeAM: values.workTimeAM.start,
        endWorkTimeAM: values.workTimeAM.end,
        beginWorkTimePM: values.workTimePM.start,
        endWorkTimePM: values.workTimePM.end,
      })
      .then((response) => {
        let code = response.data.code;
        if (code === "55") {
          let dateStr = response.data.data.dateStr;
          let date = dateStr.split("-");
          date = `${date[2]}/${date[1]}/${date[0]}`;
          openErrorNotification(
            `Ng??y ${date} l?? ng??y ngh???. Vui l??ng xo?? ng??y ${date} trong danh s??ch ng??y ngh???`
          );
        } else {
          updateCalendar();
          openNotification("C???p nh???t l???ch l??m vi???c th??nh c??ng");
          setIsModalVisible(false);
        }
      })
      .catch((error) => {
        openErrorNotification("H??? th???ng ??ang b???n. Xin th??? l???i sau");
      });
  };

  const setInitialValues = () => {
    form.setFieldsValue({
      status: day.status,
      workTimeAM: {
        start: day.beginWorkTimeAM,
        end: day.endWorkTimeAM,
      },
      workTimePM: {
        start: day.beginWorkTimePM,
        end: day.endWorkTimePM,
      },
    });
    if (day.status === 2) {
      setDisabledSelectAM(false);
      setDisabledSelectPM(true);
    } else if (day.status === 3) {
      setDisabledSelectAM(true);
      setDisabledSelectPM(true);
    } else {
      setDisabledSelectAM(false);
      setDisabledSelectPM(false);
    }
  };

  useEffect(() => {
    setInitialValues();
  }, [day]);

  const checkEditting = () => {
    let formValues = form.getFieldsValue();
    let isEditting = formValues.status === day.status;
    isEditting =
      isEditting && formValues.workTimeAM.start === day.beginWorkTimeAM;
    isEditting = isEditting && formValues.workTimeAM.end === day.endWorkTimeAM;
    isEditting =
      isEditting && formValues.workTimePM.start === day.beginWorkTimePM;
    isEditting = isEditting && formValues.workTimePM.end === day.endWorkTimePM;

    if (!isEditting) {
      setShowConfirmBack(true);
    } else {
      setIsModalVisible(false);
    }
  };

  const checkTimeAM = (_, value) => {
    let errors = [];
    if (value.start) {
      if (value.start < "07:00") {
        errors.push(
          new Error("Gi??? l??m vi???c b???t ?????u bu???i s??ng kh??ng nh??? h??n 7h")
        );
      }
    }
    if (value.start && value.end) {
      if (value.start >= value.end) {
        errors.push(new Error("Gi??? k???t th??c ph???i l???n h??n gi??? b???t ?????u"));
      } else {
        let workTime = toSeconds(value.end) - toSeconds(value.start);
        if (workTime < 10800 || workTime > 18000) {
          errors.push(new Error("Th???i gian l??m vi???c t???i thi???u 3h, t???i ??a 5h"));
        }
      }
    }
    return errors.length > 0 ? Promise.reject(errors) : Promise.resolve();
  };

  const checkTimePM = (_, value) => {
    if (value.start && value.end) {
      if (value.start >= value.end) {
        return Promise.reject(
          new Error("Gi??? k???t th??c ph???i l???n h??n gi??? b???t ?????u")
        );
      }
      let workTime = toSeconds(value.end) - toSeconds(value.start);
      if (workTime < 10800 || workTime > 18000) {
        return Promise.reject(
          new Error("Th???i gian l??m vi???c t???i thi???u 3h, t???i ??a 5h")
        );
      }
    }
    return Promise.resolve();
  };

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
            Th??ng b??o
          </div>
        }
        visible={showConfirmBack}
        onOk={() => {
          setInitialValues();
          setIsModalVisible(false);
          setShowConfirmBack(false);
        }}
        onCancel={() => {
          setShowConfirmBack(false);
        }}
        okText="C??"
        cancelText="Kh??ng"
      >
        B???n c?? ch???c ch???n mu???n hu??? thao t??c c???p nh???t l???ch l??m vi???c n??y kh??ng?
      </Modal>
      <Modal
        centered
        title={
          <div
            style={{
              width: "100%",
              cursor: "move",
            }}
          >
            Th??ng b??o
          </div>
        }
        visible={showConfirm}
        onOk={() => {
          setShowConfirm(false);
          onUpdate();
        }}
        onCancel={() => {
          setShowConfirm(false);
        }}
        okText="?????ng ??"
        cancelText="Hu???"
      >
        B???n c?? ch???c ch???n mu???n c???p nh???t l???ch l??m vi???c n??y kh??ng?
      </Modal>
      <div className="text-center">
        <a
          href=""
          onClick={(e) => {
            e.preventDefault();
            setIsModalVisible(true);
          }}
          style={{
            color: "rgb(24, 144, 255)",
          }}
          className="mr-2"
        >
          S???a
        </a>
      </div>
      <Modal
        className="my-special-modal"
        title={day.dayName}
        visible={isModalVisible}
        onCancel={() => checkEditting()}
        footer={null}
        width={isSaturday ? 600 : 600}
        forceRender
      >
        <Form
          form={form}
          {...layout}
          name="basic"
          initialValues={{
            status: 1,
            workTimeAM: {
              start: undefined,
              end: undefined,
            },
            workTimePM: {
              start: undefined,
              end: undefined,
            },
          }}
          onFinish={onFinish}
        >
          <Form.Item
            name="status"
            label={
              <p style={{ marginBottom: "0px" }}>
                Tr???ng th??i{" "}
                <span
                  style={{
                    color: "#ff4d4f",
                    fontSize: "14px",
                    fontFamily: "SimSun, sans-serif",
                    lineHeight: "1",
                  }}
                >
                  *
                </span>
              </p>
            }
            rules={[
              {
                validator: checkRequired("Tr???ng th??i kh??ng ???????c ph??p ????? tr???ng"),
              },
            ]}
          >
            <Radio.Group
              onChange={(e) => {
                let value = e.target.value;
                if (value === 2) {
                  form.setFieldsValue({
                    workTimeAM: {
                      start: "08:00",
                      end: "12:00",
                    },
                    workTimePM: {
                      start: undefined,
                      end: undefined,
                    },
                  });
                  setDisabledSelectAM(false);
                  setDisabledSelectPM(true);
                } else if (value === 3) {
                  form.setFieldsValue({
                    workTimeAM: {
                      start: undefined,
                      end: undefined,
                    },
                    workTimePM: {
                      start: undefined,
                      end: undefined,
                    },
                  });
                  setDisabledSelectAM(true);
                  setDisabledSelectPM(true);
                } else {
                  form.setFieldsValue({
                    workTimeAM: {
                      start: "08:00",
                      end: "12:00",
                    },
                    workTimePM: {
                      start: "13:30",
                      end: "17:30",
                    },
                  });
                  setDisabledSelectAM(false);
                  setDisabledSelectPM(false);
                }
              }}
            >
              <Radio value={1}>L??m vi???c</Radio>
              {isSaturday && <Radio value={2}>L??m bu???i s??ng</Radio>}
              <Radio value={3}>Ngh???</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name="workTimeAM"
            label="Gi??? l??m vi???c bu???i s??ng"
            rules={[
              {
                validator: checkTimeAM,
              },
            ]}
          >
            <CustomSelect
              options={useTimeOption("am")}
              disabledSelect={disabledSelectAM}
            />
          </Form.Item>
          <Form.Item
            name="workTimePM"
            label="Gi??? l??m vi???c bu???i chi???u"
            rules={[
              {
                validator: checkTimePM,
              },
            ]}
          >
            <CustomSelect
              options={useTimeOption("pm")}
              disabledSelect={disabledSelectPM}
            />
          </Form.Item>
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              C???p nh???t
            </Button>{" "}
            <Button onClick={() => checkEditting()}>Hu???</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditModal;
