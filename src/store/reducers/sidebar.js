import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  sidebarShow: "responsive",
};

const changeSidebarShow = (state, payload) => {
  return updateObject(state, {
    sidebarShow: payload.sidebarShow,
  });
};

const reducer = (state = initialState, { type, ...payload }) => {
  switch (type) {
    case actionTypes.CHANGE_SIDE_BAR_SHOW:
      return changeSidebarShow(state, payload);
    default:
      return state;
  }
};

export default reducer;
