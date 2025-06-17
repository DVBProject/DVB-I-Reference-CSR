<template>
  <div>
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
              id="btnradioCountry"
              autocomplete="off"
              @change="filterRadio"
              :checked="filterType == 2"
            />
            <label class="btn btn-outline-primary" for="btnradioCountry">Country</label>

            <input
              type="radio"
              class="btn-check"
              name="btnradio"
              id="btnradioProvider"
              autocomplete="off"
              @change="filterRadio"
              :checked="filterType == 3"
            />
            <label class="btn btn-outline-primary" for="btnradioProvider">Provider</label>
          </div>

          <div class="input-group mb-4">
            <input type="text" class="form-control" placeholder="Filter by..." v-model="title" />
          </div>
        </div>

        <div class="col-md-4">
          <router-link to="/add-servicelist" class="nav-link my-0 py-0">
            <div class="input-group-append">
              <button class="btn btn-outline-primary" type="button" @click="submitNewList">
                <span class="bi-plus-lg"></span>
                Add new Service List
              </button>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="list">
      <div class="row">
        <div class="col-md-6">
          <h4>Service Lists</h4>
          <ul class="list-group mainlist">
            <li
              class="list-group-item"
              :class="{ active: index == currentIndex }"
              v-for="(list, index) in filteredList"
              :key="index"
              @click="setActiveList(list, index)"
            >
              {{ list.Names.length > 0 ? list.Names[0].name : "No name" }}
            </li>
          </ul>
        </div>
        <div class="col-md-6 mt-3">
          <div v-if="currentList">
            <h4>Selected List</h4>
            <div class="mx-1">
              <strong>Names: </strong>
              <span v-for="(name, index) in currentList.Names" :key="index">
                <template v-if="index > 0">, </template>
                <template v-if="name.name">{{ name.name }}</template>
                <template v-if="name.lang">({{ name.lang }})</template>
              </span>
            </div>
            <div>
              <label class="mx-1"><strong>Provider:</strong></label> {{ currentList.Provider || "Not defined" }}
            </div>

            <div class="mx-1">
              <strong>Languages: </strong>
              <span v-for="(lang, index) in currentList.languages" :key="index">
                <template v-if="index > 0">, </template>
                <template v-if="lang && lang.Language && lang.Language in languages_ui">{{
                  languages_ui[lang.Language].name
                }}</template>
              </span>
            </div>

            <div class="mx-1">
              <strong>Countries: </strong>
              <span v-for="(tc, index) in currentList.targetCountries" :key="index">
                <template v-if="index > 0">, </template>
                <template v-if="tc && tc.country && tc.country in countries_ui">{{
                  countries_ui[tc.country].name
                }}</template>
              </span>
            </div>

            <div class="mx-1">
              <strong>Genres: </strong>
              <span v-for="(genre, index) in currentList.Genres" :key="index">
                <template v-if="index > 0">, </template>
                <template v-if="genre && genre.value in genres_ui">{{ genres_ui[genre.value] }}</template>
              </span>
            </div>

            <div class="mx-1">
              <strong>URI: </strong>
              <span v-for="(uri, index) in currentList.URI" :key="index">
                <template v-if="index > 0">, </template>
                <span>{{ uri }}</span>
              </span>
            </div>
            <div>
              <label class="mx-1"><strong>Delivery:</strong></label> {{ Delivery }}
            </div>
            <div>
              <label class="mx-1"><strong>Regulator List:</strong></label>
              {{ currentList.regulatorList != 0 ? "Yes" : "No" }}
            </div>

            <router-link :to="'/servicelists/' + currentList.Id" class="btn btn-outline-primary mt-1">Edit</router-link>
          </div>
          <div v-else>
            <br />
            <p>Please click on a Service List...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import ServiceListDataService from "../../services/ServiceListDataService";
  import LoginService from "../../services/LoginService";
  import countries from "../../countries";
  import { genres } from "../../dev_constants";
  import languages from "../../languages";

  export default {
    name: "servicelist-list",
    data() {
      return {
        lists: [],
        currentList: null,
        currentIndex: -1,
        filterType: 1,
        title: "",
        Delivery: "",
        genres_ui: [],
        countries_ui: [],
        languages_ui: [],
      };
    },
    computed: {
      filteredList() {
        let ll = this.lists.filter((elem) => {
          switch (this.filterType) {
            case 1: {
              if (!this.title || this.title == "") {
                return true;
              } else {
                return elem.Names.find((el) => {
                  return el.name.toLowerCase().includes(this.title.toLowerCase());
                });
              }
            }
            case 2: {
              return elem.targetCountries.find((el) => {
                return el.country.toLowerCase().includes(this.title.toLowerCase());
              });
            }
            case 3:
              return elem.Provider.toLowerCase().includes(this.title.toLowerCase());
            default:
              return null;
          }
        });
        return ll;
      },
    },
    methods: {
      retrieveLists() {
        ServiceListDataService.getAll()
          .then((response) => {
            this.lists = response.data;
            console.log(response.data);
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
        this.retrieveLists();
        this.currentList = null;
        this.currentIndex = -1;
      },
      setActiveList(list, index) {
        this.currentList = list;
        this.currentIndex = list ? index : -1;
        try {
          this.Delivery = Object.keys(list.Delivery).join(", ");
        } catch {
          this.Delivery = list.Delivery;
        }
      },

      filterRadio(item) {
        if (item.target.id === "btnradioName") this.filterType = 1;
        if (item.target.id === "btnradioCountry") this.filterType = 2;
        if (item.target.id === "btnradioProvider") this.filterType = 3;

        this.currentList = null;
        this.currentIndex = -1;
      },

      searchTitle() {
        ServiceListDataService.findByTitle(this.title)
          .then((response) => {
            this.lists = response.data;
            this.setActiveList(null);
            console.log(response.data);
          })
          .catch((e) => {
            console.log(e);
          });
      },
    },
    mounted() {
      this.countries_ui = countries;
      this.languages_ui = languages;
      this.genres_ui = genres;
      this.retrieveLists();
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
