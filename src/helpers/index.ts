import '../config/config-env'

export const env = (varName: string, defaultVal: string | number | null = null): string => {
    const envVarValue: string | undefined = process.env[varName];

    if (envVarValue === undefined) {
        console.log(`Environment variable ${varName} not found in .env`);

        if (defaultVal !== null) {
            return defaultVal.toString();
        }

        console.error(`Exiting the process due to missing environment variable: ${varName}`);
        process.exit(1);
    }

    return envVarValue;
};
