 <template>

  <div class="list row">
    
  <div class="col-md-8">
    <h4>ADD user</h4>
    <form>

      <div class="form-group">
        <label for="URI">Name</label>
        <input type="text" class="form-control my-2" id="Name"
          v-model="currentUser.Name"
        />
      </div>
      
      <div class="form-group">
        <label for="URI">E-mail</label>
        <input type="text" class="form-control my-2" id="Email"
          v-model="currentUser.Email"
        />
      </div>

      <div class="form-group">
        <label for="Provider">Providers</label>
        <input type="text" class="form-control my-2" id="Provider" disabled
          v-model="currentUser.Providers"
        />
      </div>






      <div class="my-2">
        <label for="genreDataList" class="form-label">Providers:</label>
        <input class="form-control" list="datalistOptionsGenre"
            id="genreDataList" placeholder="Type to search..."
            v-on:change="addProvider"
            v-on:click="addProvider">
            <datalist id="datalistOptionsGenre">
            <option
                v-for="(item, index) in providers_ui"
                v-bind:key="index"
                v-bind:value="item.Id"
                >
                {{item.Names[0].name}}
            </option>
          </datalist>

          <div class="btn-group">
            <ul class="px-0 btn-group-sm">
              <li v-for="(item, index) in SelectedProviders" 
                  v-bind:id="index"
                  v-bind:key="index"
                  v-on:click="removeProvider"
                  class="btn btn-outline-primary mx-1 my-1">{{item.name}} <span v-bind:id="index" class="badge small bg-primary">x</span></li>
            </ul>
          </div>
      </div>


      <label>Admin:</label><br>
      <div class="btn-group btn-group-sm my-2" role="group" aria-label="Basic radio toggle button group">
        <input type="radio" class="btn-check" name="btnradio" id="btnradioYes" autocomplete="off" @change="regulatorRadio" :checked="admin" :disabled="currentUser.Id == 1">
        <label class="btn btn-outline-primary" for="btnradioYes">Yes</label>
 
        <input type="radio" class="btn-check" name="btnradio" id="btnradioNo" autocomplete="off" @change="regulatorRadio" :checked="!admin" :disabled="currentUser.Id == 1">
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
        @click="updateUser"
      >
        Update
      </button>
    </div>
    <p>{{ message }}</p>
  </div>

  </div>

</template>

<script>
//import ServiceListDataService from "../../services/ServiceListDataService"

import ProviderDataService from "../../services/ProviderDataService"
import UserDataService from "../../services/UserDataService"


export default {
  name: "user-add",
  data() {
    return {
      confirmDelete: false,
      currentUser: null,
      message: '',

      providers_ui: [],
      SelectedProviders: [],

      admin: false,
      Names: [],
    };
  },
  methods: {
    getUser(id) {
      UserDataService.get(id)
        .then(response => {
            this.currentUser = response.data[0]

            this.Names = this.currentUser.Names
            console.log(response.data);
            this.admin = this.currentUser.Role == "admin" ? true : false
            this.getProviders()
        })
        .catch(e => {
            console.log(e);
            // some error when fetching data, return to the list list
            
            setTimeout(() => {
                this.$router.push({ name: "servicelists" });
            }, 1000)
        })
    },
    getProviders() {
        ProviderDataService.getAll()
        .then(response => {
            this.providers_ui = response.data
            if(this.currentUser) {                
                for(var prov in this.currentUser.Providers) {
                    this.addProvider(this.currentUser.Providers[prov])
                }                
            }
        })
        .catch(e => {
            console.log(e)
            setTimeout(() => {
                this.$router.push({ name: "admin" });
            }, 1000)
        })
    },

    updateUser() {
        let prov = []
        this.SelectedProviders.forEach(sp => prov.push(sp.value))
        const data = { 
            ...this.currentUser,
            Providers: prov,
            Role: this.admin ? "admin" : "user"
        }
        console.log("POST",this.currentUser.Id, data);
        return
        /*
        UserDataService.update(this.currentUser.Id, data)
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
            });*/
    },

    deleteUser() {
      UserDataService.delete(this.currentUser.Id)
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


    addProvider(item) {
        const value = item.target ? item.target.value : item
        const valid = this.providers_ui.find(el => {
            return el.Id === +value
        })   
        if(valid) {
            this.SelectedProviders.push({ name: valid.Names[0].name, value: value});
        }

        if(item.target) item.target.value = null
    },
    removeProvider(item) {
        console.log(item.target.id)
        this.SelectedProviders.splice(item.target.id, 1)
    },



    regulatorRadio(item) {
        if(item.target.id === "btnradioYes") {
            this.admin = true
        } 
        else {
            this.admin = false
        }        
    }


  },
  mounted() {
    this.message = '';
    //this.getUser(this.$route.params.id)
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