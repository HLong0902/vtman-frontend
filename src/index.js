import 'react-app-polyfill/ie11'; // For IE 11 support
import 'react-app-polyfill/stable';
import 'core-js';
import './polyfill'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ConfigProvider } from 'antd';
import viVN from 'antd/lib/locale/vi_VN';

import { icons } from './assets/icons';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import sidebar from "./store/reducers/sidebar";
import notification from "./store/reducers/notification";
import nav from "./store/reducers/nav";
import routes from "./store/reducers/routes";
import user from "./store/reducers/user";

const composeEnhancers = (process.env.NODE_ENV === 'development' ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : null) || compose;

const rootReducer = combineReducers({
  sidebar: sidebar,
  notification: notification,
  nav: nav,
  routes: routes,
  user: user
});

const store = createStore(rootReducer, composeEnhancers(
  applyMiddleware(thunk)
));

React.icons = icons

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider locale={viVN}>
      <App/>
    </ConfigProvider>
  </Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
