import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { signalRouteCommit } from "@/utils/viewTransition";

const RouteTransitionCommit: React.FC = () => {
  const { key } = useLocation();
  useLayoutEffect(() => {
    signalRouteCommit();
  }, [key]);
  return null;
};

export default RouteTransitionCommit;
