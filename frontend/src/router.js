import { createWebHistory, createRouter } from "vue-router";

const routes =  [
  {
    path: "/providers",
    alias: "/providers",
    name: "providers",
    component: () => import("./components/providers/ProviderList")
  },
  {
    path: "/providers/:id",
    name: "provider-details",
    component: () => import("./components/providers/Provider")
  },
  {
    path: "/add-provider",
    name: "add-provider",
    component: () => import("./components/providers/AddProvider")
  },
  {
    path: "/servicelists",
    alias: "/servicelists",
    name: "servicelists",
    component: () => import("./components/servicelist/ServiceListList")
  },
  {
    path: "/servicelists/:id",
    name: "servicelist-details",
    component: () => import("./components/servicelist/ServiceList")
  },
  {
    path: "/add-servicelist",
    name: "add-servicelist",
    component: () => import("./components/servicelist/AddServiceList")
  },
  {
    path: "/",
    alias: "/authenticate",
    name: "login",
    component: () => import("./components/Login/Login")
  },
  {
    path: "/setup",
    alias: "/setup",
    name: "setup",
    component: () => import("./components/Login/Setup")
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;