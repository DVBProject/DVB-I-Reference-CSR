<template>
  <div class="list row">
    <div class="col-md-8">
      <div class="input-group mb-3">
        <input type="text" class="form-control" placeholder="Search by title"
          v-model="title"/>
        <div class="input-group-append">
          <button class="btn btn-outline-secondary" type="button"
            @click="searchTitle"
          >
            Search
          </button>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <h4>Service Lists</h4>
      <ul class="list-group">
        <li class="list-group-item"
          :class="{ active: index == currentIndex }"
          v-for="(list, index) in lists"
          :key="index"
          @click="setActiveList(list, index)"
        >
          {{ list.Name }}

        </li>
      </ul>
    </div>
    <div class="col-md-6 mt-3">
      <div v-if="currentList">
        <h4>Selected List</h4>
        <div>
          <label class="mx-1"><strong>Name:</strong></label> {{ currentList.Name }}
        </div>
        <div>
          <label class="mx-1"><strong>Provider:</strong></label> {{ currentList.Provider }}
        </div>
        
        <div class="d-flex">
        <label class="mx-1"><strong>Language:</strong></label>
          <div class="d-flex justify-content-end">
            <template class="mx-1" v-for="(lang, index) in currentList.languages"
            :key="index">
            <template v-if="index > 0">,</template>
            <span class="mx-1">{{lang.Language}}</span>
            </template>
          </div>
        </div>
        
        <div class="d-flex">
          <label class="mx-1"><strong>Countries:</strong></label>
          <div class="d-flex justify-content-end">
            <template class="mx-1" v-for="(tc, index) in currentList.targetCountries"
            :key="index">
            <template v-if="index > 0">,</template>
            <span class="mx-1">{{tc.country}}</span>
            </template>
          </div>
        </div>

        <div class="d-flex">
          <label class="mx-1"><strong>Genre:</strong></label>
          <div class="d-flex justify-content-end">
            <template class="mx-1" v-for="(genre, index) in currentList.Genres"
            :key="index">
            <template v-if="index > 0">,</template>
            <span >{{ genre }}</span>
            </template>
          </div>
        </div>


        <div>
          <label class="mx-1"><strong>URI:</strong></label> {{ currentList.URI }}
        </div>
        <div>
          <label class="mx-1"><strong>Delivery:</strong></label> {{ JSON.parse(currentList.Delivery).join(", ") }}
        </div>
        <div>
          <label class="mx-1"><strong>Regulator List:</strong></label> {{ currentList.regulatorList != 0 ? "Yes" : "No" }}
        </div>
        

        <router-link :to="'/servicelists/' + currentList.Id" class="badge alert-warning">Edit</router-link>
      </div>
      <div v-else>
        <br />
        <p>Please click on a Service List...</p>
      </div>
    </div>
  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import LoginService from "../../services/LoginService"

export default {
  name: "servicelist-list",
  data() {
    return {
      lists: [],
      currentList: null,
      currentIndex: -1,
      title: ""
    };
  },
  methods: {
    retrieveLists() {
      ServiceListDataService.getAll()
        .then(response => {
          this.lists = response.data;
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);

          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
          LoginService.reset()
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
    },
    
    searchTitle() {
      ServiceListDataService.findByTitle(this.title)
        .then(response => {
          this.lists = response.data;
          this.setActiveList(null);
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    }
  },
  mounted() {
    this.retrieveLists();
  }
};
</script>

<style>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>