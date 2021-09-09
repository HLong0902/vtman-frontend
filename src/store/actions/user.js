import * as actionTypes from "./actionTypes";
import axiosInstance from "../../axios";

export const updateUser = (payload) => {
  return {
    type: actionTypes.UPDATE_USER,
    payload: payload,
  };
};

export const getUser = () => {
  return (dispatch) => {
    axiosInstance.get("/api/sso/user/info").then((response) => {
      dispatch(updateUser(response.data.data));
    });
  };
};
