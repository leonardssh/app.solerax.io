/** @jsxImportSource @emotion/react */
import React from "react";
import { PageWrap } from "../../components/PageWrap";

export const BeneficiaryNotFound = ({ address }) => {
  return (
    <PageWrap>
      <h2>
        There's no purchase found for the address <br /> <span css={{ lineBreak: "anywhere" }}>{address}</span>
      </h2>
      <h3>
        If you've purchased SOLX tokens before 1 Feb 2022 contact us at{" "}
        <a href={`mailto:contact@solerax.io`}>contact@solerax.io</a>
      </h3>
    </PageWrap>
  );
};
