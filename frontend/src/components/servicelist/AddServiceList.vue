<template>
  <div class="list row">
      
    <div class="col-md-8">
      <h4>Add Service List</h4>

      <label>Service List Names:</label>
      <button class="btn btn-outline-primary mx-2 mb-1" type="button"
            @click="addNameField"
          >
        +
      </button>
      <div class="input-group mb-3">

        
        <div class="col-sm-12 px-0"
            v-for="(name, index) in Names"
            :key="index">      

          <div class="row my-0 mx-0">

            <div class="form-floating px-0 col-sm-5">          
              <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Name"
                  v-model="name.name"/>
              <label for="floatingInput">Name</label>
            </div>

            <div class="form-floating px-0 col-sm-5">
              <input class="form-control" list="datalistOptionsLanguages2" 
                id="floatingInput2"
                placeholder="Type to search..."
                v-model="name.lang"
                >
                <label for="floatingInput2">Language</label>
                <datalist id="datalistOptionsLanguages2">
                  <option
                      v-for="(item, index) in languages_ui"
                      v-bind:key="index"
                      v-bind:value="index"
                      >
                      {{item.name}}
                  </option>
                </datalist>
            </div>

          <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
            :id="index"
            @click="delNameField"
            :disabled="Names.length <= 1"
          >
            -
          </button>
          </div>

        </div>        
      </div>


      <label>URI:</label>
      <div class="row my-0 mx-0 px-0">
        <div class="px-0 col-sm-10">
          <input type="text" class="form-control my-2 mx-0" placeholder="URI"
            v-model="URI"/>
        </div>
        <div class="btn-group-sm my-0 mx-0 px-0 col-sm-2">
          <button class="btn btn-outline-primary mt-2 py-2 col-sm-12"
            @click="testURI"
          >
          Test
          </button> 
        </div>
      </div>

      <label>Provider:</label>
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
            <li v-for="(value,key,index) in SelectedDeliveries" 
                v-bind:id="index"
                v-bind:key="key"
                
                class="btn btn-outline-primary mx-1 my-1">{{key}} <span v-bind:id="key" v-on:click="removeDelivery" class="badge small bg-primary">x</span></li>
          </ul>
        </div>
               <div v-if="'DVBTDelivery' in SelectedDeliveries" >
          <input type="checkbox" class="form-check-input" id="dvbt_required" v-model="DVBTDelivery.required"/>
          <label class="form-check-label" for="dvbt_required">DVB-T Delivery: required</label>
        </div>
        <div v-if="'DVBCDelivery' in SelectedDeliveries" >
          <label for="network_id">DVB-C Delivery: Network ID</label>
          <input type="text" class="form-control my-2" id="network_id" v-model="DVBCDelivery.networkID"/>
          <input type="checkbox" class="form-check-input" id="dvbc_required" v-model="DVBCDelivery.required"/>
          <label class="form-check-label" for="dvbc_required">DVB-C Delivery: required</label>
        </div>
        <div v-if="'DVBSDelivery' in SelectedDeliveries" >
          <div class="form-group">
          <input type="checkbox" class="form-check-input" id="dvbs_required" v-model="DVBCDelivery.required"/>
          <label class="form-check-label" for="dvbs_required">DVB-S Delivery: required</label>
          </div>
          <label for="Name">Orbital Position</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addOrbitalPositionField">+</button>
          <div class="col-sm-12 px-0" v-for="(position,index) in OrbitalPosition" :key="index">
            <div class="row my-0 mx-0">
              <div class="form-floating px-0 col-sm-5">
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Orbital position"
                    v-model="OrbitalPosition[index]"/>
                <label for="floatingInput">Orbital position</label>
              </div>
              <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                :id="index"
                @click="delOrbitalPositionField"
                :disabled="Names.length <= 0">-</button>
            </div>
          </div>
        </div>
        <div v-if="'ApplicationDelivery' in SelectedDeliveries" >
          <div class="form-group">
          <input type="checkbox" class="form-check-input" id="application_required" v-model="ApplicationDelivery.required"/>
          <label class="form-check-label" for="application_required">Application Delivery: required</label>
          </div>
          <label for="Name">Application Types</label>
          <button class="btn btn-outline-primary mx-2 mb-1" type="button" @click="addApplicationTypeField">+</button>
          <div class="col-sm-12 px-0" v-for="(type, index) in ApplicationTypes" :key="index">
            <div class="row my-0 mx-0">
              <div class="form-floating px-0 col-sm-5">
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="Content type"
                    v-model="type.contentType"/>
                <label for="floatingInput">Content type</label>
              </div>
              <div class="form-floating px-0 col-sm-5">
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="XML AIT Application type"
                    v-model="type.xmlAitApplicationType"/>
                <label for="floatingInput">XML AIT type</label>
              </div>
              <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
                :id="index"
                @click="delApplicationTypeField"
                :disabled="Names.length <= 0">-</button>
            </div>
          </div>
        </div>
        <div v-if="'DASHDelivery' in SelectedDeliveries" >
          <label for="dash_minimumbitrate">DASH Delivery: Minimum Bitrate</label>
          <input type="text" class="form-control my-2" id="dash_minimumbitrate" v-model="DASHDelivery.minimumBitRate"/>
          <input type="checkbox" class="form-check-input" id="dash_required" v-model="DASHDelivery.required"/>
          <label class="form-check-label" for="dash_required">DASH Delivery: required</label>
        </div>
        <div v-if="'RTSPDelivery' in SelectedDeliveries" >
          <label for="rtsp_minimumbitrate">RTSP Delivery: Minimum Bitrate</label>
          <input type="text" class="form-control my-2" id="rtsp_minimumbitrate" v-model="RTSPDelivery.minimumBitRate"/>
          <input type="checkbox" class="form-check-input" id="rtsp_required" v-model="RTSPDelivery.required"/>
          <label class="form-check-label" for="rtsp_required">RTSP Delivery: required</label>
        </div>
        <div v-if="'MulticastTSDelivery' in SelectedDeliveries" >
          <label for="multicast_minimumbitrate">Multicast TS Delivery: Minimum Bitrate</label>
          <input type="text" class="form-control my-2" id="multicast_minimumbitrate" v-model="MulticastTSDelivery.minimumBitRate"/>
          <input type="checkbox" class="form-check-input" id="multicast_required" v-model="MulticastTSDelivery.required"/>
          <label class="form-check-label" for="multicast_required">Multicast TS Delivery: required</label>
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
                  
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" v-on:click="removeLang" class="badge small bg-primary">x</span></li>
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
                  
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" v-on:click="removeCountry" class="badge small bg-primary">x</span></li>
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
                  
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" v-on:click="removeGenre" class="badge small bg-primary">x</span></li>
            </ul>
          </div>
      </div>

      <label>Regulator list:</label><br>
      <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio">
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" checked>
        <label class="btn btn-outline-primary" for="btnradioNo">No</label>
      </div>
  
    </div>

    <div class="col-md-4">

        <div class="input-group-append">
            <button class="btn btn-outline-primary" type="button"
            @click="submitNewList"
            :disabled="sending">
            Add List
            </button>
        </div>
        <p>{{ message }}</p>
    </div>

  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import ProviderDataService from "../../services/ProviderDataService"
