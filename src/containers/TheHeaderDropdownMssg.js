import React, { useState, useEffect } from "react";
import { CBadge } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { Button } from "antd";
import { Dropdown, Spinner } from "react-bootstrap";
import "./TheHeaderDropdownMssg.less";
import axiosInstance from "../axios";
import QuestionCircle from "../assets/icons/QuestionCircle.svg";
import CloseCircle from "../assets/icons/CloseCircle.svg";
import { openErrorNotification } from "../views/base/notification/notification";
import { useHistory, withRouter } from "react-router-dom";
import { useSelector } from "react-redux";

const TheHeaderDropdownMssg = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [init, setInit] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const history = useHistory();
  const check = useSelector((state) => state.notification.check);

  useEffect(() => {
    if (!init) {
      let interval = setInterval(() => {
        let jwt = JSON.parse(localStorage.getItem("jwt"));
        if (jwt) {
          clearInterval(interval);
          setInit(true);
          loadNotifications();
        }
      }, 200);
    } else {
      loadNotifications();
    }
  }, [check]);

  const loadNotifications = () => {
    axiosInstance
      .get("/api/historyFaqs/notification/questionAnswerCms")
      .then((response) => {
        let data = response.data.data;
        setUnreadCount(response.data.unreadCount);
        setNotifications([...data]);
        setLoading(false);
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
        setLoading(false);
      });
  };

  const handleRead = (id, path) => {
    axiosInstance
      .get("/api/historyFaqs/notification/cmsReaded", {
        params: {
          notificationId: id,
        },
      })
      .then((response) => {
        loadNotifications();
        history.push(path);
        setShowMenu(false);
      })
      .catch((error) => {
        openErrorNotification("Hệ thống đang bận. Xin thử lại sau");
      });
  };

  return (
    <Dropdown
      className="list_notification"
      show={showMenu}
      onToggle={() => {
        setShowMenu(!showMenu);
      }}
    >
      <Dropdown.Toggle
        id="dropdown-basic"
        onClick={() => {
          setShowMenu(!showMenu);
        }}
      >
        <CIcon name="cil-bell" id="dropdown-basic" style={{ color: "red" }} />
        <CBadge shape="pill" color="danger">
          {unreadCount > 0 ? unreadCount : ""}
        </CBadge>
      </Dropdown.Toggle>

      <Dropdown.Menu id="dropdown-menu">
        {notifications.length > 0 ? (
          notifications.map((item, index) => (
            <Dropdown.Item
              key={index}
              href=""
              style={{
                paddingBottom: "0px",
              }}
            >
              <div
                className="notification_item"
                style={{
                  borderBottom:
                    index !== notifications.length - 1
                      ? "1px solid #ebedef"
                      : "none",
                }}
              >
                <div
                  className="notification_body"
                  onClick={() => {
                    handleRead(item.notificationId, item.path);
                  }}
                >
                  <div className="user_img">
                    <img
                      src={item.typeCms === 1 ? QuestionCircle : CloseCircle}
                      alt=""
                    ></img>
                  </div>
                  <div className="content">
                    <p className="content_title">
                      {item.isView !== 0 ? <b>{item.title}</b> : item.title}
                    </p>
                    <p className="content_body">
                      {item.isView !== 0 ? <b>{item.body}</b> : item.body}
                    </p>
                  </div>
                </div>
                <div className="read_detail mt-1">
                  <Button
                    type="primary"
                    danger
                    size="small"
                    onClick={() => {
                      handleRead(item.notificationId, item.path);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              </div>
            </Dropdown.Item>
          ))
        ) : (
          <Dropdown.Item href="" style={{ marginBottom: "0px" }}>
            <div className="notification_item">
              <div className="notification_body">Bạn không có thông báo</div>
            </div>
          </Dropdown.Item>
        )}
        {loading && (
          <>
            <Dropdown.Item
              href=""
              style={{ marginBottom: "0px", justifyContent: "center" }}
            >
              <Spinner animation="grow" size="sm" style={{ color: "red" }} />
              <Spinner animation="grow" size="sm" style={{ color: "red" }} />
              <Spinner animation="grow" size="sm" style={{ color: "red" }} />
            </Dropdown.Item>
          </>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default withRouter(TheHeaderDropdownMssg);
