// eslint-disable-next-line unused-imports/no-unused-imports, no-unused-vars
import React from "react";

import {
  CoreBox, CoreClasses, CoreImage,
  CoreLayoutPlaceholder, CoreLink, CoreStack,
  CoreTypographyBody1, ThemeSelector
} from "@wrappid/core";

import data from "../../../package.json";
import logo from "../../resources/images/logo.png";

export default function WrappidAppLayout() {
  return (
    <>
      <CoreBox
        styleClasses={[CoreClasses.DISPLAY.FLEX, CoreClasses.FLEX.DIRECTION_ROW, CoreClasses.SHADOW.NORMAL]}
      >
        <CoreImage
          height={50}
          src={logo}
          alt="logo"
        />
      </CoreBox>
          
      <CoreLayoutPlaceholder id={WrappidAppLayout.PLACEHOLDER.CONTENT} />

      <CoreBox
        styleClasses={[
          CoreClasses.DISPLAY.FLEX,
          CoreClasses.FLEX.DIRECTION_ROW,
          CoreClasses.PADDING.P2,
          CoreClasses.BG.BG_PRIMARY,
          CoreClasses.ALIGNMENT.JUSTIFY_CONTENT_SPACE_BETWEEN,
        ]}
      >
        <CoreTypographyBody1>{data.name}</CoreTypographyBody1>

        <CoreTypographyBody1>
          Wrappid ©{new Date().getFullYear()}
        </CoreTypographyBody1>

        <CoreStack direction="row">
          <ThemeSelector />

          <CoreLink href={"/about"}>
            <CoreTypographyBody1>Version: {data.version}</CoreTypographyBody1>
          </CoreLink>
        </CoreStack>
      </CoreBox>
    </>
  );
}

WrappidAppLayout.PLACEHOLDER = { CONTENT: "content" };