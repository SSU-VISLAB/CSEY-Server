import { ResourceOptions } from "adminjs";
import { linktreeTab } from "./common.js";
import { Components } from "../components/index.js";
import { LinktreeHandler } from "../handlers/linktree.js";

const linktreeOptions: ResourceOptions = {
    navigation: linktreeTab,
  
    listProperties: ["order", "text", "src"],
    showProperties: ["major", "text", "src", "order"],
    editProperties: ["major", "text", "src", "order"],
    filterProperties: ["major", "text", "src", "order"],
  
    properties: {
      content: {
        type: "richtext",
      },
      major_advisor: {
        isRequired: true,
      },
      image: {
        isArray: true,
      },
    },
    actions: {
        new: {
            component: Components.linktree_edit,
        },
        edit: {
            component: Components.linktree_edit,
        },
        list: {
            handler: LinktreeHandler.list
        }
    }
  };

export const LINKTREE = {
    options: linktreeOptions,
  };
  