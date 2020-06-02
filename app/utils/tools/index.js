import alert from "./alert";
import tools from "./tools";
import verify from "./verify";
import $api from "./requestApi";
import $request from "./request";

export default {
  init(app) {
    app.alert = alert;
    app.tools = tools;
    app.verify = verify;
    
    wx.$api = $api;
    wx.$request = $request;
  },
};