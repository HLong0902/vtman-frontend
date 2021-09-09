import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CCreateElement,
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarNavDivider,
  CSidebarNavTitle,
  CSidebarNavDropdown,
  CSidebarNavItem,
} from "@coreui/react";

import Logo from "../assets/imgs/CMS Logo.svg";
import * as actions from "../store/actions/index";

const TheSidebar = () => {
  const dispatch = useDispatch();
  const show = useSelector((state) => state.sidebar.sidebarShow);
  const navigation = useSelector((state) => state.nav._nav);

  return (
    <CSidebar
      show={show}
      onShowChange={(val) =>
        dispatch(actions.changeSidebarShow({ sidebarShow: val }))
      }
    >
      <CSidebarBrand className="d-md-down-none" to="/">
        <img src={Logo} alt="VT Post"></img>
      </CSidebarBrand>
      <CSidebarNav>
        <CCreateElement
          items={navigation}
          components={{
            CSidebarNavDivider,
            CSidebarNavDropdown,
            CSidebarNavItem,
            CSidebarNavTitle,
          }}
        />
      </CSidebarNav>
    </CSidebar>
  );
};

export default React.memo(TheSidebar);
