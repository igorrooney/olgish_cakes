/**
* This configuration file lets you run `$ sanity [command]` in this folder
* Go to https://www.sanity.io/docs/cli to learn more.
**/
import { defineCliConfig } from 'sanity/cli'

// Support both NEXT_PUBLIC_ and non-prefixed variants for CI/CD environments
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET

// Validate required configuration values
if (!projectId) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_PROJECT_ID'
    )
}

if (!dataset) {
    throw new Error(
        'Missing required environment variable: NEXT_PUBLIC_SANITY_DATASET or SANITY_DATASET'
    )
}

export default defineCliConfig({
    api: {
        projectId,
        dataset
    }
})
