 <template>
  <div v-if="currentList"  class="list row">
    
  <div class="col-md-8">
    <h4>Edit Service List</h4>
    <form>
      <div class="form-group">
        <label for="title">Name</label>
        <input type="text" class="form-control my-2" id="Name"
          v-model="currentList.Name"
        />
      </div>

      
      <div class="form-group">
        <label for="description">URI</label>
        <input type="text" class="form-control my-2" id="URI"
          v-model="currentList.URI"
        />
      </div>

      <div class="form-group">
        <label for="description">Provider</label>
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
                v-bind:value="item.alpha3"
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
                v-bind:value="item"
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
                  class="btn btn-outline-primary mx-1 my-1">{{item}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
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



    <button class="badge badge-danger mr-2"
      @click="deleteList"
    >
      Delete
    </button>

    <button type="submit" class="badge badge-success"
      @click="updateList"
    >
      Update
    </button>
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
import countries from "../../../../common/countries"
import { deliveries, genres } from "../../../dev_constants/dev_constants"
import languages from "../../../../common/languages"

export default {
  name: "servicelist-edit",
  data() {
    return {
      currentList: null,
      message: '',

      deliveries_ui: [],
      SelectedDeliveries: [],
      genres_ui: [],
      SelectedGenres: [],
      countries_ui: [],
      SelectedCountries: [],
      languages_ui: [],
      SelectedLanguages: [],
    };
  },
  methods: {
    getList(id) {
      ServiceListDataService.get(id)
        .then(response => {
          this.currentList = response.data;

          let deliv = [] 
          try {
            deliv = JSON.parse(this.currentList.Delivery)
          } catch {
            deliv.push(this.currentList.Delivery)
          }
          
          for(var de in deliv) {
            this.SelectedDeliveries.push(deliv[de])
          }
          this.SelectedGenres = this.currentList.Genres
          for(var item in this.currentList.languages) {
            this.addLang(this.currentList.languages[item].Language)
          }
          for(var cn in this.currentList.targetCountries) {
            this.addCountry(this.currentList.targetCountries[cn].country)
          }
          console.log(response.data);
        })
        .catch(e => {
          console.log(e);
        });
    },
    updateList() {
      const data = { 
        ...this.currentList,
        Delivery: this.SelectedDeliveries,
        lang: this.SelectedLanguages,
        Countries: this.SelectedCountries,
        Genres: this.SelectedGenres
      }
        console.log("POST",this.currentList.Id, /*this.currentList*/ data);
      ServiceListDataService.update(this.currentList.Id, data)
        .then(response => {
          console.log(response.data);
          this.message = 'The list was updated successfully!';

          setTimeout(() => {
            this.$router.push({ name: "servicelists" });
          }, 1000)
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
          }, 1000)
        })
        .catch(e => {
          console.log(e);
          this.message = 'Error deleting list';
        });
    },

    addDelivery(item) {
      const valid = this.deliveries_ui.findIndex( elem => {
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
      console.log(item.target.id)
      if(this.SelectedDeliveries.length > 1) {
        this.SelectedDeliveries.splice(item.target.id, 1)
      }
    },
    addGenre(item) {
      const valid = this.genres_ui.findIndex( elem => {
        return elem === item.target.value
      })

      if(valid !== -1) {
        const index = this.SelectedGenres.findIndex( elem => {
          return elem === item.target.value
        })

        if(index === -1) {
          this.SelectedGenres.push(item.target.value)
        }
      }

      item.target.value = null
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
      let name = ""
      const valid = this.countries_ui.findIndex( elem => {        
        return elem.alpha3 === value
      })
      
      if(valid !== -1) {
        name = this.countries_ui[valid].name
        const index = this.SelectedCountries.findIndex( elem => {
          return elem.code === value
        })
        
        if(index === -1) {
          this.SelectedCountries.push({name: name, code: value})
        }
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
    }


  },
  mounted() {
    this.message = '';

    this.deliveries_ui = deliveries
    this.countries_ui = countries
    this.languages_ui = languages

    for (var index in genres) {      
      this.genres_ui.push(genres[index])
    }

    this.getList(this.$route.params.id);
  }
};
</script>

<style>
.edit-form {
  max-width: 300px;
  margin: auto;
}
.list {
  text-align: left;
  max-width: 750px;
  margin: auto;
}
</style>