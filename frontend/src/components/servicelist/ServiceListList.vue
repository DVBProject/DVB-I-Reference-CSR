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
          <label><strong>Name:</strong></label> {{ currentList.Name }}
        </div>
        <div>
          <label><strong>Provider:</strong></label> {{ currentList.Provider }}
        </div>
        <div>
          <label><strong>Language:</strong></label> {{ currentList.lang }}
        </div>
        <div>
          <label><strong>URI:</strong></label> {{ currentList.URI }}
        </div>
        <div>
          <label><strong>Delivery:</strong></label> {{ currentList.delivery }}
        </div>
        <div>
          <label><strong>Regulator List:</strong></label> {{ currentList.regulatorList }}
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