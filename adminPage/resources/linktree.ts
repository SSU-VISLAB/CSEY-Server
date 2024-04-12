import { ResourceOptions } from "adminjs";
import { linktreeTab } from "./common.js";
import { Components } from "../components/index.js";
import { LinktreeHandler } from "../handlers/index.js";

const linktreeOptions: ResourceOptions = {
  navigation: linktreeTab,

  listProperties: ["order", "text", "src"],
  showProperties: ["major", "text", "src", "order"],
  editProperties: ["major", "text", "src", "order"],
  filterProperties: ["major", "text", "src", "order"],

  actions: {
    new: {
      component: Components.linktree_edit,
      after: LinktreeHandler.after('new')
    },
    edit: {
      component: Components.linktree_edit,
      after: LinktreeHandler.after('edit')
    },
    list: {
      handler: LinktreeHandler.list,
    },
    delete: {
      after: LinktreeHandler.deleteAfter()
    }
  },
};

export const LINKTREE = {
  options: linktreeOptions,
};
