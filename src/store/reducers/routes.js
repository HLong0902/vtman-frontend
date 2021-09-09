import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  init: false,
  isChangedRoute: false,
  routes: [],
};

const updateRoutes = (state, routes) => {
  return updateObject(state, {
    routes: routes,
    isChangedRoute: false,
  });
};

const changedRoute = (state, isChangedRoute) => {
  return updateObject(state, {
    isChangedRoute: isChangedRoute,
  });
};

const setInit = (state) => {
  return updateObject(state, {
    init: true,
  });
};

const reducer = (state = initialState, { type, routes, isChangedRoute }) => {
  switch (type) {
    case actionTypes.UPDATE_ROUTES:
      return updateRoutes(state, routes);
    case actionTypes.SET_CHANGED_ROUTE:
      return changedRoute(state, isChangedRoute);
    case actionTypes.SET_INIT:
      return setInit(state);
    default:
      return state;
  }
};

export default reducer;
