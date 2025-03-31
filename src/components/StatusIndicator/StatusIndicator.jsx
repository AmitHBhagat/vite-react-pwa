import CheckOutlineIcon from "@rsuite/icons/CheckOutline";
import CloseOutlineIcon from "@rsuite/icons/CloseOutline";
import { THEME } from "../../utilities/theme";

const StatusIndicator = ({ status }) => {
  return (
    <div className="val">
      {status ? (
        <span className="affirm">
          <CheckOutlineIcon color={THEME[0].CLR_AFFIRM} />
        </span>
      ) : (
        <span className="negate">
          <CloseOutlineIcon color={THEME[0].CLR_NEGATE} />
        </span>
      )}
    </div>
  );
};

export default StatusIndicator;
