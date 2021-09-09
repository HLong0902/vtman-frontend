import * as actionTypes from "../actions/actionTypes";
import { updateObject } from "../utility";

const initialState = {
  check: false,
  topicNotification: {
    show: false,
    status: "success",
    content: "",
  },
  questionDefinitionNotification: {
    show: false,
    status: "success",
    content: "",
  },
  roleNotification: {
    show: false,
    status: "success",
    content: "",
  },
  userAuthorizationNotification: {
    show: false,
    status: "success",
    content: "",
  },
};

const setTopicNotification = (state, payload) => {
  return updateObject(state, {
    topicNotification: {
      show: payload.show,
      status: payload.status,
      content: payload.content,
    },
  });
};

const setQuestionDenifitionNotification = (state, payload) => {
  return updateObject(state, {
    questionDefinitionNotification: {
      show: payload.show,
      status: payload.status,
      content: payload.content,
    },
  });
};

const setRoleNotification = (state, payload) => {
  return updateObject(state, {
    roleNotification: {
      show: payload.show,
      status: payload.status,
      content: payload.content,
    },
  });
};

const setUserAuthorizationNotification = (state, payload) => {
  return updateObject(state, {
    userAuthorizationNotification: {
      show: payload.show,
      status: payload.status,
      content: payload.content,
    },
  });
};

const checkNofitication = (state) => {
  return updateObject(state, {
    check: !state.check,
  });
};

const reducer = (state = initialState, { type, ...payload }) => {
  switch (type) {
    case actionTypes.SET_TOPIC_NOTIFICATION:
      return setTopicNotification(state, payload);
    case actionTypes.SET_QUESTION_DEFINITION_NOTIFICATION:
      return setQuestionDenifitionNotification(state, payload);
    case actionTypes.SET_ROLE_NOTIFICATION:
      return setRoleNotification(state, payload);
    case actionTypes.SET_USER_AUTHORIZATION_NOTIFICATION:
      return setUserAuthorizationNotification(state, payload);
    case actionTypes.CHECK_NOTIFICATION:
      return checkNofitication(state);
    default:
      return state;
  }
};

export default reducer;
