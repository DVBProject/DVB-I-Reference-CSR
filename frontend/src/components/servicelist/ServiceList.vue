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
                <button type="button" class="btn btn-danger" @click="deleteList">Delete</button>          
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>


  <div v-if="currentList"  class="list row">
    
  <div class="col-md-8">
    <h4>Edit Service List</h4>
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
      <label for="URI">URI</label>
        <div class="row my-0 mx-0 px-0">
        <div class="px-0 col-sm-10">
        <input type="text" class="form-control my-2" id="URI"
          v-model="currentList.URI"
        />
        </div>
        <div class="btn-group-sm my-0 mx-0 px-0 col-sm-2">
          <button class="btn btn-outline-primary mt-2 py-2 col-sm-12"
            @click="testURI"
          >
          Test
          </button> 
        </div>
        </div>
      </div>

      <div class="form-group">
        <label for="Provider">Provider</label>
        <input type="text" class="form-control my-2" id="Provider" disabled
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
        <div v-if="'DVBCDelivery' in SelectedDeliveries" >
          <label for="network_id">DVB-C Delivery: Network ID</label>
          <input type="text" class="form-control my-2" id="network_id" v-model="DVBCDelivery.networkID"/>
        </div>
        <div v-if="'ApplicationDelivery' in SelectedDeliveries" >
          <label for="content_type">Appliction Delivery: Content type</label>
          <input type="text" class="form-control my-2" id="content_type" v-model="ApplicationDelivery.contentType"/>
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
      <button class="btn btn-outline-danger mr-2"
        @click="confirmDelete = !confirmDelete"
      >
        Delete
      </button>

      <button type="submit" class="btn btn-outline-primary"
        @click="updateList"
      >
        Update
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
//import LoginService from "../../services/LoginService"
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
      DVBCDelivery: { networkID: ""},
      ApplicationDelivery: { contentType: ""},
    };
  },
  methods: {
    getList(id) {
      ServiceListDataService.get(id)
        .then(response => {
          this.currentList = response.data;
          try {
            this.SelectedDeliveries = JSON.parse(this.currentList.Delivery)
            if(this.SelectedDeliveries.DVBCDelivery) {
              this.DVBCDelivery = this.SelectedDeliveries.DVBCDelivery;
            }
            if(this.SelectedDeliveries.ApplicationDelivery) {
              this.ApplicationDelivery = this.SelectedDeliveries.ApplicationDelivery;
            }
          } catch {
            this.SelectedDeliveries[this.currentList.Delivery] = {};
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
      if(data.Delivery.DVBCDelivery) {
        data.Delivery.DVBCDelivery = this.DVBCDelivery;
      }
      if(data.Delivery.ApplicationDelivery ) {
        data.Delivery.ApplicationDelivery = this.ApplicationDelivery;
      }
      //console.log("POST",this.currentList.Id, /*this.currentList*/ data);
      ServiceListDataService.update(this.currentList.Id, data)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was updated successfully!';

          setTimeout(() => {
            this.$router.push({ name: "servicelists" });
          }, 2000)
        })
        .catch(e => {
          console.log(e);
          this.message = 'Error updating list';
        });
    },
    deleteList() {
      ServiceListDataService.delete(this.currentList.Id)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was deleted';

          setTimeout(() => {
            this.$router.push({ name: "servicelists" });
          }, 2000)
        })
        .catch(e => {
          console.log(e);
          this.message = 'Error deleting list';
        });
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

    testURI(event) {
      event.preventDefault()
      window.open(this.currentList.URI, '_blank').focus()
    },


  },
  mounted() {
    this.message = '';

    this.deliveries_ui = deliveries
    this.countries_ui = countries
    this.languages_ui = languages
    this.genres_ui = genres
    this.getList(this.$route.params.id);
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