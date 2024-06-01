export const customStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: "#1e293b",
    borderColor: "#fff",
    borderWidth: "1px",
    borderRadius: "4px",
    color: "#fff",
    boxShadow: state.isFocused ? "0 0 0 1px #fff" : "none",
    "&:hover": {
      borderColor: "#fff"
    }
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#1e293b",
    borderColor: "#fff",
    borderWidth: "1px",
    borderRadius: "4px",
    color: "#fff",
    width: "130px", 
  }),
  menuList: (provided) => ({
    ...provided,
    padding: 0,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff"
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#374151" : "#1e293b",
    color: state.isSelected ? "#fff" : "#fff",
    "&:hover": {
      backgroundColor: "#374151",
      color: "#fff"
    }
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#fff"
  }),
  dropdownIndicator: (provided) => ({
    ...provided,
    color: "#fff",
    "&:hover": {
      color: "#fff"
    }
  }),
  indicatorSeparator: (provided) => ({
    ...provided,
    backgroundColor: "#fff"
  }),
  clearIndicator: (provided) => ({
    ...provided,
    color: "#fff",
    "&:hover": {
      color: "#fff"
    }
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff"
  })
};
