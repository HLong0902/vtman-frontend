import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  _nav: [],
};

const updateNav = (state, payload) => {
  if(payload){
    return updateObject(state, {
      _nav: [...payload],
    });
  }else{
    return state;
  }
};

const reducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case actionTypes.UPDATE_NAV:
      return updateNav(state, payload);
    default:
      return state;
  }
};

export default reducer;
