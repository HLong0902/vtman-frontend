import React, { useEffect } from "react";
import { TheContent, TheSidebar, TheFooter, TheHeader } from "./index";
import { useLocation } from "react-router-dom";
import {
  generateAuthUrl,
  getJWT,
  generateLogoutUrl,
} from "../reusable/constant";
import idleTimeout from "idle-timeout";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "../store/actions/index";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const TheLayout = () => {
  const routes = useSelector((state) => state.routes);

  useEffect(() => {
    const instance = idleTimeout(
      () => {
        localStorage.removeItem("jwt");
        window.location.replace(
          generateLogoutUrl(window.location.href.split("?")[0])
        );
        return null;
      },
      {
        element: document,
        timeout: 300000, // 5 phút
        loop: false,
      }
    );
    return () => {
      instance.destroy();
    };
  }, []);

  const dispatch = useDispatch();
  const query = useQuery();
  let code = query.get("code");
  let state = query.get("state");
  if (!localStorage.getItem("jwt") && !code && !state) {
    window.location.replace(
      generateAuthUrl(window.location.href.split("?")[0])
    );
    return null;
  } else if (!localStorage.getItem("jwt") && code && state) {
    getJWT(code, state, window.location.href.split("?")[0]).then((response) => {
      let data = response.data;
      localStorage.setItem(
        "jwt",
        JSON.stringify({
          data: {
            expire: Date.now() + data.expires_in * 1000,
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            scope: data.scope,
            token_type: data.token_type,
          },
        })
      );
      dispatch(actions.setInit());
      dispatch(actions.getNav());
      dispatch(actions.getRoutes());
      dispatch(actions.getUser());
    });
  } else {
    let jwt = JSON.parse(localStorage.getItem("jwt"));
    if (jwt) {
      let data = jwt.data;
      if (data.expire < Date.now()) {
        localStorage.removeItem("jwt");
        window.location.replace(
          generateLogoutUrl(window.location.href.split("?")[0])
        );
        return null;
      } else {
        if (!routes.init) {
          dispatch(actions.setInit());
          dispatch(actions.getNav());
          dispatch(actions.getRoutes());
          dispatch(actions.getUser());
        } else if (routes.isChangedRoute) {
          dispatch(actions.changedRoute(false));
          dispatch(actions.getRoutes());
        }
      }
    } else {
      return null;
    }
  }

  return (
    <>
      <div className="c-app c-default-layout">
        <TheSidebar />
        <div className="c-wrapper">
          <TheHeader />
          <div className="c-body">
            <TheContent />
          </div>
          <TheFooter />
        </div>
      </div>
    </>
  );
};

export default TheLayout;
