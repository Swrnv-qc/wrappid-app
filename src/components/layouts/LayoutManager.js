/* eslint-disable import/order */
/* eslint-disable no-console */
import React from "react";

// eslint-disable-next-line import/no-unresolved
import { UPDATE_DEVELOPMENT_DATA, WrappidDataContext, WrappidDispatchContext } from "@wrappid/styles";

import {
  BlankLayout,
  ComponentNotFound,
  ComponentRegistryContext,
  CoreBox,
  CoreClasses,
  CoreTypographyBody1
} from "@wrappid/core";

import CoreLayoutItem from "./CoreLayoutItem";
import CoreLayoutPlaceholder from "./CoreLayoutPlaceholder";

export const COMPONENT_TYPES = {
  CORE_LAYOUT_ITEM       : CoreLayoutItem.name,
  CORE_LAYOUT_PLACEHOLDER: CoreLayoutPlaceholder.name,
  REACT_FORWARD_REF      : React.forwardRef.$$typeof,
  REACT_FRAGMENT         : React.Fragment.$$typeof
};

export default function LayoutManager(props) {
  let layoutItems = {};
  const { pageName, layoutName } = props;
  const { development } = React.useContext(WrappidDataContext);
  const componentRegistry = React.useContext(ComponentRegistryContext);
  const dispatch = React.useContext(WrappidDispatchContext);

  // eslint-disable-next-line no-unused-vars
  const [devData, setDevData] = React.useState(development);

  React.useEffect(() => {
    dispatch({ payload: devData, type: UPDATE_DEVELOPMENT_DATA });
  }, [devData]);

  /**
   * @todo
   * find out all the placeholder's rplacable items of the page component
   * 
   * @param {*} pageChildren 
   * @param {*} layoutItems 
   * @returns layoutItems
   */
  const prepareLayoutItems = (PageComponent) => {
    /* get page childrens */
    let pageChildren = PageComponent?.props?.children;

    // always make it an array
    if (pageChildren && !Array.isArray(pageChildren)) {
      pageChildren = [pageChildren];
    }

    if (pageChildren && pageChildren.length > 0) {
      // filter layout items from all child elements
      let tempLayoutItems = pageChildren?.filter(elem => elem?.type?.name === CoreLayoutItem.name);

      // tempLayoutItems exists and length is > 0
      if (tempLayoutItems && tempLayoutItems?.length > 0) {
        tempLayoutItems?.forEach(eachLayoutItem => {
          // check if have any layout items inside remove it
          // add it to the layoutItems
          let { children = [], ...restLayoutItemProps } = eachLayoutItem?.props || {};
          let eachLayoutItemID = restLayoutItemProps?.id;
          let compChildren = children;

          if (compChildren && !Array.isArray(compChildren)) {
            compChildren = [compChildren];
          }

          let compChildrenLI = compChildren?.filter(eachItem => eachItem?.type?.name !== CoreLayoutItem.name);

          console.log("---------------------------------------------------");
          console.log("compChildren");
          console.log(compChildren);
          console.log("compChildrenLI");
          console.log(compChildrenLI);
          console.log("---------------------------------------------------");

          layoutItems[eachLayoutItemID] = {
            children: compChildrenLI,
            props   : restLayoutItemProps
          };

          // if layout item exist inside the another layout item
          if (compChildren?.filter(elem => elem?.type?.name === CoreLayoutItem.name).length > 0) {
            prepareLayoutItems(eachLayoutItem);
          }
        });
      }
    } else {
      layoutItems[BlankLayout.PLACEHOLDER.CONTENT] = {
        chidren: [
          React.createElement(CoreBox, {},
            <CoreTypographyBody1>Layout children are empty</CoreTypographyBody1>
          )
        ],
        props: { styleClasses: [CoreClasses.BG.BG_WARNING] }
      };
    }

    return layoutItems;
  };

  /**
   * This function return the type of the component.
   * 
   * 
   * @param {*} component 
   * @returns {COMPONENT_TYPES} componentType
   */
  const getComponentType = (component) => {
    let componentType = null;

    componentType = component?.type?.name
      || component?.type?.displayName
      || component?.type?.toString()
      || typeof component;

    return componentType;
  };

  /**
   * 
   * @param {*} component 
   * @returns {boolean} hasPlaceholder
   */
  const componentHasPlaceholder = (component) => {
    let hasPlaceholder = false;
    let { children } = component?.props || {};

    if (typeof children === "object"
      && !Array.isArray(children)
      && getComponentType(children) === CoreLayoutPlaceholder.name) {
      hasPlaceholder = true;
    } else if (typeof children === "object"
      && Array.isArray(children)) {
      hasPlaceholder = children?.some((child) => {
        if (getComponentType(child) === CoreLayoutPlaceholder.name) {
          return true;
        } else {
          if (child?.props?.chidren) {
            return componentHasPlaceholder(child);
          }
        }
      });
    }

    return hasPlaceholder;
  };

  /**
   * 
   * @param {*} component 
   * @returns {boolean} isLayout
   */
  const checkIfComponentIsLayout = (component) => {
    let isLayout = false;

    let componentType = getComponentType(component);

    if (component) {
      /* if it is a registered layout */
      if (Object.keys(componentRegistry).includes(componentType)
        && componentRegistry[componentType]?.layout === true) {
        isLayout = true;
      }
      /* if it has placeholder */
      else if (componentHasPlaceholder(component)) {
        isLayout = true;
      }
    }

    return isLayout;
  };

  /**
   * 
   * @param {*} component 
   * @returns {boolean} isPlaceholder
   */
  const checkIfPlaceholder = (component) => {
    return component && getComponentType(component) === COMPONENT_TYPES.CORE_LAYOUT_PLACEHOLDER;
  };

  /**
   * 
   * @param {*} component 
   * @param {*} componentProps 
   * @param {*} placeholderChildren 
   * @returns [component, componentProps, placeholderChildren]
   */
  const replacePlaceholderWithItem = (component, componentProps, placeholderChildren) => {
    if (checkIfPlaceholder(component)) {
      let { id: placeholderID, styleClasses: placeholderStyleClasses = [], ...placeholderProps } = component?.props || {};
      let layoutItem = layoutItems[placeholderID];

      if (layoutItem) {
        let { children: itemChildren = [], props: itemAllProps = {} } = layoutItem;
        let { id: itemID, styleClasses: itemStyleClasses = [], ...itemProps } = itemAllProps;
  
        let mergedStyleClasses = [...(placeholderStyleClasses || []), ...(itemStyleClasses || [])];

        componentProps = {
          ...placeholderProps,
          ...itemProps,
          id          : itemID,
          styleClasses: mergedStyleClasses,
        };
   
        // convert placeholder and item children as array
        if (placeholderChildren && !Array.isArray(placeholderChildren)) {
          placeholderChildren = [placeholderChildren];
        }
        if (itemChildren && !Array.isArray(itemChildren)) {
          itemChildren = [itemChildren];
        }
        
        placeholderChildren = [...(placeholderChildren || []), ...(itemChildren || [])];

        component = React.createElement(CoreBox, componentProps, placeholderChildren);
      } else {
        // layout item is missing
      }
    }

    return component;
  };

  /**
   * 
   * @param {*} component 
   * @returns 
   */
  const handleLayout = (component) => {
    /**
     * @todo
     * better approach to figure out if the component is mounted or not
     */
    if (!component?.props?.children) {
      // mount component if it's not mounted
      component = component?.type();
    }

    // get component children
    let componentChildren = component?.props?.children;

    // convert component children as array
    if (componentChildren && !Array.isArray(componentChildren)) {
      componentChildren = [componentChildren];
    }

    // convert the component children for getting final rendrable elements
    let convertedChildren = componentChildren?.map((componentChild) => {
      // check if this component is a layout
      if (checkIfComponentIsLayout(componentChild)) {
        componentChild = handleLayout(componentChild);
      }
      // check if this component is a placeholder
      else if (checkIfPlaceholder(componentChild)) {
        // add layout items's children and props along with it's children and props
        componentChild = replacePlaceholderWithItem(componentChild, componentChild?.props, componentChild?.props?.children);
      }
      return componentChild;
    });

    let componentProps = component.props;

    /* if placeholder */
    // eslint-disable-next-line etc/no-commented-out-code
    if (checkIfPlaceholder(component)) {
      component = replacePlaceholderWithItem(component, componentProps, convertedChildren);
    } else {
      component = React.cloneElement(component, componentProps, convertedChildren);
    }

    return component;
  };

  const renderData = () => {
    /* basic checks for layout and page */
    if (layoutName
      && Object.keys(componentRegistry).includes(layoutName)
      && componentRegistry[layoutName]?.layout === true
      && componentRegistry[layoutName]?.comp
      /* check if it is a react layout element */
    ) {
      devData.layoutFound = true;
      devData.layout = layoutName;
      devData.renderedLayout = layoutName;
    } else {
      devData.layoutFound = false;
      devData.layout = layoutName || "Not Provided";
      devData.renderedLayout = BlankLayout.name;
    }

    if (pageName
      && Object.keys(componentRegistry).includes(pageName)
      && componentRegistry[pageName]?.comp
      /* check if it is a react element */
    ) {
      devData.pageFound = true;
      devData.page = pageName;
      devData.renderedPage = pageName;
    } else {
      devData.pageFound = false;
      devData.page = pageName || "Not Provided";
      devData.renderedpage = ComponentNotFound.name;
    }

    if (!devData.layoutFound) {
      return React.createElement(BlankLayout(), {}, ComponentNotFound({ componentName: devData.layout, layout: true }));
    }

    if (!devData.pageFound) {
      return React.createElement(BlankLayout(), {}, ComponentNotFound({ componentName: devData.page, layout: false }));
    }

    /* mount root layout and page */
    let LayoutComponent = componentRegistry[devData?.renderedLayout]?.comp();
    let PageComponent = componentRegistry[devData?.renderedPage]?.comp();

    layoutItems = prepareLayoutItems(PageComponent);

    console.log("---------------------------------------------------");
    console.log("------------------ Layout Items -------------------");
    console.log("---------------------------------------------------");
    console.log(layoutItems);
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");

    let renderableElements = handleLayout(LayoutComponent);

    console.log("---------------------------------------------------");
    console.log("---------------- Renderable Elements ----------------");
    console.log("---------------------------------------------------");
    console.log(renderableElements);
    console.log("---------------------------------------------------");
    console.log("---------------------------------------------------");

    return renderableElements;
  };

  return (
    <>
      {/* LAYOUT CONTENT REPLACED BY PAGE ITEM */}
      {renderData()}
    </>
  );
}
