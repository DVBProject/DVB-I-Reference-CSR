import { createWebHistory, createRouter } from "vue-router";

import LoginService from "./services/LoginService";

import Login from "./components/Login/Login.vue";
import Logout from "./components/Login/Logout.vue";

const routes = [
  {
    path: "/providers",
    alias: "/providers",
    name: "providers",
    component: () => import("./components/providers/ProviderList.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/providers/:id",
    name: "provider-details",
    component: () => import("./components/providers/Provider.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/add-provider",
    name: "add-provider",
    component: () => import("./components/providers/Provider.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/",
    alias: "/servicelists",
    name: "servicelists",
    component: () => import("./components/servicelist/ServiceListList.vue"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    },
  },
  {
    path: "/servicelists/:id",
    name: "servicelist-details",
    component: () => import("./components/servicelist/ServiceList.vue"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    },
  },
  {
    path: "/add-servicelist",
    name: "add-servicelist",
    component: () => import("./components/servicelist/ServiceList.vue"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    },
  },
  {
    path: "/login",
    alias: "/authenticate",
    name: "login",
    component: Login,
  },
  {
    path: "/logout",
    name: "logout",
    component: Logout,
  },

  {
    path: "/setup",
    alias: "/setup",
    name: "setup",
    component: () => import("./components/Login/Setup.vue"),
    meta: {
      guest: true,
    },
  },
  {
    path: "/settings",
    alias: "/settings",
    name: "settings",
    meta: {
      requiresAuth: true,
      is_admin: true,
    },
    component: () => import("./components/settings/Settings.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("./components/admin/AdminView.vue"),
    meta: {
      requiresAuth: true,
      is_admin: true,
    },
  },
  {
    path: "/admin/user/:id",
    name: "user-edit",
    component: () => import("./components/admin/EditUser.vue"),
    meta: {
      requiresAuth: true,
      is_admin: true,
    },
  },
  {
    path: "/admin/add-user/",
    name: "user-add",
    component: () => import("./components/admin/AddUser.vue"),
    meta: {
      requiresAuth: true,
      is_admin: true,
    },
  },
  {
    path: "/view-provider/:id",
    name: "provider-view",
    component: () => import("./components/providers/ProviderView.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("./components/User/Profile.vue"),
    meta: {
      requiresAuth: true,
    },
  },
  {
    // redirect for nonexistent routes
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("./components/servicelist/ServiceListList.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
// auth & admin checking middleware
router.beforeEach(LoginService.authCheck);

export default router;
