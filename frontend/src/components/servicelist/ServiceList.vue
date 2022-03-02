 <template>

 <transition name="modal">
    <div v-if="confirmDelete">
      <div class="modal-mask">
        <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
          <div class="modal-dialog modal-dialog-centered" tabindex="-1" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Delete List</h5>
                <button type="button" class="close btn btn-outline-primary" data-dismiss="modal" aria-label="Close" @click="confirmDelete = !confirmDelete">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p>Please confirm, delete Service List?</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal" @click="confirmDelete = !confirmDelete">Cancel</button>
                <button type="button" class="btn btn-danger" @click="deleteList" :disabled="sending">Delete</button>          
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>


  <div v-if="currentList"  class="list row">
    
  <div class="col-md-8">
    <h4>{{ newList ? "Add Service List" : "Edit Service List" }}</h4>
    <form>
      <div class="form-group">
        <label for="Name">Names</label>

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
      </div>

      <div class="form-group">
        <label for="Name">URI</label>

        <button class="btn btn-outline-primary mx-2 mb-1" type="button"
            @click="addURIField"
          >
        +
        </button>
        <div class="input-group mb-3">          
          <div class="col-sm-12 px-0"
              v-for="(name, index) in currentList.URI"
              :key="index">      

            <div class="row my-0 mx-0">

              <div class="form-floating px-0 col-sm-5">          
                <input type="text" id="floatingInput" class="form-control mb-1" placeholder="URI"
                    v-model="currentList.URI[index]"/>
                <label for="floatingInput">URI</label>
              </div>

            <button class="btn btn-outline-danger mx-3 mb-1 col-sm-1" type="button"
              :id="index"
              @click="delURIField"
              :disabled="Names.length <= 1"
            >-</button>
            <button class="btn btn-outline-primary mx-3 mb-1 col-sm-2"
            @click="testURI($event,index)"
          >
          Test
          </button> 
            </div>

          </div>        
        </div>
      </div>

      <div class="form-group">
        <label for="Provider">Provider</label>
        <select v-if="newList" class="form-control my-2" placeholder="Provider"
          v-model="currentList.Provider">
        <option
            v-for="item in providers"
            v-bind:key="item.Id"
            v-bind:value="item.Id"
         >{{item.Names[0].name}}</option>
      </select>
      <input v-else type="text" class="form-control my-2" id="Provider"
          v-model="currentList.Provider"
        />
      </div>

      <div class="my-2">      
        <label for="deliveriesDataList" class="form-label">Deliveries:</label>        
        <input class="form-control" list="datalistOptionsDeliveries" 
            id="deliveriesDataList" placeholder="Type to search..."
            v-on:change="addDelivery"
            v-on:click="addDelivery">
          <datalist id="datalistOptionsDeliveries">
            <option
                v-for="(item, index) in deliveries_ui"
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
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="currentList.regulatorList">
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!currentList.regulatorList">
        <label class="btn btn-outline-primary" for="btnradioNo">No</label>
      </div>


    </form>
    
  </div>
  <div class="col-md-4">
    <div class="btn-group btn-group-sm my-2" role="group">
      <button v-if="!newList" class="btn btn-outline-danger mr-2"
        @click="confirmDelete = !confirmDelete"
      >
        Delete
      </button>

      <button type="submit" class="btn btn-outline-primary"
        @click="updateList"
        :disabled="sending"
      >
        {{ newList ? "Add List" :"Update"  }}
      </button>
    </div>
    <p>{{ message }}</p>
  </div>

  </div>
  <div v-else>
    <br />
    <p>Service List was not found...</p>
  </div>
</template>

<script>
import ServiceListDataService from "../../services/ServiceListDataService"
import ProviderDataService from "../../services/ProviderDataService"
import countries from "../../../../common/countries"
import { deliveries, genres } from "../../../../common/dev_constants"
import languages from "../../../../common/languages"

