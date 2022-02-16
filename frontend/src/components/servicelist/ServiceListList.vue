<template>
  <div class="list">
    <div class="row">
      <div class="col-md-8">
        <div class="btn-group btn-group-sm mb-2 " role="group" aria-label="Basic radio toggle button group">
          <input type="radio" class="btn-check" name="btnradio" id="btnradioName" autocomplete="off" @change="filterRadio" :checked="filterType == 1">
          <label class="btn btn-outline-primary" for="btnradioName">Name</label>
  
          <input type="radio" class="btn-check" name="btnradio" id="btnradioCountry" autocomplete="off" @change="filterRadio" :checked="filterType == 2">
          <label class="btn btn-outline-primary" for="btnradioCountry">Country</label>

          <input type="radio" class="btn-check" name="btnradio" id="btnradioProvider" autocomplete="off" @change="filterRadio" :checked="filterType == 3">
          <label class="btn btn-outline-primary" for="btnradioProvider">Provider</label>
        </div>
      
        <div class="input-group mb-4">
          <input type="text" class="form-control" placeholder="Filter by..." 
            v-model="title"/>
        </div>

      </div>

      <div class="col-md-4">
        <router-link to="/add-servicelist" class="nav-link my-0 py-0">
        <div class="input-group-append">
            <button class="btn btn-outline-primary" type="button"
            @click="submitNewList">
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
          <li class="list-group-item"
            :class="{ active: index == currentIndex }"
            v-for="(list, index) in filteredList"
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
            <label class="mx-1"><strong>Name:</strong></label> {{ currentList.Name || "Not defined" }}
          </div>
          <div>
            <label class="mx-1"><strong>Provider:</strong></label> {{ currentList.Provider ||"Not defined" }}
          </div>
          
          <div class="d-flex">
          <label class="mx-1"><strong>Languages:</strong></label>
            <div class="d-flex justify-content-end">
              <template class="mx-1" v-for="(lang, index) in currentList.languages"
              :key="index">
              <template v-if="index > 0">,</template>
              <span class="mx-1">{{lang.Language}}</span>
              </template>
              {{currentList.languages.length ? "" : "Not defined"}}
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
              {{currentList.targetCountries.length ? "" : "Not defined"}}
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
              {{currentList.Genres.length ? "" : "Not defined"}}
            </div>
          </div>


          <div>
            <label class="mx-1"><strong>URI:</strong></label> {{ currentList.URI || "Not defined" }}
          </div>
          <div>
            <label class="mx-1"><strong>Delivery:</strong></label> {{ Delivery }}
          </div>
          <div>
            <label class="mx-1"><strong>Regulator List:</strong></label> {{ currentList.regulatorList != 0 ? "Yes" : "No" }}
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
      filterType: 1,
      title: "",
      Delivery: ""
    };
  },
  computed: {
    filteredList() {
      let ll = this.lists.filter(elem => {
        switch(this.filterType) {
          case 1: return elem.Name.includes(this.title)
          case 2: {              
              return elem.targetCountries.find(el => {
                return el.country.includes(this.title)
              })
            }
          case 3: return elem.Provider.includes(this.title)
          default: return null
        }
      })
      return ll
    }
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
      try {
        this.Delivery = JSON.parse(list.Delivery).join(", ")
      } catch {
        this.Delivery = list.Delivery
      }
      
    },

    filterRadio(item) {
      if(item.target.id === "btnradioName") this.filterType = 1
      if(item.target.id === "btnradioCountry") this.filterType = 2
      if(item.target.id === "btnradioProvider") this.filterType = 3

      this.currentList = null
      this.currentIndex = -1
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
    },
  },
  mounted() {
    this.retrieveLists();
  }
};
</script>

<style scoped>

.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
.mainlist {
  max-height: 70vh;  
  overflow-y: scroll;
}
</style>