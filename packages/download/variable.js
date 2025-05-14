import replaceStream from "replacestream";

export const getVariablesFromZip = (zip, filePath) => {
  let variables = {};

  try {
    const zipEntries = zip.getEntries();
    const variablesEntry = zipEntries.find((entry) =>
      entry.entryName.endsWith(filePath)
    );
    variables = JSON.parse(variablesEntry.getData().toString());
  } catch (error) {
    console.error("Read variables error: ", error);
  }

  return variables;
};

function getValueByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : ""), obj) ?? "";
}
const variablePattern = /{{{\s*\.(.+?)\s*}}}/g;

export const variablesReplaceStream = (variables) => {
  return () =>
    replaceStream(variablePattern, (match, path) => {
      const value = getValueByPath(variables, path.trim());
      if (value) {
        return String(value);
      }
      return match;
    });
};
