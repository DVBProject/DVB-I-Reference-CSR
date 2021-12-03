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
           <button class="btn btn-outline-secondary" type="button"
            @click="generateData"
          >
            Generate 5 Random service lists(TESTING)
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
          <label class="mx-1"><strong>Delivery:</strong></label> {{ Delivery }}
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
import ProviderDataService from "../../services/ProviderDataService"
import ServiceListDataService from "../../services/ServiceListDataService"
import LoginService from "../../services/LoginService"
import countries from "../../../../common/countries"
import { deliveries, genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"


export default {
  name: "servicelist-list",
  data() {
    return {
      lists: [],
      currentList: null,
      currentIndex: -1,
      title: "",
      Delivery: ""
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
      try {
        this.Delivery = JSON.parse(list.Delivery).join(", ")
      } catch {
        this.Delivery = list.Delivery
      }
      
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
    generateData() {
      ProviderDataService.getAll()
        .then(response => {
          let providerList = response.data;
          console.log("provirders:", response.data);
               for(let i = 0; i < 5;i++) {
        let languageList = [];
        let delivertyList = [];
        let countryList = [];
        let genreList = [];
        let provider = providerList[Math.floor(Math.random() * providerList.length)].Id
        let regulator =  Math.round(Math.random());
        let rand = Math.floor(Math.random() * 5);
        let keys = Object.keys(languages);
        for(let j = 0;j < rand;j++) {
          let value = keys[Math.floor(Math.random() * keys.length)]
          languageList.push({name: languages[value].name, a3: value});
        }
        rand = Math.floor(Math.random() * 2);
        for(let j = 0;j < rand;j++) {
          let value = deliveries[Math.floor(Math.random() * deliveries.length)]
          delivertyList.push(value);
        }
        rand = Math.floor(Math.random() * 5);
        keys = Object.keys(countries);
        for(let j = 0;j < rand;j++) {
          let value = keys[Math.floor(Math.random() * keys.length)]
          countryList.push({name: countries[value].name, code: value});
        }
        rand = Math.floor(Math.random() * 5);
        keys = Object.keys(genres);
        for(let j = 0;j < rand;j++) {
          let value = keys[Math.floor(Math.random() * keys.length)]
          genreList.push({name: genres[value].name, value: value});
        }
        const data = {
            Name: "ServiceList "+(this.lists.length+i+1),
            URI: "https://serviceprovider-"+(this.lists.length+i+1)+".net/servicelist.xml",
            lang: languageList,
            Provider: provider,
            regulatorList: regulator,
            Delivery: delivertyList,
            Countries: countryList,
            Genres: genreList
        } 

        ServiceListDataService.create(data)
            .then(response => {
                console.log(response)
                if(i == 4) {
                  setTimeout(() => {
                  this.$router.go();
                  }, 1000)
                }
            })
            .catch(err => {
                console.log(err);
            });
      }
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