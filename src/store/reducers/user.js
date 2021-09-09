import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  employeeName: "",
  permissions: {}
};

const updateUser = (state, payload) => {
  if(payload){
    return updateObject(state, payload);
  }else{
    return state;
  }
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.UPDATE_USER:
      return updateUser(state, payload);
    default:
      return state;
  }
};

export default reducer;
