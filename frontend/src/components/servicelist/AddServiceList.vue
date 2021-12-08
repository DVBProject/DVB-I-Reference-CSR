<template>
  <div class="list row">
      
    <div class="col-md-8">
      <h4>Add Service List</h4>

      <label>Service List Name:</label>
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
         >{{item.Names[0].name}}</option>
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
                v-on:click="removeDelivery"
                class="btn btn-outline-primary mx-1 my-1">{{item}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
          </ul>
        </div>        
      </div>

      <div class="my-2">
      <label for="languagesDataList" class="form-label">Languages:</label>
      <input class="form-control" list="datalistOptionsLanguages" 
          id="languagesDataList" placeholder="Type to search..."
          v-on:change="addLang"
          v-on:click="addLang">
          <datalist id="datalistOptionsLanguages">
            <option
                v-for="(item, index) in languages_ui"
                v-bind:key="index"
                v-bind:value="index"
                >
                {{item.name}}
            </option>
          </datalist>

          <div class="btn-group">
            <ul class="px-0 btn-group-sm">
              <li v-for="(item, index) in SelectedLanguages" 
                  v-bind:id="index"
                  v-bind:key="index"
                  v-on:click="removeLang"
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
            </ul>
          </div>
      </div>

      <div class="my-2">
        <label for="countriesDataList" class="form-label">Target countries:</label>       
        <input class="form-control" list="datalistOptionsCountries"
            id="countriesDataList" placeholder="Type to search..."
            v-on:change="addCountry"
            v-on:click="addCountry">
            <datalist id="datalistOptionsCountries">
            <option
                v-for="(item, index) in countries_ui"
                v-bind:key="index"
                v-bind:value="index"
                >
                {{item.name}}
            </option>
          </datalist>

          <div class="btn-group">
            <ul class="px-0 btn-group-sm">
              <li v-for="(item, index) in SelectedCountries" 
                  v-bind:id="index"
                  v-bind:key="index"
                  v-on:click="removeCountry"
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
            </ul>
          </div>
      </div>

      <div class="my-2">
        <label for="genreDataList" class="form-label">Genres:</label>
        <input class="form-control" list="datalistOptionsGenre"
            id="genreDataList" placeholder="Type to search..."
            v-on:change="addGenre"
            v-on:click="addGenre">
            <datalist id="datalistOptionsGenre">
            <option
                v-for="(item, index) in genres_ui"
                v-bind:key="index"
                v-bind:value="index"
                >
                {{item}}
            </option>
          </datalist>

          <div class="btn-group">
            <ul class="px-0 btn-group-sm">
              <li v-for="(item, index) in SelectedGenres" 
                  v-bind:id="index"
                  v-bind:key="index"
                  v-on:click="removeGenre"
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
            </ul>
          </div>
      </div>

      <label>Regulator list:</label><br>
      <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" checked>
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio">
        <label class="btn btn-outline-primary" for="btnradioNo">No</label>
      </div>
  
    </div>

    <div class="col-md-4">

        <div class="input-group-append">
            <button class="btn btn-outline-primary" type="button"
            @click="submitNewList">
            Add List
            </button>
        </div>
    </div>

  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import ProviderDataService from "../../services/ProviderDataService"
import LoginService from "../../services/LoginService"
//import Multiselect from 'vue-multiselect'
import { deliveries,genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"
import countries from "../../../../common/countries"
export default {
  name: "add-servicelist",
  //components: { Multiselect },
  data() {
    return {
      providers: [],
      deliveries: [],
      SelectedDeliveries: [],
      genres_ui: [],
      SelectedGenres: [],
      countries_ui: [],
      SelectedCountries: [],
      languages_ui: [],
      SelectedLanguages: [],
      Name: "",
      URI: "",
      lang: "",
      Provider: 0,
      regulatorList: 1,
      Delivery: "",
      
    };
  },
  methods: {
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          this.Provider = response.data[0].Id;
          console.log("provirders:", response.data);
        })
        .catch(e => {
          console.log(e);
          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
          LoginService.reset()
        });
    },
    
    submitNewList() {
        const data = {
            Name: this.Name,
            URI: this.URI,
            lang: this.SelectedLanguages,
            Provider: this.Provider,
            regulatorList: this.regulatorList,
            Delivery: this.SelectedDeliveries,
            Countries: this.SelectedCountries,
            Genres: this.SelectedGenres
        } 

        ServiceListDataService.create(data)
            .then(response => {
                console.log(response)
                setTimeout(() => {
                  this.$router.push({ name: "servicelists" });
                }, 1000)
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

    addLang(item) {
      //console.log(item.target.value)
      const value = item.target.value
      if(value.length === 2) {
        const valid = languages[value] !== undefined

        if(valid) {
          this.SelectedLanguages.push({name: languages[value].name, a3: value})
        }
        else {
          console.log("not valid", value)
        }
      }
      item.target.value = null
    },
    removeLang(item) {
      this.SelectedLanguages.splice(item.target.id, 1)
    },

    addCountry(item) {
      const value = item.target ? item.target.value : item
      const country = this.countries_ui[value];
      if(country) {
        this.SelectedCountries.push({name: country.name, code: value})
      }

      item.target.value = null
    },
    removeCountry(item) {
      //console.log("remove:", item.target.id)
      this.SelectedCountries.splice(item.target.id, 1)
    },
    addGenre(item) {
      const value = item.target ? item.target.value : item
      const valid = genres[value] !== undefined

      if(valid) {
          this.SelectedGenres.push({ name: genres[value], value: value});
      }

      if(item.target) item.target.value = null
    },
    removeGenre(item) {
      this.SelectedGenres.splice(item.target.id, 1)
    },

    regulatorRadio(item) {
      if(item.target.id === "btnradioYes") {
        this.regulatorList = 1
      } 
      else {
        this.regulatorList = 0
      }
    }

    

  },
  mounted() {
    // phase1 insert values from fixed lists (dev_constants.js)
    this.deliveries = deliveries
    this.SelectedDeliveries.push(deliveries[0])
    this.countries_ui = countries
    this.languages_ui = languages
    this.genres_ui = genres
    
    this.retrieveProviders()
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