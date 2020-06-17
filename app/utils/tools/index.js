import alert from "./alert";
import tools from "./tools";
import verify from "./verify";
import $api from "./requestApi";
import $request from "./request";
import {
  initPage
} from './initPage'

export default {
  init(app) {
    app.alert = alert;
    app.tools = tools;
    app.verify = verify;
    app.Page = initPage;
    app.$api = $api;
    
    wx.$request = $request;
  },
};