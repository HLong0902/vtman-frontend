import React, { Suspense, useEffect, useState } from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import { CContainer, CFade } from "@coreui/react";
import { Spin } from "antd";
import { useSelector, useDispatch } from "react-redux";
import * as actions from "../store/actions/index";

const loading = (
  <>
    <div
      style={{
        margin: "20px 0",
        marginBottom: "20px",
        padding: "30px 50px",
        textAlign: "center",
        borderRadius: "4px",
      }}
    >
      <Spin />
    </div>
  </>
);

function Component({ route, ...props }) {
  const [spinning, setSpinning] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    return () => {
      dispatch(actions.checkNofitication());
    };
  }, []);
  return (
    <CFade>
      <Spin spinning={spinning}>
        <div style={{marginBottom: "30px"}}>
          <route.component
            {...props}
            onDispatch={() => {
              dispatch(actions.checkNofitication());
            }}
            onSpinning={setSpinning}
          />
        </div>
      </Spin>
    </CFade>
  );
}
const TheContent = () => {
  const routes = useSelector((state) => state.routes.routes);
  return (
    <main className="c-main">
      <CContainer fluid>
        <Suspense fallback={loading}>
          {routes.length > 0 && (
            <Switch>
              {routes.map((route, idx) => {
                return (
                  route.component && (
                    <Route
                      key={idx}
                      path={route.path}
                      exact={route.exact}
                      name={route.name}
                      render={(props) => <Component {...props} route={route} />}
                    />
                  )
                );
              })}
              <Redirect from="/" to="/" />
            </Switch>
          )}
        </Suspense>
      </CContainer>
    </main>
  );
};

export default React.memo(TheContent);
