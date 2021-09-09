import * as actionTypes from "./actionTypes";

export const changeSidebarShow = (payload) => {
  return {
    type: actionTypes.CHANGE_SIDE_BAR_SHOW,
    ...payload,
  };
};