export default {
  name: "servicelist-edit",
  data() {
    return {
      confirmDelete: false,
      currentList: null,
      message: '',

      deliveries_ui: [],
      SelectedDeliveries: {},
      genres_ui: [],
      SelectedGenres: [],
      countries_ui: [],
      SelectedCountries: [],
      languages_ui: [],
      SelectedLanguages: [],
      Names: [],
      DVBCDelivery: { networkID: "", required: false},
      DVBSDelivery: {required: false},
      OrbitalPosition: [],
      DVBTDelivery: { required: false},
      ApplicationDelivery: {contentType: "", required: false},
      ApplicationTypes: [],
      RTSPDelivery: {required: false},
      MulticastTSDelivery: { required: false},
      DASHDelivery: {required: false},
      sending: false,
      newList: false,
      providers: [],
    };
  },
  methods: {
    getList(id) {
      ServiceListDataService.get(id)
        .then(response => {
          this.currentList = response.data;
          try {
            this.SelectedDeliveries = this.currentList.Delivery;
            if(Array.isArray(this.SelectedDeliveries) || typeof this.SelectedDeliveries !== 'object') {
              this.SelectedDeliveries = {};
            }
            for(const delivery of this.deliveries_ui) {
              if(this.SelectedDeliveries[delivery]) {
                this[delivery] = this.SelectedDeliveries[delivery];
              }
            }
            if(this.ApplicationDelivery && this.ApplicationDelivery.ApplicationTypes) {
              this.ApplicationTypes = this.ApplicationDelivery.ApplicationTypes;
            }
            if(this.DVBSDelivery && this.DVBSDelivery.OrbitalPosition) {
              this.OrbitalPosition = this.DVBSDelivery.OrbitalPosition;
            }
          } catch (e) {
            console.log(e);
            this.SelectedDeliveries = {};
          }
          for(var genre in this.currentList.Genres) {
            this.addGenre(this.currentList.Genres[genre])
          }
          for(var item in this.currentList.languages) {
            this.addLang(this.currentList.languages[item].Language)
          }
          for(var cn in this.currentList.targetCountries) {
            this.addCountry(this.currentList.targetCountries[cn].country)
          }
          this.Names = this.currentList.Names
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
          // some error when fetching data, return to the list list
          //LoginService.reset()
          setTimeout(() => {
            this.$router.push({ name: "servicelists" });
          }, 2000)
        });
    },
    updateList() {
      const data = { 
        ...this.currentList,
        Delivery: this.SelectedDeliveries,
        lang: this.SelectedLanguages,
        Countries: this.SelectedCountries,
        Genres: this.SelectedGenres,
        Names: this.Names
      }
      if(this.ApplicationTypes && this.ApplicationDelivery) {
        this.ApplicationDelivery.ApplicationTypes = this.ApplicationTypes;
      }
      if(this.OrbitalPosition && this.DVBSDelivery) {
        this.DVBSDelivery.OrbitalPosition = this.OrbitalPosition;
      }
      for(const delivery of this.deliveries_ui) {
        if(data.Delivery[delivery]) {
          data.Delivery[delivery] = this[delivery];
        }
      }

      this.sending = true
      //console.log("POST",this.currentList.Id, /*this.currentList*/ data);
      if(this.newList) {
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
      }
      else {
      ServiceListDataService.update(this.currentList.Id, data)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was updated successfully!';

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
        });
      }
    },
    deleteList() {
      this.sending = true
      ServiceListDataService.delete(this.currentList.Id)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was deleted';

          setTimeout(() => {
            this.$router.push({ name: "servicelists" });
          }, 2000)
        })
        .catch(e => {
          this.sending = false
          console.log(e);
          this.message = 'Error deleting list';
        });
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
    addURIField() {
      this.currentList.URI.push("");
    },
    delURIField(item) {
      console.log(item.target.id)
      if(this.currentList.URI.length > 1) {
        this.currentList.URI.splice(item.target.id, 1)
      }
    },

    addNameField() {
      this.Names.push({name: "", lang: ""})
    },
    delNameField(item) {
      console.log(item.target.id)
      if(this.Names.length > 1) {
        this.Names.splice(item.target.id, 1)
      }
    },
    addDelivery(item) {
      const valid = this.deliveries_ui.findIndex( elem => {
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
    addGenre(item) {
      const value = item.target ? item.target.value : item
      const valid = genres[value] !== undefined

      if(valid) {
          this.SelectedGenres.push({ name: genres[value], value: value});
      }

      if(item.target) item.target.value = null
    },
    removeGenre(item) {
      console.log(item.target.id)
      this.SelectedGenres.splice(item.target.id, 1)
    },

    addLang(item) {
      //console.log(item.target.value)
      const value = item.target ? item.target.value : item
      if(value.length === 2) {
        const valid = languages[value] !== undefined

        if(valid) {
          this.SelectedLanguages.push({name: languages[value].name, a3: value})
        }
        else {
          console.log("not valid", value)
        }
      }
      if(item.target) item.target.value = null
    },
    removeLang(item) {
      this.SelectedLanguages.splice(item.target.id, 1)
    },

    addCountry(item) {
      //console.log(item.target.value)
      const value = item.target ? item.target.value : item
      const valid = this.countries_ui[value];
      if(valid) {
        this.SelectedCountries.push({name: valid.name, code: value})
      }

      if(item.target) item.target.value = null
    },
    removeCountry(item) {
      //console.log("remove:", item.target.id)
      this.SelectedCountries.splice(item.target.id, 1)
    },

    regulatorRadio(item) {
      if(item.target.id === "btnradioYes") {
        this.currentList.regulatorList = 1
      } 
      else {
        this.currentList.regulatorList = 0
      }
    },

    testURI($event,item) {
      console.log(item,$event);
      $event.preventDefault()
      window.open(this.currentList.URI[item], '_blank').focus()
    },
    retrieveProviders() {
      ProviderDataService.getAll()
        .then(response => {
          this.providers = response.data;
          if(response.data.length == 0) {
            this.message = "No providers available, create a provider first!"
          }
          else {
            this.currentList.Provider = response.data[0].Id;
          }
          //console.log("provirders:", response.data);
        })
        .catch(e => {
          console.log(e);
          // TODO: move this handler the service module
          // error with fetch (unauthorized)
          // clear session data & re-login
        });
    },


  },
  mounted() {
    this.message = '';

    this.deliveries_ui = deliveries
    this.countries_ui = countries
    this.languages_ui = languages
    this.genres_ui = genres
    if(this.$route.params.id) {
      this.getList(this.$route.params.id);
    }
    else {
      this.newList = true;
      this.Names =  [{name:"", lang:""}],
      this.SelectedDeliveries[deliveries[0]] = {}
      this.currentList = {
      URI: [""],
      Provider: 0,
      regulatorList: 0,
      }
      this.retrieveProviders();
    }
  }
};
</script>

<style scoped>
.edit-form {
  max-width: 300px;
  margin: auto;
}
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}
</style>