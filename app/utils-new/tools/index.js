import alert from "./alert";
import tools from "./tools";
import verify from "./verify";
import cache from "./cache";
import $api from "./api/index";
import $page from './page'

export default {
  init(app) {
    Object.assign(app, {
      alert,
      tools,
      cache,
      verify,
      $api,
      $page,
    });
  },
};