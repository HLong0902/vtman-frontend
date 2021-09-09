import React from 'react'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CImg
} from '@coreui/react'
import CIcon from '@coreui/icons-react';
import { generateLogoutUrl } from "../reusable/constant";
import {useSelector} from "react-redux";
import Image1 from "../assets/imgs/img-1.png";

const TheHeaderDropdown = () => {
  const user = useSelector(state => state.user);
  return (
    <CDropdown
      inNav
      className="c-header-nav-items mx-2"
      direction="down"
    >
      <CDropdownToggle className="c-header-nav-link" caret={false}>
        <div className="c-avatar">
          <CImg
            src={Image1}
            className="c-avatar-img"
            alt="admin@bootstrapmaster.com"
          />
        </div>
        <div>&nbsp;{user.employeeName}</div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownItem className="text-center" onClick={()=>{
          localStorage.removeItem("jwt");
          window.location.replace(generateLogoutUrl(window.location.href.split("?")[0]));
          return null;
        }}>
          <CIcon name="cil-lock-locked" className="mfe-2" />
          Đăng xuất
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default TheHeaderDropdown
