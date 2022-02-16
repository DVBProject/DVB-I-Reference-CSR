 <template>

 <transition name="modal">
    <div v-if="confirmDelete">
      <div class="modal-mask">
        <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
          <div class="modal-dialog modal-dialog-centered" tabindex="-1" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Delete User</h5>
                <button type="button" class="close btn btn-outline-primary" data-dismiss="modal" aria-label="Close" @click="confirmDelete = !confirmDelete">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p>Please confirm, delete User?</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal" @click="confirmDelete = !confirmDelete">Cancel</button>
                <button type="button" class="btn btn-danger" @click="deleteUser">Delete</button>          
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <transition name="passwdModal">
    <div v-if="confirmPassword">
      <div class="modal-mask">
        <div class="modal-wrapper" role="dialog" aria-labelledby="exampleModalCenterTitle">
          <div class="modal-dialog modal-dialog-centered" tabindex="-1" role="document">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">Delete User</h5>
                <button type="button" class="close btn btn-outline-primary" data-dismiss="modal" aria-label="Close" @click="confirmPassword = !confirmPassword">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div class="modal-body">
                <p>PASSWD?</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-primary" data-dismiss="modal" @click="confirmPassword = !confirmPassword">Cancel</button>
                <button type="button" class="btn btn-danger" @click="changePassword">Change</button>          
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>


  <div v-if="currentUser"  class="list row">
    
  <div class="col-md-8">
    <h4>Edit user</h4>
    <form>

      <div class="form-group">
        <label for="URI">Name</label>
        <input type="text" class="form-control my-2" id="Name"
          v-model="currentUser.Name"
        />
        <p class="small text-warning">{{ nameMessage }}</p>
      </div>
      
      <div class="form-group">
        <label for="URI">E-mail</label>
        <input type="text" class="form-control my-2" id="Email"
          v-model="currentUser.Email"
        />
        <p class="small text-warning">{{ emailMessage }}</p>
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
        :disabled="currentUser.Id == 1"
      >
        Delete
      </button>

      <button type="submit" class="btn btn-outline-primary"
        @click="updateUser"
      >
        Update
      </button>
    </div>
    <p class="small ">{{ message }}</p>
  </div>

  </div>
  <div v-else>
    <br />
    <p>User was not found...</p>
  </div>
</template>

<script>
import ProviderDataService from "../../services/ProviderDataService"
import UserDataService from "../../services/UserDataService"


export default {
  name: "user-edit",
  data() {
    return {
      confirmDelete: false,
      confirmPassword: false,
      currentUser: null,
      message: '',
      emailMessage: '',

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
            try {
              this.currentUser.Providers = JSON.parse(this.currentUser.Providers)
            } catch {
              console.log("Could not parse", this.currentUser.Providers)
            }
            this.getProviders()
        })
        .catch(e => {
            console.log(e);
            // some error when fetching data, return to the list list
            
            setTimeout(() => {
                this.$router.push({ name: "servicelists" });
            }, 2000)
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
            }, 2000)
        })
    },

    validateFields() {
      this.nameMessage = ""
      this.emailMessage = ""
      this.message = ""
      let valid = true

      if(this.currentUser.Name == "") {
          this.nameMessage = "Name cannot be empty"
          valid = false
      }

      if(this.currentUser.Email !== "") {    
        if(!this.currentUser.Email.includes("@")) {
            this.emailMessage = "Please check that the e-mail is correct"
            valid = false
        }
        else if(!this.currentUser.Email.split("@")[1].includes(".")) {
            this.emailMessage = "Please check that the e-mail is correct"
            valid = false
        }
      }
      

      if(!valid) {
        this.message = "Please check all missing fields"        
      }

      return valid
    },

    updateUser() {
        if( !this.validateFields() ) return
        let prov = []
        
        this.SelectedProviders.forEach(sp => prov.push(+sp.value))
        const data = { 
            ...this.currentUser,
            Providers: JSON.stringify(prov),
            Role: this.admin ? "admin" : "user"
        }
        
        UserDataService.update(this.currentUser.Id, data)
            .then(response => {
              console.log(response.data);
              this.message = 'The user was updated successfully!'

              setTimeout(() => {
                this.$router.push({ name: "admin" })
              }, 2000)
            })
            .catch(e => {
              console.log(e);
              this.message = 'Error updating user'
            })
    },

    deleteUser() {
      UserDataService.delete(this.currentUser.Id)
        .then(response => {
          console.log(response.data);
          this.message = 'The user was deleted';

          setTimeout(() => {
            this.$router.push({ name: "admin" });
          }, 2000)
        })
        .catch(e => {
          console.log(e);
          this.message = 'Error deleting user';
        });
    },

    changePassword() {
      // todo
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
    this.getUser(this.$route.params.id)
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