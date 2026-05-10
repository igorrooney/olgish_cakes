import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "../sanity/env";
import { DocumentPublishValidationLayout } from "../sanity/components/DocumentPublishValidationLayout";
import { schema } from "../sanity/schema";
import { structure } from "../sanity/structure";
import { createArticlePublishAction } from "./articlePublishAction";

const singletonTypes = new Set(['cakesFeaturedOffer', 'cakesDeliverySection', 'giftHampersDeliverySection', 'collectionsDisplayOrder', 'productsDisplayOrder'])

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema,
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    components: {
      unstable_layout: DocumentPublishValidationLayout,
    },
    newDocumentOptions: (previousOptions, context) => {
      if (context.creationContext.type !== 'global') {
        return previousOptions
      }

      return previousOptions.filter((option) => !singletonTypes.has(option.templateId))
    },
    actions: (previousActions, context) => {
      let actions = previousActions

      if (singletonTypes.has(context.schemaType)) {
        actions = actions.filter((action) => action.action !== 'duplicate')
      }

      if (context.schemaType === 'article') {
        actions = actions.map((action) =>
          action.action === 'publish' ? createArticlePublishAction(action) : action
        )
      }

      return actions
    }
  }
});
