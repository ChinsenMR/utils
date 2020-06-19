import alert from "./alert";
import tools from "./tools";
import verify from "./verify";
import $api from "./requestApi";
import $request from "./request";
import $page from './page'

export default {
  init(app) {
    const extend = {
      alert,
      tools,
      verify,
      $page,
      $api
    }

    wx.$request = $request;

    Object.assign(app, extend);
  },
};