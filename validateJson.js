import {hbLogger} from "./hbLogger";

export const validateJson = (str) => {
    try {
        const obj = JSON.parse(str);
        if (obj && typeof o === "object") {
            return obj;
        }
    }
    catch (e) {
        hbLogger.error(`validateJson- tryParseJSON - exception: ${e.message} `);
    }
    return false;
};
