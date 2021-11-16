import { createWebHistory, createRouter } from "vue-router";

import LoginService from "./services/LoginService";

import Login from "./components/Login/Login"

const routes =  [
  {
    path: "/providers",
    alias: "/providers",
    name: "providers",
    component: () => import("./components/providers/ProviderList"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/providers/:id",
    name: "provider-details",
    component: () => import("./components/providers/Provider"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/add-provider",
    name: "add-provider",
    component: () => import("./components/providers/AddProvider"),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/",
    alias: "/servicelists",
    name: "servicelists",
    component: () => import("./components/servicelist/ServiceListList"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    }
  },
  {
    path: "/servicelists/:id",
    name: "servicelist-details",
    component: () => import("./components/servicelist/ServiceList"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    }
  },
  {
    path: "/add-servicelist",
    name: "add-servicelist",
    component: () => import("./components/servicelist/AddServiceList"),
    meta: {
      requiresAuth: true,
      //is_admin: true
    }
  },
  {
    path: "/login",
    alias: "/authenticate",
    name: "login",
    component: Login
  },
  {
    path: "/setup",
    alias: "/setup",
    name: "setup",
    component: () => import("./components/Login/Setup"),
    meta: {
      guest: true
    }
  },
  {
    // redirect for nonexistent routes
    path: "/:pathMatch(.*)*",
    name: "notfound",
    component: () => import("./components/Login/Login")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


// auth & admin checking middleware
router.beforeEach(LoginService.authCheck)


export default router;