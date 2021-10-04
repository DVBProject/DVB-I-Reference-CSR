import { createWebHistory, createRouter } from "vue-router";

const routes =  [
  {
    path: "/",
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
  /*{
    path: "/",
    alias: "/servicelists",
    name: "servicelists",
    component: () => import("./components/servicelists/ServiceListList")
  },
  {
    path: "/servicelists/:id",
    name: "servicelist-details",
    component: () => import("./components/servicelists/ServiceList")
  },
  {
    path: "/add-servicelist",
    name: "add-servicelist",
    component: () => import("./components/servicelists/AddServiceList")
  }*/
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;