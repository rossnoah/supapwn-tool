import React from "react";

type SettingsProps = {
  settings: {
    showConnectionForm: boolean;
    showQuerySection: boolean;
    showAuthSection: boolean;
    showVulnerabilityDisclosure: boolean;
    showQueryResults: boolean;
  };
  setSettings: React.Dispatch<
    React.SetStateAction<{
      showConnectionForm: boolean;
      showQuerySection: boolean;
      showAuthSection: boolean;
      showVulnerabilityDisclosure: boolean;
      showQueryResults: boolean;
    }>
  >;
};

const Settings: React.FC<SettingsProps> = ({ settings, setSettings }) => {
  const handleCheckboxChange = (component: keyof typeof settings) => {
    const newSettings = { ...settings, [component]: !settings[component] };
    setSettings(newSettings);
    localStorage.setItem("uiSettings", JSON.stringify(newSettings));
  };

  return (
    <div className="settings-panel bg-white p-4 rounded-xl shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Settings</h2>
      <div className="flex space-x-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-6 h-6"
            checked={settings.showConnectionForm}
            onChange={() => handleCheckboxChange("showConnectionForm")}
          />
          <span>Show Connection Form</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-6 h-6"
            checked={settings.showQuerySection}
            onChange={() => handleCheckboxChange("showQuerySection")}
          />
          <span>Show Query Section</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-6 h-6"
            checked={settings.showAuthSection}
            onChange={() => handleCheckboxChange("showAuthSection")}
          />
          <span>Show Auth Section</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-6 h-6"
            checked={settings.showVulnerabilityDisclosure}
            onChange={() => handleCheckboxChange("showVulnerabilityDisclosure")}
          />
          <span>Show Vulnerability Disclosure</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="w-6 h-6"
            checked={settings.showQueryResults}
            onChange={() => handleCheckboxChange("showQueryResults")}
          />
          <span>Show Query Results</span>
        </label>
      </div>
    </div>
  );
};

export default Settings;
