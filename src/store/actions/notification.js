import * as actionTypes from "./actionTypes";

export const setTopicNotification = (payload) => {
  return {
    type: actionTypes.SET_TOPIC_NOTIFICATION,
    ...payload,
  };
};

export const setQuestionDenifitionNotification = (payload) => {
  return {
    type: actionTypes.SET_QUESTION_DEFINITION_NOTIFICATION,
    ...payload,
  };
};

export const setRoleNotification = (payload) => {
  return {
    type: actionTypes.SET_ROLE_NOTIFICATION,
    ...payload,
  };
};

export const setUserAuthorizationNotification = (payload) => {
  return {
    type: actionTypes.SET_USER_AUTHORIZATION_NOTIFICATION,
    ...payload,
  };
};

export const checkNofitication = () => {
  return {
    type: actionTypes.CHECK_NOTIFICATION,
  };
};

