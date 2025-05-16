import React from "react";

type ButtonAction = {
  label: string;
  onClick: () => void;
};

const CardDetailPagingButton: React.FC<ButtonAction> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
    >
      {label}
    </button>
  );
};

export default CardDetailPagingButton;
