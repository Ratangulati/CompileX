export const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#fff",
    borderColor: state.isFocused ? "#aaa" : "#ddd",
    borderRadius: "6px",
    minHeight: "36px",
    width: "130px",
    boxShadow: state.isFocused ? "0 0 0 1px #aaa" : "none",
    "&:hover": {
      borderColor: "#aaa",
    },
    fontWeight: "normal",
    fontSize: "14px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    marginTop: "4px",
    width: "130px",
    maxHeight: "none",
    zIndex: 9999, // Ensure dropdown appears above other elements
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#f5f5f5"
      : state.isFocused
      ? "#f5f5f5"
      : "#fff",
    color: "#000",
    cursor: "pointer",
    fontWeight: "normal",
    fontSize: "14px",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#000",
    fontWeight: "normal",
    fontSize: "14px",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#888",
    fontWeight: "normal",
    fontSize: "14px",
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#666",
    "&:hover": {
      color: "#000",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#666",
    "&:hover": {
      color: "#000",
    },
  }),
  input: (provided) => ({
    ...provided,
    color: "#000",
    fontWeight: "normal",
    fontSize: "14px",
  }),
};