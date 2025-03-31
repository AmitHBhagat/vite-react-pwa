import FadeLoader from "react-spinners/FadeLoader";
import { THEME } from "../../utilities/theme";
import "./Loaders.css";

export default function PageLoader({ children, isLoading = false }) {
  return isLoading ? (
    <div className="loader-overlay">
      {children ? children : <FadeLoaderComp isLoading={isLoading} />}
    </div>
  ) : (
    <></>
  );
}

function FadeLoaderComp({ Loader, isLoading = false }) {
  const overrideStyle = {
    borderColor: THEME.CLR_PRIMARY,
  };

  return (
    <FadeLoader
      color={THEME.CLR_PRIMARY}
      loading={isLoading}
      cssOverride={overrideStyle}
      height={15}
      width={5}
      radius={2}
      margin={2}
      aria-label="Loading Spinner"
    />
  );
}
