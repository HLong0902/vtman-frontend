import React from "react";
import * as actionTypes from "./actionTypes";
import axiosInstance from "../../axios";
import * as actions from "./index";

const QuestionDefinition = React.lazy(() => import("../../views/catalog/questionDefinition/list"));
const AddQuestionDefinition = React.lazy(() => import("../../views/catalog/questionDefinition/add"));
const EditQuestionDefinition = React.lazy(() => import("../../views/catalog/questionDefinition/edit"));
const ImportQuestionDefinition = React.lazy(() => import("../../views/catalog/questionDefinition/import"));

const Topic = React.lazy(() => import("../../views/catalog/topic/list"));
const AddTopic = React.lazy(() => import("../../views/catalog/topic/add"));
const EditTopic = React.lazy(() => import("../../views/catalog/topic/edit"));

const ContentAutomatic = React.lazy(() => import("../../views/catalog/contentAutomatic/list"));
const EditContentAutomatic = React.lazy(() => import("../../views/catalog/contentAutomatic/edit"));
const AddContentAutomatic = React.lazy(() => import("../../views/catalog/contentAutomatic/add"));

const HistoryFaq = React.lazy(() => import("../../views/catalog/historyFaq/list"));
const HistoryFaqDetail = React.lazy(() => import("../../views/catalog/historyFaq/detail"));

const FunctionConfig = React.lazy(() => import("../../views/catalog/functionConfig"));

const Menu = React.lazy(() => import("../../views/catalog/menu/list"));
const AddMenu = React.lazy(() => import("../../views/catalog/menu/add"));
const EditMenu = React.lazy(() => import("../../views/catalog/menu/edit"));

const BannedContent = React.lazy(() => import("../../views/catalog/bannedContent/list"));
const AddBannedContent = React.lazy(() => import("../../views/catalog/bannedContent/add"));
const EditBannedContent = React.lazy(() => import("../../views/catalog/bannedContent/edit"));

const Page = React.lazy(() => import("../../views/catalog/page/list"));
const AddPage = React.lazy(() => import("../../views/catalog/page/add"));
const EditPage = React.lazy(() => import("../../views/catalog/page/edit"));

const WorkCalendar = React.lazy(() => import("../../views/catalog/workCalendar"));
const Permission = React.lazy(() => import("../../views/catalog/permission"));

const Report = React.lazy(() => import("../../views/catalog/report/list"));

const UserAuthorization = React.lazy(() => import("../../views/catalog/userAuthorization/list"));
const EditUserAuthorization = React.lazy(() => import("../../views/catalog/userAuthorization/edit"));

const Role = React.lazy(() => import("../../views/catalog/role/list"));
const AddRole = React.lazy(() => import("../../views/catalog/role/add"));
const EditRole = React.lazy(() => import("../../views/catalog/role/edit"));

const Department = React.lazy(() => import("../../views/catalog/department/list"));
const AddDepartment = React.lazy(() => import("../../views/catalog/department/add"));
const EditDepartment = React.lazy(() => import("../../views/catalog/department/edit"));

const getComponent = (name) => {
  switch (name) {
    case "Topic": return Topic;
    case "AddTopic": return AddTopic;
    case "EditTopic": return EditTopic;

    case "QuestionDefinition": return QuestionDefinition;
    case "AddQuestionDefinition": return AddQuestionDefinition;
    case "EditQuestionDefinition": return EditQuestionDefinition;
    case "ImportQuestionDefinition": return ImportQuestionDefinition;

    case "HistoryFaq": return HistoryFaq;
    case "HistoryFaqDetail": return HistoryFaqDetail;

    case "FunctionConfig": return FunctionConfig;

    case "Menu": return Menu;
    case "AddMenu": return AddMenu;
    case "EditMenu": return EditMenu;

    case "BannedContent": return BannedContent;
    case "AddBannedContent": return AddBannedContent;
    case "EditBannedContent": return EditBannedContent;

    case "ContentAutomatic": return ContentAutomatic;
    case "AddContentAutomatic": return AddContentAutomatic;
    case "EditContentAutomatic": return EditContentAutomatic;

    case "Page": return Page;
    case "AddPage": return AddPage;
    case "EditPage": return EditPage;

    case "WorkCalendar": return WorkCalendar;
    case "Permission": return Permission;

    case "Report": return Report;

    case "UserAuthorization": return UserAuthorization;
    case "EditUserAuthorization": return EditUserAuthorization;

    case "Role": return Role;
    case "AddRole": return AddRole;
    case "EditRole": return EditRole;

    case "Department": return Department;
    case "AddDepartment": return AddDepartment;
    case "EditDepartment": return EditDepartment;

    default: return  (props) => (<div style={{
      height: "100%",
      width: "100%",
      backgroundColor: "#fff"
    }}>{name !== null ? "Trang n??y kh??ng c?? n???i dung" : ""}</div>);
  }
};

