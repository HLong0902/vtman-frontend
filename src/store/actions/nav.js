import * as actionTypes from "./actionTypes";
import axiosInstance from "../../axios";

export const updateNav = (payload) => {
  return {
    type: actionTypes.UPDATE_NAV,
    payload: payload,
  };
};

export const getNav = () => {
  return (dispatch) => {
    axiosInstance.get("/api/menu/loadSideMenu").then((response) => {
      let nav = response.data;
      dispatch(updateNav(nav));
    });
  };
};
