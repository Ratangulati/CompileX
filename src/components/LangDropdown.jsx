import React from "react";
import Select from "react-select";
import { languageOptions } from "../constants/languageOptions";
import { customStyles } from "../constants/customStyles";

const LanguagesDropdown = ({ onSelectChange, language }) => {
  return (
    <Select
      placeholder={`Filter By Category`}
      options={languageOptions}
      value={language}
      onChange={onSelectChange}
      styles={customStyles}
    />
  );
};

export default LanguagesDropdown;