export const updateRoutes = (payload) => {
  return {
    type: actionTypes.UPDATE_ROUTES,
    routes: payload,
  };
};

export const changedRoute = (payload) => {
  return {
    type: actionTypes.SET_CHANGED_ROUTE,
    isChangedRoute: payload,
  };
};

export const setInit = () => {
  return {
    type: actionTypes.SET_INIT,
  };
};

export const createRoute = (path, name, component) => {
  return {
    path: path,
    name: name,
    exact: true,
    component: getComponent(component),
  };
};

export const pathAdd = (path) => path + "/add";
export const pathEdit = (path) => path + "/edit/:id";

export const getRoutes = () => {
  return (dispatch) => {
    axiosInstance.get("/api/page/getRoutes").then((response) => {
      let routes = [];
      let permissions = {};
      for (let item of response.data.data) {
        let component = item.component;
        let pms = item.permissions;
        permissions[item.path] = pms;
        switch (component) {
          case "Topic": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "Topic"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddTopic"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditTopic"));
            }
            break;
          }
          case "ContentAutomatic": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "ContentAutomatic"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddContentAutomatic"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditContentAutomatic"));
            }
            break;
          }
          case "QuestionDefinition": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "QuestionDefinition"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path),"Th??m","AddQuestionDefinition"),
                createRoute(item.path + "/import","Import","ImportQuestionDefinition")
              );
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path),"S???a","EditQuestionDefinition"));
            }
            break;
          }
          case "HistoryFaq": {
            routes.push(
              createRoute(item.path, item.pageName, "HistoryFaq"),
              createRoute(item.path + "/:id", "Chi ti???t", "HistoryFaqDetail")
            );
            break;
          }
          case "FunctionConfig": {
            routes.push(
              createRoute(item.path, item.pageName, "FunctionConfig")
            );
            break;
          }
          case "Menu": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "Menu"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddMenu"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditMenu"));
            }
            break;
          }
          case "Page": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "Page"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddPage"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditPage"));
            }
            break;
          }
          case "BannedContent": {
            if (pms.indexOf(1) !== -1) {
              routes.push(
                createRoute(item.path, item.pageName, "BannedContent")
              );
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(
                createRoute(pathAdd(item.path), "Th??m", "AddBannedContent")
              );
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(
                createRoute(pathEdit(item.path), "S???a", "EditBannedContent")
              );
            }
            break;
          }
          case "WorkCalendar": {
            routes.push(createRoute(item.path, item.pageName, "WorkCalendar"));
            break;
          }
          case "Permission": {
            routes.push(createRoute(item.path, item.pageName, "Permission"));
            break;
          }

          case "Report": {
            routes.push(createRoute(item.path, item.pageName, "Report"));
            break;
          }

          case "UserAuthorization": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "UserAuthorization"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditUserAuthorization"));
            }
            break;
          }

          case "Role": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "Role"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddRole"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditRole"));
            }
            break;
          }

          case "Department": {
            if (pms.indexOf(1) !== -1) {
              routes.push(createRoute(item.path, item.pageName, "Department"));
            }
            if (pms.indexOf(2) !== -1) {
              routes.push(createRoute(pathAdd(item.path), "Th??m", "AddDepartment"));
            }
            if (pms.indexOf(3) !== -1) {
              routes.push(createRoute(pathEdit(item.path), "S???a", "EditDepartment"));
            }
            break;
          }
          default:
            routes.push(createRoute(item.path, item.pageName, undefined));
            break;
        }
      }
      routes.push(createRoute("/", "Trang ch???", null));
      dispatch(updateRoutes(routes));
      dispatch(actions.updateUser({ permissions }));
    });
  };
};