import LoginService from "../../services/LoginService"
import { deliveries,genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"
import countries from "../../../../common/countries"
export default {
  name: "add-servicelist",
  data() {
    return {
      providers: [],
      deliveries: [],
      SelectedDeliveries: {},
      genres_ui: [],
      SelectedGenres: [],
      countries_ui: [],
      SelectedCountries: [],
      languages_ui: [],
      SelectedLanguages: [],
      Names: [{name:"", lang:""}],
      URI: "",
      lang: "",
      Provider: 0,
      regulatorList: 0,
      DVBCDelivery: { networkID: "", required: false},
      DVBSDelivery: {required: false},
      OrbitalPosition: [],
      DVBTDelivery: { required: false},
      ApplicationDelivery: {contentType: "", required: false},
      ApplicationTypes: [],
      RTSPDelivery: {required: false},
      MulticastTSDelivery: { required: false},
      DASHDelivery: {required: false},
      message: "",
      sending: false,
    };
  },
  methods: {
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          this.Provider = response.data[0].Id;
          //console.log("provirders:", response.data);
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
        
        var nameFound = false;
        for( var listname of this.Names) {
          console.log(listname);
          if(listname.name !== "") {
            nameFound = true;
            break;
          }
        }
        if(!nameFound) {
          console.log("derp");
          this.message = "List name required!";
          return;
        }

        this.sending = true

        const data = {
            Name: this.Name,
            Names: this.Names,
            URI: this.URI,
            lang: this.SelectedLanguages,
            Provider: this.Provider,
            regulatorList: this.regulatorList,
            Delivery: this.SelectedDeliveries,
            Countries: this.SelectedCountries,
            Genres: this.SelectedGenres
        } 
        if(this.ApplicationTypes && this.ApplicationDelivery) {
          this.ApplicationDelivery.ApplicationTypes = this.ApplicationTypes;
        }
        if(this.OrbitalPosition && this.DVBSDelivery) {
          this.DVBSDelivery.OrbitalPosition = this.OrbitalPosition;
        }
        for(const delivery of this.deliveries) {
          if(data.Delivery[delivery]) {
            data.Delivery[delivery] = this[delivery];
          }
        }

        ServiceListDataService.create(data)
            .then(response => {
                console.log(response)
                this.message = 'List created';
                setTimeout(() => {
                  this.$router.push({ name: "servicelists" });
                }, 2000)
            })
            .catch(error => {
                this.sending = false
               if( error.response.data.message ){
                this.message =  error.response.data.message; // => the response payload 
                }
                else {
                  this.message = error.message;
                }
                console.log(error);
            });
    },
    testURI(event) {
      event.preventDefault()
      window.open(this.URI, '_blank').focus()
    },
    addNameField() {
      this.Names.push({name: "", lang: ""})
    },
    addApplicationTypeField() {
      this.ApplicationTypes.push({contentType: "", xmlAitApplicationType: ""})
    },
    delApplicationTypeField(item) {
      console.log(item.target.id)
      if(this.ApplicationTypes.length > 0) {
        this.ApplicationTypes.splice(item.target.id, 1)
      }
    },
    addOrbitalPositionField() {
      this.OrbitalPosition.push("");
    },
    delOrbitalPositionField(item) {
      console.log(item.target.id)
      if(this.OrbitalPosition.length > 0) {
        this.OrbitalPosition.splice(item.target.id, 1)
      }
    },
    delNameField(item) {
      console.log(item.target.id)
      if(this.Names.length > 1) {
        this.Names.splice(item.target.id, 1)
      }
    },
    addDelivery(item) {
      const valid = this.deliveries.findIndex( elem => {
        return elem === item.target.value
      })

      if(valid !== -1) {
        
        if(!(item.target.value in this.SelectedDeliveries)) {
          this.SelectedDeliveries[item.target.value] = {};
        }
      }
      item.target.value = null
    },
    removeDelivery(item) {
      delete this.SelectedDeliveries[item.target.id];
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
    this.SelectedDeliveries[deliveries[0]] = {}
    this.countries_ui = countries
    this.languages_ui = languages
    this.genres_ui = genres
    
    this.retrieveProviders()
  }
};
</script>


<style scoped>
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}

</style>