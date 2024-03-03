import React from "react";

import { CoreBox } from "@wrappid/core";

export default function CoreLayoutItem(props) {
  const { id, children, ...restProps } = props;
  
  React.useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(restProps);
  }, []);
    
  return (
    <CoreBox key={`item-${id}`} {...restProps}>
      {children}
    </CoreBox>
  );
}
