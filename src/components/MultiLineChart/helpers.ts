import React from "react";

import { Line } from "./Line";

const isAllowedChild = (child: React.ReactElement): boolean => {
  // Check if child is a fragment. If so, recursively check all children
  if (child.type === React.Fragment) {
    return React.Children.toArray(child.props.children).every(
      (c) => React.isValidElement(c) && isAllowedChild(c)
    );
  }
  return [Line].some((allowedChild) => child.type === allowedChild);
};

/**
 * Throws an error if the children of the line chart component are not valid.
 * @param children The children of the line chart component.
 */
export const validateLineChartChildren = (children?: React.ReactNode | undefined) => {
  // Only perform this validation if the environment is development
  if (process.env.NODE_ENV !== "development") return;

  const validChildren = React.Children.toArray(children).every((child) => {
    return (
      typeof child !== "string" &&
      (child === React.Fragment || (React.isValidElement(child) && isAllowedChild(child)))
    );
  });
  if (!validChildren) {
    throw new Error("MultiLineChart only accepts Line components as children.");
  }
};
