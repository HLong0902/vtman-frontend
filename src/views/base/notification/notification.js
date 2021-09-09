import { notification } from "antd";

export const openNotification = (description, placement = "bottomRight") => {
  notification.success({
    message: `Thông báo`,
    description: description,
    placement,
  });
};

export const openErrorNotification = (errorName, placement = "bottomRight") => {
  notification.error({
    message: `Thông báo`,
    description: errorName,
    placement: "bottomRight",
  });
};
