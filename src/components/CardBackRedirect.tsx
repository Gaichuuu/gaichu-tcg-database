import { Navigate, generatePath, useParams } from "react-router-dom";
import { CardListPath } from "@/utils/RoutePathBuildUtils";

const CardBackRedirect: React.FC = () => {
  const { seriesShortName = "", setShortName = "" } = useParams();
  return (
    <Navigate
      replace
      to={generatePath(CardListPath, { seriesShortName, setShortName })}
    />
  );
};

export default CardBackRedirect;
