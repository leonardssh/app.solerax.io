/** @jsxImportSource @emotion/react */
import React from "react";
import styled from "@emotion/styled";
import Logo from "./solerax-logo.png";

const LogoWrapper = styled.div({
  margin: "1em",
  textAlign: "left",
  paddingTop: 5,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  "@media screen and (min-width: 600px)": {
    flexDirection: "row",
  },
});

export default function Header({ children }) {
  return (
    <LogoWrapper>
      <a href="https://www.solerax.io/" target="_blank" rel="noopener noreferrer" css={{ flex: "1 1 auto" }}>
        <img src={Logo} alt="SoleraX logo" css={{ height: 22 }} />
      </a>
      {children}
    </LogoWrapper>
  );
}
