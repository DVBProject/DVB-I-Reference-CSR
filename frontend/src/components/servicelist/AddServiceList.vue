<template>
  <div class="list row">
      
    <div class="col-md-8">
      <h4>Add Service List</h4>

      <label>Name:</label>
      <input type="text" class="form-control my-2" placeholder="List Name"
          v-model="Name"/>
      <label>URI:</label>
      <input type="text" class="form-control my-2" placeholder="URI"
          v-model="URI"/>

      <label>Organization:</label>
      <select class="form-control my-2" placeholder="Provider"
          v-model="Provider">
        <option
            v-for="item in providers"
            v-bind:key="item.Id"
            v-bind:value="item.Id"
         >{{item.name}}</option>
      </select>

      <div class="my-2">
      
        <label for="deliveriesDataList" class="form-label">Deliveries:</label>
        
        <input class="form-control" list="datalistOptionsDeliveries" 
            id="deliveriesDataList" placeholder="Type to search..."
            v-on:change="addDelivery"
            v-on:click="addDelivery">
          <datalist id="datalistOptionsDeliveries">
            <option
                v-for="(item, index) in deliveries"
                v-bind:key="index"
                v-bind:value="item"
                >
                {{item}}
            </option>
          </datalist>
        
        <div class="btn-group">
          <ul class="px-0 btn-group-sm">
            <li v-for="(item, index) in SelectedDeliveries" 
                v-bind:id="index"
                v-bind:key="index"
                v-bind:value="item"
                v-on:click="removeDelivery"
                class="btn btn-outline-primary mx-1 my-1">{{item}} <span class="badge small bg-primary">x</span></li>
          </ul>
        </div>
        

      </div>

      <label>Languages:</label>
      <input type="text" class="form-control my-2" placeholder="languages"
          v-model="languages"/>

      <label>Target countries:</label>
      <input type="text" class="form-control my-2" placeholder="Countries"
          v-model="countries"/>

      <label>Genres:</label>
      <input type="text" class="form-control my-2" placeholder="Genres"
          v-model="genres"/>

      <label>Regulator list:</label><br>
      <div class="btn-group btn-group-sm" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradio1" autocomplete="off" checked>
        <label class="btn btn-outline-primary" for="btnradio1">Yes</label>

        <input type="radio" class="btn-check" name="btnradio" id="btnradio3" autocomplete="off">
        <label class="btn btn-outline-primary" for="btnradio3">No</label>
      </div>
      <input type="text" class="form-control my-2" placeholder="List index"
          v-model="regulatorList"/>

  
    </div>

    <div class="col-md-4">

        <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button"
            @click="addList">
            Add List
            </button>
        </div>
    </div>

  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import ProviderDataService from "../../services/ProviderDataService"
//import Multiselect from 'vue-multiselect'
import { deliveries, genres } from "../../dev_constants"
export default {
  name: "add-servicelist",
  //components: { Multiselect },
  data() {
    return {
      providers: [],
      deliveries: [],
      SelectedDeliveries: [],
      genres: [],
      SelectedGenres: [],
      countries: "",
      SelectedCountries: [],
      languages: "",
      SelectedLanguages: [],
      Name: "",
      URI: "",
      lang: "",
      Provider: 0,
      regulatorList: 0,
      Delivery: "",
      
    };
  },
  methods: {
    retrieveLists() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          this.Provider = response.data[0].Id;
          console.log("lists:", response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    
    addList() {
        const data = {
            Name: this.Name,
            URI: this.URI,
            lang: this.lang,
            Provider: this.Provider,
            regulatorList: this.regulatorList,
            Delivery: this.Delivery,          
        } 

        ServiceListDataService.create(data)
            .then(response => {
                console.log(response)
            })
            .catch(err => {
                console.log(err);
            });
    },

    addDelivery(item) {
      const valid = this.deliveries.findIndex( elem => {
        return elem === item.target.value
      })

      if(valid !== -1) {
        const index = this.SelectedDeliveries.findIndex( elem => {
          return elem === item.target.value
        })
        
        if(index === -1) {
          this.SelectedDeliveries.push(item.target.value)
        }
      }

      item.target.value = null
    },
    removeDelivery(item) {
      if(this.SelectedDeliveries.length > 1) {
        this.SelectedDeliveries.splice(item.target.id, 1)
      }
    },

  },
  mounted() {
    // phase1 insert values from fixed lists (dev_constants.js)
    this.deliveries = deliveries
    this.SelectedDeliveries.push(deliveries[0])
    this.genres = genres


    this.retrieveLists()
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