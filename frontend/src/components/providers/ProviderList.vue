<template>
  <div class="list">
    <div class="row">
      <div class="col-md-8">
        <div class="btn-group btn-group-sm mb-2 " role="group" aria-label="Basic radio toggle button group">
          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradioName"
            autocomplete="off"
            @change="filterRadio"
            :checked="filterType == 1"
          />
          <label class="btn btn-outline-primary" for="btnradioName">Name</label>

          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradioRegulator"
            autocomplete="off"
            @change="filterRadio"
            :checked="filterType == 2"
          />
          <label class="btn btn-outline-primary" for="btnradioRegulator">Regulator</label>

          <input
            type="radio"
            class="btn-check"
            name="btnradio"
            id="btnradioNoRegulator"
            autocomplete="off"
            @change="filterRadio"
            :checked="filterType == 3"
          />
          <label class="btn btn-outline-primary" for="btnradioNoRegulator">Not Regulator</label>
        </div>
        <div class="input-group mb-4">
          <input type="text" class="form-control" placeholder="Filter by..." v-model="title" />
        </div>
      </div>

      <div class="col-md-4">
        <router-link to="/add-provider" class="nav-link my-0 py-0">
          <div class="input-group-append">
            <button class="btn btn-outline-primary" type="button" @click="submitNewList">
              <span class="bi-plus-lg"></span>
              Add new Provider
            </button>
          </div>
        </router-link>
      </div>

      <div class="col-md-6">
        <h4>Provider List</h4>
        <ul class="list-group mainlist">
          <li
            class="list-group-item"
            :class="{ active: index == currentIndex }"
            v-for="(provider, index) in filteredList"
            :key="index"
            @click="setActiveProvider(provider, index)"
          >
            {{ provider.Names[0] ? provider.Names[0].name : "No name" }}
          </li>
        </ul>
      </div>
      <div class="col-md-6">
        <div v-if="currentProvider">
          <h4>Provider</h4>
          <div>
            <label><strong>Kind:</strong></label> {{ currentProvider.Kind || "Not defined" }}
          </div>
          <div>
            <label><strong>Provider name:</strong></label>
            {{
              currentProvider.Names[0] && currentProvider.Names[0].name != ""
                ? currentProvider.Names[0].name
                : "No name"
            }}
            {{
              currentProvider.Names[0] && currentProvider.Names[0].type != ""
                ? "(Type:" + currentProvider.Names[0].type + ")"
                : ""
            }}
          </div>
          <div>
            <label><strong>Contact name:</strong></label> {{ currentProvider.ContactName || "Not defined" }}
          </div>
          <div>
            <label><strong>Jurisdiction:</strong></label> {{ currentProvider.Jurisdiction || "Not defined" }}
          </div>
          <div>
            <label><strong>Address:</strong></label>
            {{ currentProvider.Address.trim() != "" ? currentProvider.Address : "Not defined" }}
          </div>
          <div>
            <label><strong>Electronic address:</strong></label> {{ currentProvider.ElectronicAddress || "Not defined" }}
          </div>
          <div>
            <label><strong>Regulator:</strong></label> {{ currentProvider.Regulator ? "Yes" : "No" }}
          </div>

          <router-link :to="'/providers/' + currentProvider.Id" class="btn btn-outline-primary mt-1">Edit</router-link>
          <div v-if="/*user && user.role*/ true">
            <router-link :to="'/view-provider/' + currentProvider.Id" class="btn btn-outline-primary mt-1"
              >View</router-link
            >
          </div>
        </div>
        <div v-else>
          <br />
          <p>Please click on a Provider...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ProviderDataService from "../../services/ProviderDataService";
  import LoginService from "../../services/LoginService";
  export default {
    name: "provider-list",
    data() {
      return {
        providers: [],
        currentProvider: null,
        currentIndex: -1,
        filterType: 1,
        title: "",
      };
    },
    computed: {
      user() {
        let user = false;
        try {
          user = JSON.parse(sessionStorage.getItem("user"));
        } catch {
          user = false;
        }
        return user;
      },
      filteredList() {
        let ll = this.providers.filter((elem) => {
          switch (this.filterType) {
            case 1: {
              return elem.Names.find((el) => {
                return el.name.toLowerCase().includes(this.title.toLowerCase());
              });
            }
            case 2:
              return elem.Regulator;
            case 3:
              return !elem.Regulator;
            default:
              return null;
          }
        });
        return ll;
      },
    },
    methods: {
      retrieveProviders() {
        ProviderDataService.getAll()
          .then((response) => {
            this.providers = response.data;
            this.providers.forEach((pr) => {
              try {
                pr.Jurisdiction =
                  pr.Jurisdiction.Name +
                  " " +
                  pr.Jurisdiction.AddressLine[0] +
                  " " +
                  pr.Jurisdiction.AddressLine[1] +
                  " " +
                  pr.Jurisdiction.AddressLine[2];
              } catch (err) {
                pr.Jurisdiction = "";
              }
              // parse address objects
              try {
                pr.Address =
                  pr.Address.Name +
                  " " +
                  pr.Address.AddressLine[0] +
                  " " +
                  pr.Address.AddressLine[1] +
                  " " +
                  pr.Address.AddressLine[2];
              } catch (err) {
                pr.Address = "";
              }

              try {
                pr.ElectronicAddress =
                  "Tel:" +
                  pr.ElectronicAddress.Telephone +
                  " Fax:" +
                  pr.ElectronicAddress.Fax +
                  " Email:" +
                  pr.ElectronicAddress.Email +
                  " Url:" +
                  pr.ElectronicAddress.Url;
              } catch (err) {
                pr.ElectronicAddress = "";
              }
              try {
                var names = [];
                for (const name of pr.ContactName) {
                  names.push(name.name);
                }
                pr.ContactName = names.join(" ");
              } catch (err) {
                pr.ContactName = "";
              }
              try {
                var kinds = [];
                for (const kind of pr.Kind) {
                  if (kind.name) {
                    kinds.push(kind.name);
                  }
                }
                pr.Kind = kinds.join(" ");
              } catch (err) {
                pr.Kind = "";
              }
            });
            //console.log(response.data);
          })
          .catch((e) => {
            console.log(e);
            // TODO: move this handler the service module
            // error with fetch (unauthorized)
            // clear session data & re-login
            LoginService.reset();
          });
      },
      refreshList() {
        this.retrieveProviders();
        this.currentProvider = null;
        this.currentIndex = -1;
      },
      setActiveProvider(provider, index) {
        this.currentProvider = provider;
        this.currentIndex = provider ? index : -1;
        //console.log(this.currentProvider)
      },

      filterRadio(item) {
        if (item.target.id === "btnradioName") this.filterType = 1;
        if (item.target.id === "btnradioRegulator") this.filterType = 2;
        if (item.target.id === "btnradioNoRegulator") this.filterType = 3;

        this.currentProvider = null;
        this.currentIndex = -1;
      },

      searchTitle() {
        ProviderDataService.findByTitle(this.title)
          .then((response) => {
            this.providers = response.data;
            this.setActiveProvider(null);
            console.log(response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      },
    },
    mounted() {
      this.retrieveProviders();
    },
  };
</script>

<style scoped>
  .list {
    text-align: left;
    max-width: 1050px;
    margin: auto;
  }
  .mainlist {
    max-height: 70vh;
    overflow-y: scroll;
  }
</style>
